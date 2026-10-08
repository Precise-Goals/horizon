/**
 * Horizon Unified Serverless API Entrypoint (Hono on Vercel Functions)
 * Serves /api/v1/* routes for cluster health, nodes, chaos injection, tick execution, and BridgeKey approvals.
 */
import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { DependencyGraphEngine } from '../_lib/graph';
import { getPlaybookForType } from '../_lib/playbooks';
import type { SystemNode, Incident } from '../../packages/shared/src/index';

export const config = {
  runtime: 'edge',
};

const app = new Hono().basePath('/api/v1');

// In-memory runtime state for serverless execution / demo container
let clusterNodes: SystemNode[] = [
  { id: 'db-primary', name: 'PostgreSQL Primary', type: 'database', status: 'healthy', dependencies: [], consecutive_failures: 0, sim: { healthy: true } },
  { id: 'db-replica', name: 'PostgreSQL Replica', type: 'database', status: 'healthy', dependencies: ['db-primary'], consecutive_failures: 0, sim: { healthy: true } },
  { id: 'redis-cache', name: 'Redis Cache', type: 'cache', status: 'healthy', dependencies: ['db-primary'], consecutive_failures: 0, sim: { healthy: true } },
  { id: 'auth-service', name: 'Auth Service', type: 'application', status: 'healthy', dependencies: ['db-primary', 'redis-cache'], consecutive_failures: 0, sim: { healthy: true } },
  { id: 'api-gateway', name: 'API Gateway', type: 'gateway', status: 'healthy', dependencies: ['auth-service', 'redis-cache'], consecutive_failures: 0, sim: { healthy: true } },
  { id: 'web-frontend', name: 'Horizon Web UI', type: 'application', status: 'healthy', dependencies: ['api-gateway'], consecutive_failures: 0, sim: { healthy: true } },
  { id: 'payment-service', name: 'Payment Service', type: 'application', status: 'healthy', dependencies: ['db-primary', 'auth-service'], consecutive_failures: 0, sim: { healthy: true } },
];

let activeIncidents: Incident[] = [];

// 1. Health Probe
app.get('/health', (c) => {
  const downCount = clusterNodes.filter((n) => n.status === 'down' || n.status === 'degraded').length;
  return c.json({
    status: downCount === 0 ? 'UP' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    totalNodes: clusterNodes.length,
    activeIncidents: activeIncidents.length,
  });
});

// 2. Nodes & Topology Graph
app.get('/nodes', (c) => {
  return c.json(clusterNodes);
});

app.get('/graph/analysis', (c) => {
  const engine = new DependencyGraphEngine(clusterNodes);
  const cycle = engine.detectCycle();
  return c.json({
    hasCycle: cycle.hasCycle,
    cyclePath: cycle.cyclePath,
  });
});

// 3. Chaos Injection (Demo / Operator Mode)
app.post('/chaos', async (c) => {
  const body = await c.req.json<{ nodeId: string; action: 'fail' | 'heal' }>();
  const node = clusterNodes.find((n) => n.id === body.nodeId);
  if (!node) return c.json({ error: 'Node not found' }, 404);

  if (body.action === 'fail') {
    node.status = 'down';
    node.sim.healthy = false;
    node.consecutive_failures = 3;

    // Trigger incident
    const engine = new DependencyGraphEngine(clusterNodes);
    const blast = engine.getBlastRadius(node.id);
    const levels = engine.computeTopologicalRecoveryLevels(blast);

    const incident: Incident = {
      id: `INC-${Date.now().toString().slice(-4)}`,
      status: 'awaiting_approval',
      trigger_node: node.id,
      root_cause: `${node.name} simulated failure`,
      blast_radius: blast,
      current_level: 0,
      plan_levels: levels,
      steps: getPlaybookForType(node.type),
      detected_at: new Date().toISOString(),
    };
    activeIncidents.unshift(incident);

    return c.json({ message: `Node ${node.id} set to DOWN`, incident });
  } else {
    node.status = 'healthy';
    node.sim.healthy = true;
    node.consecutive_failures = 0;
    activeIncidents = activeIncidents.filter((inc) => inc.trigger_node !== node.id);
    return c.json({ message: `Node ${node.id} healed to HEALTHY` });
  }
});

// 4. Tick Engine (Dashboard & Cron Advance)
app.post('/tick', (c) => {
  if (activeIncidents.length === 0) {
    return c.json({ skipped: true, reason: 'No active incidents' });
  }

  const currentInc = activeIncidents[0];
  const pendingStep = currentInc.steps.find((s) => s.status === 'pending');

  if (pendingStep) {
    if (pendingStep.risk === 'high' && currentInc.status === 'awaiting_approval') {
      return c.json({
        skipped: true,
        reason: 'Paused: Awaiting cryptographic signature from BridgeKey Commander.',
        incidentId: currentInc.id,
      });
    }

    pendingStep.status = 'completed';
    pendingStep.log = `[TICK] Step ${pendingStep.title} executed successfully.`;
  } else {
    currentInc.status = 'resolved';
    currentInc.resolved_at = new Date().toISOString();
    // Heal trigger node
    const node = clusterNodes.find((n) => n.id === currentInc.trigger_node);
    if (node) {
      node.status = 'healthy';
      node.sim.healthy = true;
      node.consecutive_failures = 0;
    }
  }

  return c.json({
    advanced: true,
    incident: currentInc,
  });
});

// 5. Incidents
app.get('/incidents', (c) => {
  return c.json(activeIncidents);
});

export default handle(app);
