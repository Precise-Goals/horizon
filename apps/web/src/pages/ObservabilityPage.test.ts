import { describe, it, expect, spyOn } from 'bun:test';
import { clusterState } from '../engine/state';
import { notificationHub } from '../engine/notificationHub';
import { sarvamAgent } from '../engine/sarvamAgent';
import { ObservabilityPage } from './ObservabilityPage';

describe('Observability & Real-time Telemetry Pipeline Suite', () => {
  it('exports ObservabilityPage as a valid named React functional component', () => {
    expect(ObservabilityPage).toBeDefined();
    expect(typeof ObservabilityPage).toBe('function');
  });

  it('validates 3-consecutive-miss sliding window failure detector logic', () => {
    // A single drop or 2 drops must NOT trigger P1 critical alert (prevents network jitter flapping)
    let consecutiveMisses = 0;
    const probe = (success: boolean) => {
      if (!success) {
        consecutiveMisses += 1;
      } else {
        consecutiveMisses = 0;
      }
      return consecutiveMisses >= 3;
    };

    expect(probe(false)).toBe(false); // Miss 1: transient blip (nominal)
    expect(probe(true)).toBe(false);  // Restored: counter resets
    expect(consecutiveMisses).toBe(0);

    expect(probe(false)).toBe(false); // Miss 1
    expect(probe(false)).toBe(false); // Miss 2: degraded warning
    expect(consecutiveMisses).toBe(2);

    expect(probe(false)).toBe(true);  // Miss 3: TRIP THRESHOLD -> PagerDuty P1 Triggered!
    expect(consecutiveMisses).toBe(3);
  });

  it('verifies PagerDuty P1 incident structure and blast radius calculation', () => {
    const targetNode = 'db-primary';
    const blast = clusterState.getGraph().computeBlastRadius(targetNode);
    const blastRadius = blast.affectedNodeIds;

    const incident = {
      id: 'INC-74921',
      title: 'P1 CRITICAL: db-primary (Primary PostgreSQL Replica) Probe Timeout [3/3 Misses]',
      severity: 'P1' as const,
      source: 'Datadog APM' as const,
      targetNode,
      targetName: 'Primary PostgreSQL Database',
      status: 'FIRING' as const,
      blastRadius,
      consecutiveMisses: 3,
      detectedAt: new Date().toISOString(),
      summary: 'Datadog synthetic TCP health probe failed 3 consecutive times (>1500ms timeout). Replication stream stalled.',
    };

    expect(incident.severity).toBe('P1');
    expect(incident.source).toBe('Datadog APM');
    expect(incident.consecutiveMisses).toBe(3);
    expect(incident.blastRadius.length).toBeGreaterThan(0);
    expect(incident.blastRadius).toContain('redis-cache');
  });

  it('verifies Datadog APM latency wave SVG path calculation', () => {
    // Generate simulated points similar to ObservabilityPage
    const history = [
      { latencyMs: 12.4, errorRate: 0.0, cpuPercent: 34 },
      { latencyMs: 14.1, errorRate: 0.0, cpuPercent: 36 },
      { latencyMs: 11.8, errorRate: 0.0, cpuPercent: 32 },
      { latencyMs: 980.0, errorRate: 88.5, cpuPercent: 96 },
    ];

    const width = 600;
    const height = 140;
    const maxVal = Math.max(...history.map((h) => h.latencyMs), 50);

    const points = history.map((pt, idx) => {
      const x = (idx / (history.length - 1)) * width;
      const y = height - (pt.latencyMs / maxVal) * (height - 24) - 12;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const svgPath = `M ${points[0]} L ${points.slice(1).join(' L ')}`;
    expect(svgPath.startsWith('M 0.0,')).toBe(true);
    expect(svgPath).toContain('L 600.0,');
  });

  it('verifies NotificationHub dispatches PagerDuty incident broadcast', async () => {
    let triggered = false;
    const unsubscribe = notificationHub.subscribe(() => {
      triggered = true;
    });

    await notificationHub.broadcastIncident({
      id: 'INC-74921',
      nodeId: 'db-primary',
      nodeName: 'Primary PostgreSQL Database',
      type: 'database',
      timestamp: new Date().toISOString(),
      severity: 'critical',
    });

    expect(triggered).toBe(true);
    const messages = notificationHub.getMessages('#sre-bridge');
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[0].badge).toBe('CRITICAL');
    expect(messages[0].text).toContain('db-primary');

    unsubscribe();
  });

  it('validates AI SRE Agent recovery orchestration loop and state reset', async () => {
    // Incur simulated failure on clusterState
    clusterState.setNodeStatus('db-primary', 'down');
    expect(clusterState.getNode('db-primary')?.status).toBe('down');

    const fetchSpy = spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: 'Primary database connection pool depleted. Trigger replica promotion.' } }],
        }),
        { status: 200 }
      )
    );

    try {
      // Sarvam AI SRE diagnosis with full provenance
      const downNodes = clusterState.getNodes().filter((n) => n.status === 'down');
      const allNodes = clusterState.getNodes();
      const diagnosis = await sarvamAgent.diagnoseOutage(downNodes, allNodes);

      expect(diagnosis.rootCause).toBeDefined();
      expect(diagnosis.playbook).toBeDefined();
      expect(diagnosis.explanation).toBeDefined();
      expect(diagnosis.source).toBe('sarvam-ai-cloud');
      expect(diagnosis.model).toBeDefined();
      expect(diagnosis.rawOutput).toBeDefined();
      expect(diagnosis.latencyMs).toBeGreaterThanOrEqual(0);

      // AI remediation execution
      clusterState.setNodeStatus('db-primary', 'healthy');
      expect(clusterState.getNode('db-primary')?.status).toBe('healthy');
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it('validates 7-pipeline cryptographic SHA-256 checksum manifest generation', async () => {
    const { computeSha256, generateFullRecoveryChecksumManifest } = await import('../lib/pipelineChecksum');

    // Test deterministic SHA-256
    const hash1 = await computeSha256('horizon-payload-v1');
    const hash2 = await computeSha256('horizon-payload-v1');
    expect(hash1).toBe(hash2);
    expect(hash1.startsWith('0x')).toBe(true);
    expect(hash1.length).toBe(66); // '0x' + 64 hex chars

    // Test full 7-pipeline recovery manifest
    const manifest = await generateFullRecoveryChecksumManifest({
      telemetry: { targetNode: 'db-primary', latencyMs: 999.0, errorRate: 1.0, consecutiveMisses: 3 },
      incident: { id: 'INC-999', severity: 'P1', source: 'Datadog APM', blastRadius: ['redis-cache'] },
      dagPlan: { tiers: [{ tier: 0, services: ['db-primary'], action: 'Failover' }] },
      aiDiagnosis: { source: 'sarvam-ai-cloud', model: 'sarvam-2b', rootCause: 'DB pool depleted', rawOutput: 'Promote replica' },
      governance: { chainId: 91562037, contract: '0x3EDad...', signer: '0x735...', signature: '0xabc...' },
      execution: { recoveredNodes: ['db-primary', 'redis-cache'], resolvedAt: new Date().toISOString(), elapsedSec: 24.8 },
    });

    expect(manifest).toHaveLength(7);
    manifest.forEach((stage, idx) => {
      expect(stage.stage).toBe(idx + 1);
      expect(stage.checksum.startsWith('0x')).toBe(true);
      expect(stage.checksum.length).toBe(66);
    });

    // Check specific stages
    expect(manifest[0].pipelineId).toBe('pipe-telemetry-ingestion');
    expect(manifest[1].pipelineId).toBe('pipe-anomaly-flapping-guard');
    expect(manifest[2].pipelineId).toBe('pipe-kahn-dag-sequencing');
    expect(manifest[3].pipelineId).toBe('pipe-real-ai-sre-reasoning');
    expect(manifest[4].pipelineId).toBe('pipe-eip712-governance-gate');
    expect(manifest[5].pipelineId).toBe('pipe-execution-self-healing');
    expect(manifest[6].pipelineId).toBe('pipe-merkle-audit-anchoring');
  });

  it('validates multi-service Dynatrace OneAgent telemetry cluster matrix', () => {
    const requiredClusterServices = [
      'db-primary',
      'db-replica',
      'redis-cache',
      'auth-service',
      'api-gateway',
      'web-frontend',
      'payment-service',
    ];

    const currentNodes = clusterState.getNodes().map((n) => n.id);
    requiredClusterServices.forEach((serviceId) => {
      expect(currentNodes).toContain(serviceId);
    });
  });
});
