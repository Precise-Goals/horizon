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
});
