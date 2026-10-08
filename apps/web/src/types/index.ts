export type NodeType = 'database' | 'application' | 'network' | 'cache' | 'gateway';

export interface SystemNode {
  id: string;
  name: string;
  type: NodeType;
  status: 'healthy' | 'degraded' | 'down' | 'recovering';
  dependencies: string[];
  consecutive_failures?: number;
}

export interface RecoveryEvent {
  id: string;
  nodeId: string;
  action: 'restart' | 'failover' | 'restore' | 'scale' | 'dns_update';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'awaiting_approval';
  timestamp: string;
  duration?: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: 'system' | 'human' | 'llm_agent' | string;
  details: string;
  severity: 'info' | 'warning' | 'critical' | string;
}
