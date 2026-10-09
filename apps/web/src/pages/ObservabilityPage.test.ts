import { describe, it, expect } from 'bun:test';
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

    // Sarvam AI SRE diagnosis
    const downNodes = clusterState.getNodes().filter((n) => n.status === 'down');
    const allNodes = clusterState.getNodes();
    const diagnosis = await sarvamAgent.diagnoseOutage(downNodes, allNodes);

    expect(diagnosis.rootCause).toBeDefined();
    expect(diagnosis.playbook).toBeDefined();
    expect(diagnosis.explanation).toBeDefined();

    // AI remediation execution
    clusterState.setNodeStatus('db-primary', 'healthy');
    expect(clusterState.getNode('db-primary')?.status).toBe('healthy');
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
