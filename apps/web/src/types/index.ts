export interface SystemNode {
  id: string
  name: string
  type: 'database' | 'application' | 'network' | 'cache' | 'gateway'
  status: 'healthy' | 'degraded' | 'down' | 'recovering'
  dependencies: string[]
}

export interface RecoveryEvent {
  id: string
  nodeId: string
  action: 'restart' | 'failover' | 'restore' | 'scale' | 'dns_update'
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'awaiting_approval'
  timestamp: string
  duration?: number
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  action: string
  actor: 'system' | 'human'
  details: string
  severity: 'info' | 'warning' | 'critical'
}
