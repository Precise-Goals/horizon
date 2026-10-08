import { describe, expect, it } from 'bun:test';
import {
  NodeTypeSchema,
  NodeStatusSchema,
  SystemNodeSchema,
  DependencyEdgeSchema,
  TelemetryMetricSchema,
  StepRiskSchema,
  StepStatusSchema,
  PlaybookStepSchema,
  PlaybookSchema,
  IncidentStatusSchema,
  IncidentSchema,
  ApprovalRequestSchema,
  AuditEntrySchema,
} from './index';

describe('@horizon/shared Schema Specifications', () => {
  describe('NodeTypeSchema & NodeStatusSchema', () => {
    it('accepts valid node types', () => {
      const validTypes = ['database', 'application', 'cache', 'gateway', 'queue'];
      for (const t of validTypes) {
        expect(NodeTypeSchema.parse(t)).toBe(t as any);
      }
    });

    it('rejects invalid node types', () => {
      expect(() => NodeTypeSchema.parse('invalid_type')).toThrow();
      expect(() => NodeTypeSchema.parse(123)).toThrow();
    });

    it('accepts valid node statuses', () => {
      const validStatuses = ['healthy', 'degraded', 'down', 'recovering'];
      for (const s of validStatuses) {
        expect(NodeStatusSchema.parse(s)).toBe(s as any);
      }
    });

    it('rejects invalid node statuses', () => {
      expect(() => NodeStatusSchema.parse('offline')).toThrow();
      expect(() => NodeStatusSchema.parse('')).toThrow();
    });
  });

  describe('SystemNodeSchema', () => {
    it('validates a complete system node definition with defaults', () => {
      const raw = {
        id: 'db-master-01',
        name: 'PostgreSQL Master',
        type: 'database',
        status: 'healthy',
      };

      const parsed = SystemNodeSchema.parse(raw);
      expect(parsed.id).toBe('db-master-01');
      expect(parsed.name).toBe('PostgreSQL Master');
      expect(parsed.dependencies).toEqual([]);
      expect(parsed.consecutive_failures).toBe(0);
      expect(parsed.sim).toEqual({ healthy: true });
    });

    it('preserves explicit dependencies and simulation state', () => {
      const raw = {
        id: 'api-srv-01',
        name: 'API Gateway',
        type: 'gateway',
        status: 'degraded',
        dependencies: ['db-master-01', 'redis-cache-01'],
        consecutive_failures: 2,
        sim: { healthy: false },
      };

      const parsed = SystemNodeSchema.parse(raw);
      expect(parsed.dependencies).toEqual(['db-master-01', 'redis-cache-01']);
      expect(parsed.consecutive_failures).toBe(2);
      expect(parsed.sim.healthy).toBe(false);
    });

    it('rejects negative consecutive failures', () => {
      expect(() =>
        SystemNodeSchema.parse({
          id: 'node-fail',
          name: 'Failing Node',
          type: 'application',
          status: 'down',
          consecutive_failures: -1,
        })
      ).toThrow();
    });
  });

  describe('DependencyEdgeSchema', () => {
    it('validates directed dependency edge', () => {
      const edge = DependencyEdgeSchema.parse({ from: 'auth-svc', to: 'db-master' });
      expect(edge.from).toBe('auth-svc');
      expect(edge.to).toBe('db-master');
    });

    it('rejects incomplete edges', () => {
      expect(() => DependencyEdgeSchema.parse({ from: 'auth-svc' })).toThrow();
      expect(() => DependencyEdgeSchema.parse({ to: 'db-master' })).toThrow();
    });
  });

  describe('TelemetryMetricSchema', () => {
    it('validates telemetry metrics with correct bounds', () => {
      const metric = TelemetryMetricSchema.parse({
        nodeId: 'db-master-01',
        latency_ms: 4.25,
        error_rate: 0.05,
        cpu_pct: 35.8,
        memory_pct: 62.1,
        timestamp: new Date().toISOString(),
      });
      expect(metric.latency_ms).toBe(4.25);
      expect(metric.error_rate).toBe(0.05);
      expect(metric.cpu_pct).toBe(35.8);
    });

    it('rejects out-of-range metrics', () => {
      expect(() =>
        TelemetryMetricSchema.parse({
          nodeId: 'node-1',
          latency_ms: -5,
          error_rate: 10,
          cpu_pct: 50,
          memory_pct: 50,
          timestamp: new Date().toISOString(),
        })
      ).toThrow();

      expect(() =>
        TelemetryMetricSchema.parse({
          nodeId: 'node-1',
          latency_ms: 10,
          error_rate: 105,
          cpu_pct: 50,
          memory_pct: 50,
          timestamp: new Date().toISOString(),
        })
      ).toThrow();
    });
  });

  describe('PlaybookSchema & Steps', () => {
    it('validates playbook step risk and status enum', () => {
      expect(StepRiskSchema.parse('low')).toBe('low');
      expect(StepRiskSchema.parse('high')).toBe('high');
      expect(() => StepRiskSchema.parse('critical')).toThrow();

      expect(StepStatusSchema.parse('pending')).toBe('pending');
      expect(StepStatusSchema.parse('waiting_approval')).toBe('waiting_approval');
      expect(() => StepStatusSchema.parse('unknown')).toThrow();
    });

    it('validates a complete Playbook definition', () => {
      const playbook = PlaybookSchema.parse({
        id: 'pb-db-failover',
        name: 'Database Failover Playbook',
        target_type: 'database',
        steps: [
          {
            id: 1,
            title: 'Drain Connections',
            action: 'drain_pool',
            risk: 'low',
            status: 'completed',
          },
          {
            id: 2,
            title: 'Promote Replica',
            action: 'promote_replica',
            risk: 'high',
            status: 'waiting_approval',
          },
        ],
      });

      expect(playbook.steps).toHaveLength(2);
      expect(playbook.steps[0].log).toBe('');
      expect(playbook.steps[1].risk).toBe('high');
    });
  });

  describe('IncidentSchema & Recovery Lifecycle', () => {
    it('validates incident life-cycle record', () => {
      const now = new Date().toISOString();
      const inc = IncidentSchema.parse({
        id: 'INC-2026-001',
        status: 'detected',
        trigger_node: 'db-master-01',
        root_cause: 'Simulated network partition',
        blast_radius: ['auth-svc', 'api-gateway'],
        detected_at: now,
      });

      expect(inc.status).toBe('detected');
      expect(inc.current_level).toBe(0);
      expect(inc.plan_levels).toEqual([]);
      expect(inc.steps).toEqual([]);
    });

    it('rejects invalid incident statuses', () => {
      expect(() =>
        IncidentSchema.parse({
          id: 'INC-001',
          status: 'non_existent_status',
          trigger_node: 'n1',
          root_cause: 'test',
          blast_radius: [],
          detected_at: new Date().toISOString(),
        })
      ).toThrow();
    });
  });

  describe('Cryptographic Approval & Audit Records', () => {
    it('validates ApprovalRequest cryptographic payload', () => {
      const req = ApprovalRequestSchema.parse({
        incident_id: 'INC-100',
        step_id: 2,
        step_hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        commander_address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4df',
        status: 'approved',
        signature: '0x123456789abcdef',
        timestamp: 1775600000,
        nonce: 'non-1234',
      });
      expect(req.status).toBe('approved');
      expect(req.step_id).toBe(2);
    });

    it('validates AuditEntry chain item', () => {
      const entry = AuditEntrySchema.parse({
        id: 'AUDIT-001',
        ts: new Date().toISOString(),
        actor: 'Commander-Agent',
        type: 'RECOVERY_STEP_EXECUTED',
        data: { stepId: 1, durationMs: 450 },
        prevHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        hash: '0x1234567890123456789012345678901234567890123456789012345678901234',
      });
      expect(entry.actor).toBe('Commander-Agent');
      expect(entry.data.stepId).toBe(1);
    });
  });
});
