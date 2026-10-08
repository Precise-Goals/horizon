import { describe, expect, it } from 'bun:test';
import { DependencyGraph } from './dependencyGraph';
import type { SystemNode } from '../types';

describe('Web DependencyGraph Engine (apps/web/src/engine)', () => {
  const createTestGraph = (): DependencyGraph => {
    const graph = new DependencyGraph();
    const nodes: SystemNode[] = [
      {
        id: 'db-master',
        name: 'Database Master',
        type: 'database',
        status: 'healthy',
        dependencies: [],
      },
      {
        id: 'redis-cache',
        name: 'Redis Cache',
        type: 'cache',
        status: 'healthy',
        dependencies: ['db-master'],
      },
      {
        id: 'api-service',
        name: 'API Service',
        type: 'application',
        status: 'healthy',
        dependencies: ['db-master', 'redis-cache'],
      },
      {
        id: 'web-client',
        name: 'Web Client',
        type: 'gateway',
        status: 'healthy',
        dependencies: ['api-service'],
      },
    ];

    for (const n of nodes) {
      graph.addNode(n);
    }
    graph.addDependency('redis-cache', 'db-master');
    graph.addDependency('api-service', 'db-master');
    graph.addDependency('api-service', 'redis-cache');
    graph.addDependency('web-client', 'api-service');

    return graph;
  };

  it('manages nodes and detects acyclic structure', () => {
    const graph = createTestGraph();
    expect(graph.getAllNodes().length).toBe(4);
    expect(graph.hasCycle()).toBe(false);
  });

  it('detects cycles when circular dependencies are introduced', () => {
    const graph = new DependencyGraph();
    const nodeA: SystemNode = {
      id: 'A',
      name: 'A',
      type: 'application',
      status: 'healthy',
      dependencies: [],
    };
    const nodeB: SystemNode = {
      id: 'B',
      name: 'B',
      type: 'application',
      status: 'healthy',
      dependencies: [],
    };

    graph.addNode(nodeA);
    graph.addNode(nodeB);
    graph.addDependency('A', 'B');
    graph.addDependency('B', 'A');

    expect(graph.hasCycle()).toBe(true);
  });

  it('computes downstream blast radius accurately', () => {
    const graph = createTestGraph();
    const blast = graph.computeBlastRadius('db-master');

    expect(blast.targetNodeId).toBe('db-master');
    expect(blast.affectedNodeIds).toContain('redis-cache');
    expect(blast.affectedNodeIds).toContain('api-service');
    expect(blast.affectedNodeIds).toContain('web-client');
    expect(blast.affectedNodeIds.length).toBe(3);
    expect(blast.severity).toBe('high');
    expect(blast.cascadeDepth).toBeGreaterThanOrEqual(2);
  });

  it('computes topological recovery order with base dependencies first', () => {
    const graph = createTestGraph();
    const order = graph.getTopologicalRecoveryOrder();

    expect(order.indexOf('db-master')).toBeLessThan(order.indexOf('redis-cache'));
    expect(order.indexOf('redis-cache')).toBeLessThan(order.indexOf('api-service'));
    expect(order.indexOf('api-service')).toBeLessThan(order.indexOf('web-client'));
  });
});
