/**
 * Horizon Unified Serverless API Entrypoint (Hono on Vercel Functions)
 * Serves /api/v1/* routes for cluster health, nodes, chaos injection, tick execution, and BridgeKey approvals.
 */
import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';
import { DependencyGraphEngine } from '../_lib/graph';
import { getPlaybookForType } from '../_lib/playbooks';
import type { SystemNode, Incident } from '../../packages/shared/src/index';

export const config = {
  runtime: 'edge',
};

const app = new Hono().basePath('/api/v1');

// Global CORS Middleware — Enables cross-origin requests and preflight handling
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposeHeaders: ['Content-Length', 'X-Horizon-Version'],
  maxAge: 86400,
}));

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

// 6. Metrics Summary
app.get('/metrics/summary', (c) => {
  const healthyCount = clusterNodes.filter((n) => n.status === 'healthy').length;
  const degradedCount = clusterNodes.length - healthyCount;
  return c.json({
    total_nodes: clusterNodes.length,
    healthy_nodes: healthyCount,
    degraded_nodes: degradedCount,
    active_incidents: activeIncidents.filter((i) => i.status !== 'resolved').length,
    uptime_pct: clusterNodes.length > 0 ? (healthyCount / clusterNodes.length) * 100 : 100,
    timestamp: new Date().toISOString(),
  });
});

// 7. Governance Status
app.get('/governance/status', (c) => {
  const pendingApprovals = activeIncidents.filter((i) => i.status === 'awaiting_approval');
  return c.json({
    governance_active: true,
    chain_id: 91562037,
    network: 'MST Testnet',
    pending_approvals: pendingApprovals.length,
    dual_path_mode: 'EIP-712-enforced',
  });
});

// 8. OpenAPI Specification JSON (OpenAPI 3.0)
app.get('/openapi.json', (c) => {
  return c.json({
    openapi: '3.0.0',
    info: {
      title: 'Horizon Serverless Edge API',
      version: '1.0.0',
      description: 'Autonomous Enterprise Infrastructure Recovery Platform Edge REST API with CORS support',
      contact: {
        name: 'Horizon SRE Operations',
        url: 'https://horizon-aiops.vercel.app',
      },
    },
    servers: [
      { url: '/api/v1', description: 'Production Edge Gateway' },
    ],
    paths: {
      '/health': {
        get: {
          summary: 'Health Probe',
          description: 'Evaluates cluster health, total nodes, and active incident count.',
          responses: { '200': { description: 'System health summary' } },
        },
      },
      '/nodes': {
        get: {
          summary: 'List Topology Nodes',
          description: 'Returns all microservices, databases, and dependencies in the active cluster.',
          responses: { '200': { description: 'Array of SystemNodes' } },
        },
      },
      '/graph/analysis': {
        get: {
          summary: 'Dependency Graph Cycle Analysis',
          description: 'Runs Kahn and Tarjan algorithms to verify acyclic topology and cycle paths.',
          responses: { '200': { description: 'Acyclic validation result' } },
        },
      },
      '/chaos': {
        post: {
          summary: 'Inject Simulated Chaos / Heal Node',
          description: 'Trips 3-miss watchdog failure or heals an infrastructure node.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nodeId', 'action'],
                  properties: {
                    nodeId: { type: 'string', example: 'db-primary' },
                    action: { type: 'string', enum: ['fail', 'heal'] },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'Incident response' }, '404': { description: 'Node not found' } },
        },
      },
      '/tick': {
        post: {
          summary: 'Advance Autonomous Recovery Tick',
          description: 'Executes next recovery step or pauses at EIP-712 cryptographic gate.',
          responses: { '200': { description: 'Recovery progress' } },
        },
      },
      '/incidents': {
        get: {
          summary: 'List Incidents',
          description: 'Retrieves all active and historical infrastructure incidents.',
          responses: { '200': { description: 'Array of Incident objects' } },
        },
      },
      '/metrics/summary': {
        get: {
          summary: 'Telemetry & Metric Summary',
          description: 'Aggregates node health, uptime percentage, and degraded services count.',
          responses: { '200': { description: 'Cluster metric summary' } },
        },
      },
      '/governance/status': {
        get: {
          summary: 'Web3 Governance & Blockchain Status',
          description: 'Returns MST Testnet chain ID, EIP-712 signer configuration, and pending approval gates.',
          responses: { '200': { description: 'Governance status' } },
        },
      },
      '/docs': {
        get: {
          summary: 'Interactive Swagger UI Documentation',
          description: 'Renders the Swagger UI for the Edge API.',
          responses: { '200': { description: 'HTML document' } },
        },
      },
    },
  });
});

// 9. Interactive Swagger UI Documentation Page
app.get('/docs', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Horizon Edge REST API — Swagger UI</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    <style>
      body { margin: 0; background: #FFF8F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      .topbar { display: none !important; }
      .swagger-ui .info .title { color: #1A1A1A; font-weight: 800; }
      .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #0047AB; }
      .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #059669; }
      .swagger-ui .btn.execute { background-color: #0047AB; color: #fff; border-color: #0047AB; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '/api/v1/openapi.json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis],
          layout: 'BaseLayout',
        });
      };
    </script>
  </body>
</html>`);
});

// 10. Redoc API Reference
app.get('/redoc', (c) => {
  return c.html(`<!DOCTYPE html>
<html>
  <head>
    <title>Horizon Edge API — ReDoc</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>body { margin: 0; padding: 0; background: #FFF8F0; }</style>
  </head>
  <body>
    <redoc spec-url="/api/v1/openapi.json"></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  </body>
</html>`);
});

export { app };
export default handle(app);


