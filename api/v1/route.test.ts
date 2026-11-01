import { describe, expect, it } from 'bun:test';
import { app } from './[[...route]]';

describe('Serverless API Route Functions (api/v1)', () => {
  it('GET /api/v1/health returns system status UP and node counts', async () => {
    const res = await app.request('/api/v1/health');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('UP');
    expect(body.version).toBe('1.0.0');
    expect(body.totalNodes).toBeGreaterThan(0);
    expect(typeof body.timestamp).toBe('string');
  });

  it('GET /api/v1/nodes returns cluster topology nodes', async () => {
    const res = await app.request('/api/v1/nodes');
    expect(res.status).toBe(200);

    const nodes = await res.json();
    expect(Array.isArray(nodes)).toBe(true);
    expect(nodes.length).toBeGreaterThan(0);

    const dbPrimary = nodes.find((n: any) => n.id === 'db-primary');
    expect(dbPrimary).toBeDefined();
    expect(dbPrimary.type).toBe('database');
  });

  it('GET /api/v1/graph/analysis checks acyclic property', async () => {
    const res = await app.request('/api/v1/graph/analysis');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.hasCycle).toBe(false);
    expect(body.cyclePath).toEqual([]);
  });

  it('POST /api/v1/chaos triggers simulated failure and recovery lifecycle', async () => {
    // 1. Trigger failure on auth-service
    const failRes = await app.request('/api/v1/chaos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeId: 'auth-service', action: 'fail' }),
    });

    expect(failRes.status).toBe(200);
    const failBody = await failRes.json();
    expect(failBody.incident).toBeDefined();
    expect(failBody.incident.trigger_node).toBe('auth-service');
    expect(failBody.incident.blast_radius).toContain('auth-service');

    // 2. Verify /incidents reflects the active incident
    const incRes = await app.request('/api/v1/incidents');
    expect(incRes.status).toBe(200);
    const incList = await incRes.json();
    expect(incList.length).toBeGreaterThan(0);

    // 3. Heal the node back
    const healRes = await app.request('/api/v1/chaos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeId: 'auth-service', action: 'heal' }),
    });

    expect(healRes.status).toBe(200);
    const healBody = await healRes.json();
    expect(healBody.message).toContain('healed');
  });

  it('GET /api/v1/metrics/summary returns cluster telemetry aggregates', async () => {
    const res = await app.request('/api/v1/metrics/summary');
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.total_nodes).toBeGreaterThan(0);
    expect(body.healthy_nodes).toBeDefined();
    expect(body.uptime_pct).toBeGreaterThanOrEqual(0);
    expect(body.timestamp).toBeDefined();
  });

  it('GET /api/v1/governance/status reports on-chain chain id and wallet counts', async () => {
    const res = await app.request('/api/v1/governance/status');
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.governance_active).toBe(true);
    expect(body.chain_id).toBe(91562037);
    expect(body.dual_path_mode).toBe('EIP-712-enforced');
  });

  it('GET /api/v1/docs returns interactive Swagger UI documentation with HTTP 200', async () => {
    const res = await app.request('/api/v1/docs');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('swagger-ui');
    expect(html).toContain('/api/v1/openapi.json');
  });

  it('GET /api/v1/openapi.json returns valid OpenAPI 3.0 specification', async () => {
    const res = await app.request('/api/v1/openapi.json');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');
    const schema = await res.json();
    expect(schema.openapi).toBe('3.0.0');
    expect(schema.info.title).toContain('Horizon');
    expect(schema.paths['/health']).toBeDefined();
    expect(schema.paths['/chaos']).toBeDefined();
  });

  it('verifies CORS headers and OPTIONS preflight on Edge API', async () => {
    // 1. GET with Origin
    const getRes = await app.request('/api/v1/health', {
      headers: { Origin: 'https://horizon-aiops.vercel.app' },
    });
    expect(getRes.status).toBe(200);
    expect(getRes.headers.get('access-control-allow-origin')).toBe('*');

    // 2. OPTIONS Preflight
    const optionsRes = await app.request('/api/v1/chaos', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://horizon-aiops.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
      },
    });
    expect(optionsRes.status).toBe(204);
    expect(optionsRes.headers.get('access-control-allow-origin')).toBe('*');
    expect(optionsRes.headers.get('access-control-allow-methods')).toContain('POST');
    expect(optionsRes.headers.get('access-control-allow-headers')).toContain('Content-Type');
  });
});
