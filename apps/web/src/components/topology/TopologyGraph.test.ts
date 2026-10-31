import { describe, expect, it } from 'bun:test';
import { TopologyGraph } from './TopologyGraph';
import { clusterState } from '../../engine/state';

describe('TopologyGraph Component & Autonomous DAG Suite', () => {
  it('exports TopologyGraph as a valid React functional component', () => {
    expect(TopologyGraph).toBeDefined();
    expect(typeof TopologyGraph).toBe('function');
  });

  it('validates 7 enterprise nodes in cluster state', () => {
    const nodes = clusterState.getNodes();
    expect(nodes.length).toBeGreaterThanOrEqual(7);

    const ids = nodes.map((n) => n.id);
    expect(ids).toContain('db-primary');
    expect(ids).toContain('db-replica');
    expect(ids).toContain('redis-cache');
    expect(ids).toContain('auth-service');
    expect(ids).toContain('payment-service');
    expect(ids).toContain('api-gateway');
    expect(ids).toContain('web-frontend');
  });

  it('verifies DAG is cycle-free with Kahn topological sort', () => {
    const graph = clusterState.getGraph();
    expect(graph.hasCycle()).toBe(false);

    const order = graph.getTopologicalRecoveryOrder();
    expect(order).toBeDefined();
    expect(order.length).toBe(7);

    // Root database must be restored before dependent microservices
    const dbIndex = order.indexOf('db-primary');
    const authIndex = order.indexOf('auth-service');
    const gatewayIndex = order.indexOf('api-gateway');
    const webIndex = order.indexOf('web-frontend');

    expect(dbIndex).toBeLessThan(authIndex);
    expect(authIndex).toBeLessThan(gatewayIndex);
    expect(gatewayIndex).toBeLessThan(webIndex);
  });

  it('verifies reverse blast radius calculation for root db outage', () => {
    const graph = clusterState.getGraph();
    const blast = graph.computeBlastRadius('db-primary');

    expect(blast.targetNodeId).toBe('db-primary');
    // Primary DB failure cascades to cache, replica, auth, payment, gateway, web
    expect(blast.affectedNodeIds).toContain('redis-cache');
    expect(blast.affectedNodeIds).toContain('db-replica');
    expect(blast.affectedNodeIds).toContain('auth-service');
    expect(blast.affectedNodeIds).toContain('payment-service');
    expect(blast.affectedNodeIds).toContain('api-gateway');
    expect(blast.affectedNodeIds).toContain('web-frontend');
    expect(blast.severity).toBe('critical');
  });

  it('verifies minimal leaf blast radius for web frontend outage', () => {
    const graph = clusterState.getGraph();
    const blast = graph.computeBlastRadius('web-frontend');

    expect(blast.targetNodeId).toBe('web-frontend');
    // Frontend is an edge leaf node; downtime should not cascade to core databases
    expect(blast.affectedNodeIds.length).toBe(0);
    expect(blast.severity).toBe('low');
  });
});
