import { describe, it, expect } from 'bun:test';
import { autonomousWatchdog } from './watchdog';
import { notificationHub } from './notificationHub';
import { clusterState } from './state';

describe('Autonomous Watchdog & Notification Hub Suite', () => {
  it('tracks rolling MTTR metrics and watchdog status', () => {
    const metrics = autonomousWatchdog.getMetrics();
    expect(metrics).toBeDefined();
    expect(metrics.rollingMttrSeconds).toBeGreaterThan(0);
    expect(metrics.totalIncidentsDiscovered).toBeGreaterThanOrEqual(1);
  });

  it('toggles Autonomous Chaos Sentinel state on and off', () => {
    const initial = autonomousWatchdog.getMetrics().isSentinelActive;
    const toggled = autonomousWatchdog.toggleSentinel();
    expect(toggled).toBe(!initial);
    // restore
    autonomousWatchdog.toggleSentinel();
  });

  it('broadcasts incident to NotificationHub and records in War Room channels', async () => {
    const initialCount = notificationHub.getMessages().length;

    await notificationHub.broadcastIncident({
      id: 'INC-TEST',
      nodeId: 'db-primary',
      nodeName: 'PostgreSQL Primary Cluster',
      type: 'database',
      timestamp: new Date().toISOString(),
      severity: 'critical',
    });

    const updatedMessages = notificationHub.getMessages();
    expect(updatedMessages.length).toBeGreaterThan(initialCount);

    // Verify channel messages were partitioned
    const sreMessages = notificationHub.getMessages('#sre-bridge');
    expect(sreMessages.some((m) => m.text.includes('PostgreSQL Primary Cluster'))).toBe(true);

    const dbOpsMessages = notificationHub.getMessages('#database-ops');
    expect(dbOpsMessages.some((m) => m.badge === 'FAILOVER REQUIRED')).toBe(true);

    const secOpsMessages = notificationHub.getMessages('#secops-governance');
    expect(secOpsMessages.some((m) => m.text.includes('MST Testnet'))).toBe(true);
  });

  it('triggers autonomous chaos injection and generates dynamic recovery steps in clusterState', () => {
    autonomousWatchdog.triggerAutonomousChaosInjection();

    const activeJob = clusterState.getActiveJob();
    expect(activeJob).toBeDefined();
    expect(activeJob?.status).toBe('PAUSED_APPROVAL');
    expect(activeJob?.steps.length).toBeGreaterThanOrEqual(3);

    // Step 2 must be the Human Commander Approval Gate
    expect(activeJob?.steps[1].title).toBe('Human Commander Approval Gate');
    expect(activeJob?.steps[1].isHighRisk).toBe(true);
    expect(activeJob?.steps[1].status).toBe('waiting_approval');

    // Reset cluster state back to clean baseline
    clusterState.resetToDefaultTopology();
  });
});
