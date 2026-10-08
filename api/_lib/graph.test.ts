import { describe, expect, it } from 'bun:test';
import { DependencyGraphEngine } from './graph';
import type { SystemNode } from '../../packages/shared/src/index';

describe('DependencyGraphEngine (API Logic)', () => {
  const sampleNodes: SystemNode[] = [
    {
      id: 'db-primary',
      name: 'PostgreSQL Primary',
      type: 'database',
      status: 'healthy',
      dependencies: [],
      consecutive_failures: 0,
      sim: { healthy: true },
    },
    {
      id: 'redis-cache',
      name: 'Redis Cache',
      type: 'cache',
      status: 'healthy',
      dependencies: ['db-primary'],
      consecutive_failures: 0,
      sim: { healthy: true },
    },
    {
      id: 'auth-service',
      name: 'Auth Service',
      type: 'application',
      status: 'healthy',
      dependencies: ['db-primary', 'redis-cache'],
      consecutive_failures: 0,
      sim: { healthy: true },
    },
    {
      id: 'api-gateway',
      name: 'API Gateway',
      type: 'gateway',
      status: 'healthy',
      dependencies: ['auth-service'],
      consecutive_failures: 0,
      sim: { healthy: true },
    },
    {
      id: 'web-frontend',
      name: 'Web Frontend',
      type: 'application',
      status: 'healthy',
      dependencies: ['api-gateway'],
      consecutive_failures: 0,
      sim: { healthy: true },
    },
  ];

  it('detects no cycles in a well-formed DAG', () => {
    const engine = new DependencyGraphEngine(sampleNodes);
    const result = engine.detectCycle();
    expect(result.hasCycle).toBe(false);
    expect(result.cyclePath).toEqual([]);
  });

  it('detects circular dependencies when present', () => {
    const cyclicNodes: SystemNode[] = [
      {
        id: 'node-a',
        name: 'Node A',
        type: 'application',
        status: 'healthy',
        dependencies: ['node-b'],
        consecutive_failures: 0,
        sim: { healthy: true },
      },
      {
        id: 'node-b',
        name: 'Node B',
        type: 'application',
        status: 'healthy',
        dependencies: ['node-c'],
        consecutive_failures: 0,
        sim: { healthy: true },
      },
      {
        id: 'node-c',
        name: 'Node C',
        type: 'application',
        status: 'healthy',
        dependencies: ['node-a'],
        consecutive_failures: 0,
        sim: { healthy: true },
      },
    ];

    const engine = new DependencyGraphEngine(cyclicNodes);
    const result = engine.detectCycle();
    expect(result.hasCycle).toBe(true);
    expect(result.cyclePath.length).toBeGreaterThan(0);
  });

  it('computes correct reverse blast radius for root dependency failure', () => {
    const engine = new DependencyGraphEngine(sampleNodes);
    const blast = engine.getBlastRadius('db-primary');

    // Failing db-primary affects redis-cache, auth-service, api-gateway, web-frontend
    expect(blast).toContain('db-primary');
    expect(blast).toContain('redis-cache');
    expect(blast).toContain('auth-service');
    expect(blast).toContain('api-gateway');
    expect(blast).toContain('web-frontend');
    expect(blast.length).toBe(5);
  });

  it('computes minimal blast radius for leaf node failure', () => {
    const engine = new DependencyGraphEngine(sampleNodes);
    const blast = engine.getBlastRadius('web-frontend');

    // Nothing depends on web-frontend
    expect(blast).toEqual(['web-frontend']);
  });

  it('computes topological recovery levels with foundational dependencies first', () => {
    const engine = new DependencyGraphEngine(sampleNodes);
    const affected = engine.getBlastRadius('db-primary');
    const levels = engine.computeTopologicalRecoveryLevels(affected);

    expect(levels.length).toBeGreaterThanOrEqual(3);
    // Level 0 should contain db-primary (has no dependencies inside affected set)
    expect(levels[0]).toContain('db-primary');

    // Flattening and checking dependencies satisfy ordering
    const flattened = levels.flat();
    expect(flattened.indexOf('db-primary')).toBeLessThan(flattened.indexOf('redis-cache'));
    expect(flattened.indexOf('redis-cache')).toBeLessThan(flattened.indexOf('auth-service'));
    expect(flattened.indexOf('auth-service')).toBeLessThan(flattened.indexOf('api-gateway'));
    expect(flattened.indexOf('api-gateway')).toBeLessThan(flattened.indexOf('web-frontend'));
  });
});
