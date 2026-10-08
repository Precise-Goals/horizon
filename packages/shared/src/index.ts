/**
 * @horizon/shared
 * Canonical Zod schemas and inferred TypeScript types for the Horizon platform.
 * Shared across frontend (apps/web) and serverless functions (api/).
 */
import { z } from 'zod';

// ============================================================================
// 1. Infrastructure & Dependency Graph
// ============================================================================

export const NodeTypeSchema = z.enum([
  'database',
  'application',
  'cache',
  'gateway',
  'queue',
]);
export type NodeType = z.infer<typeof NodeTypeSchema>;

export const NodeStatusSchema = z.enum([
  'healthy',
  'degraded',
  'down',
  'recovering',
]);
export type NodeStatus = z.infer<typeof NodeStatusSchema>;

export const SystemNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: NodeTypeSchema,
  status: NodeStatusSchema,
  dependencies: z.array(z.string()).default([]),
  last_ping: z.string().optional(),
  consecutive_failures: z.number().int().nonnegative().default(0),
  sim: z
    .object({
      healthy: z.boolean().default(true),
    })
    .default({ healthy: true }),
});
export type SystemNode = z.infer<typeof SystemNodeSchema>;

export const DependencyEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
});
export type DependencyEdge = z.infer<typeof DependencyEdgeSchema>;

// ============================================================================
// 2. Telemetry & Metrics
// ============================================================================

export const TelemetryMetricSchema = z.object({
  nodeId: z.string(),
  latency_ms: z.number().nonnegative(),
  error_rate: z.number().min(0).max(100),
  cpu_pct: z.number().min(0).max(100),
  memory_pct: z.number().min(0).max(100),
  timestamp: z.string(),
});
export type TelemetryMetric = z.infer<typeof TelemetryMetricSchema>;

// ============================================================================
// 3. Playbooks & Execution Steps
// ============================================================================

export const StepRiskSchema = z.enum(['low', 'high']);
export type StepRisk = z.infer<typeof StepRiskSchema>;

export const StepStatusSchema = z.enum([
  'pending',
  'running',
  'waiting_approval',
  'completed',
  'failed',
]);
export type StepStatus = z.infer<typeof StepStatusSchema>;

export const PlaybookStepSchema = z.object({
  id: z.number(),
  title: z.string(),
  action: z.string(),
  risk: StepRiskSchema,
  status: StepStatusSchema,
  log: z.string().default(''),
});
export type PlaybookStep = z.infer<typeof PlaybookStepSchema>;

export const PlaybookSchema = z.object({
  id: z.string(),
  name: z.string(),
  target_type: NodeTypeSchema,
  steps: z.array(PlaybookStepSchema),
});
export type Playbook = z.infer<typeof PlaybookSchema>;

// ============================================================================
// 4. Incidents & Recovery Lifecycle
// ============================================================================

export const IncidentStatusSchema = z.enum([
  'detected',
  'analyzing',
  'awaiting_approval',
  'recovering',
  'verifying',
  'resolved',
  'escalated',
  'failed',
]);
export type IncidentStatus = z.infer<typeof IncidentStatusSchema>;

export const IncidentSchema = z.object({
  id: z.string(),
  status: IncidentStatusSchema,
  trigger_node: z.string(),
  root_cause: z.string(),
  blast_radius: z.array(z.string()),
  current_level: z.number().int().nonnegative().default(0),
  plan_levels: z.array(z.array(z.string())).default([]),
  steps: z.array(PlaybookStepSchema).default([]),
  detected_at: z.string(),
  approved_at: z.string().optional(),
  resolved_at: z.string().optional(),
  postmortem: z.string().optional(),
});
export type Incident = z.infer<typeof IncidentSchema>;

// ============================================================================
// 5. Cryptographic Approval Gate & Audit Chain
// ============================================================================

export const ApprovalRequestSchema = z.object({
  incident_id: z.string(),
  step_id: z.number(),
  step_hash: z.string(),
  commander_address: z.string(),
  status: z.enum(['pending', 'approved', 'rejected', 'escalated']),
  signature: z.string().optional(),
  timestamp: z.number(),
  nonce: z.string(),
});
export type ApprovalRequest = z.infer<typeof ApprovalRequestSchema>;

export const AuditEntrySchema = z.object({
  id: z.string(),
  ts: z.string(),
  actor: z.string(),
  type: z.string(),
  data: z.record(z.string(), z.unknown()),
  prevHash: z.string(),
  hash: z.string(),
  anchorTx: z.string().optional(),
});
export type AuditEntry = z.infer<typeof AuditEntrySchema>;
