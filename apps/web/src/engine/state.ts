/**
 * Horizon Unified Cluster State Manager
 * Reactive state store managing nodes, active recovery jobs, and audit logs.
 */
import type { SystemNode, AuditLogEntry } from '@/types';
import { DependencyGraph } from './dependencyGraph';
import { mstBlockchain, MST_CONFIG } from './mstBlockchain';

export interface RecoveryJobState {
  id: string;
  targetNodeId: string;
  status: 'PENDING' | 'RUNNING' | 'PAUSED_APPROVAL' | 'COMPLETED' | 'FAILED';
  currentStepIndex: number;
  approvalSignature?: string;
  steps: {
    id: number;
    title: string;
    action: string;
    isHighRisk: boolean;
    status: 'completed' | 'running' | 'waiting_approval' | 'pending';
    log: string;
  }[];
}

class ClusterStateManager {
  private nodes: Map<string, SystemNode> = new Map();
  private graph: DependencyGraph = new DependencyGraph();
  private auditLogs: AuditLogEntry[] = [];
  private activeJob: RecoveryJobState | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.seedInitialState();
  }

  private seedInitialState(): void {
    const initialNodes: SystemNode[] = [
      { id: 'db-primary', name: 'PostgreSQL Primary', type: 'database', status: 'healthy', dependencies: [] },
      { id: 'db-replica', name: 'PostgreSQL Replica', type: 'database', status: 'healthy', dependencies: ['db-primary'] },
      { id: 'redis-cache', name: 'Redis Cache', type: 'cache', status: 'healthy', dependencies: ['db-primary'] },
      { id: 'auth-service', name: 'Auth Service', type: 'application', status: 'healthy', dependencies: ['db-primary', 'redis-cache'] },
      { id: 'api-gateway', name: 'API Gateway', type: 'gateway', status: 'healthy', dependencies: ['auth-service', 'redis-cache'] },
      { id: 'web-frontend', name: 'Horizon Web UI', type: 'application', status: 'healthy', dependencies: ['api-gateway'] },
      { id: 'payment-service', name: 'Payment Service', type: 'application', status: 'healthy', dependencies: ['db-primary', 'auth-service'] },
    ];

    this.graph.clear();
    initialNodes.forEach((node) => {
      this.nodes.set(node.id, node);
      this.graph.addNode(node);
    });

    initialNodes.forEach((node) => {
      node.dependencies.forEach((dep) => {
        this.graph.addDependency(node.id, dep);
      });
    });

    this.auditLogs = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        actor: 'SYSTEM',
        action: 'Autonomous Health Probe Sync',
        details: 'All 7 nodes reporting 200 OK across cluster.',
        severity: 'info',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        actor: 'HUMAN (Commander)',
        action: 'MST Testnet Validator Ping',
        details: 'Verified MST Testnet RPC connection (Chain ID 91562037).',
        severity: 'info',
      },
    ];
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public getNodes(): SystemNode[] {
    return Array.from(this.nodes.values());
  }

  public getNode(id: string): SystemNode | undefined {
    return this.nodes.get(id);
  }

  public getGraph(): DependencyGraph {
    return this.graph;
  }

  public getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs];
  }

  public getActiveJob(): RecoveryJobState | null {
    return this.activeJob;
  }

  public setNodeStatus(id: string, status: 'healthy' | 'degraded' | 'down' | 'recovering'): void {
    const node = this.nodes.get(id);
    if (!node) return;

    node.status = status;
    this.graph.addNode(node);

    this.addAuditLog({
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      actor: 'SYSTEM',
      action: `Node Status Transition: ${node.name}`,
      details: `Node ${id} transitioned to state [${status.toUpperCase()}].`,
      severity: status === 'down' ? 'critical' : status === 'degraded' ? 'warning' : 'info',
    });

    this.notify();
  }

  public addAuditLog(entry: AuditLogEntry): void {
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 200) this.auditLogs.pop();
    this.notify();
  }

  public startRecovery(targetNodeId: string = 'db-primary'): void {
    const target = this.nodes.get(targetNodeId);
    const isDb = target?.type === 'database';

    this.activeJob = {
      id: `REC-${Date.now().toString().slice(-4)}`,
      targetNodeId,
      status: 'PAUSED_APPROVAL',
      currentStepIndex: 1,
      steps: [
        {
          id: 1,
          title: `Isolate Impaired ${target?.name || 'Primary Node'}`,
          action: 'Drain connection pool & revoke write lock',
          isHighRisk: false,
          status: 'completed',
          log: `[00:01.2] Connection pool drained: 142 connections safely terminated.`,
        },
        {
          id: 2,
          title: 'Human Commander Approval Gate',
          action: isDb ? 'High-risk database replica promotion authorization' : 'Service failover verification',
          isHighRisk: true,
          status: 'waiting_approval',
          log: '[00:02.0] Execution paused: Awaiting cryptographic signature from authorized commander.',
        },
        {
          id: 3,
          title: isDb ? 'Promote Standby Read Replica' : 'Restart Container Pods',
          action: isDb ? 'Execute replica failover & VIP cutover' : 'Zero-downtime rolling restart',
          isHighRisk: false,
          status: 'pending',
          log: isDb ? '[00:04.8] Replication lag 0B. Standby replica promoted to Master.' : '[00:03.5] Pods restarted.',
        },
        {
          id: 4,
          title: 'Invalidate Stale Redis Cache Keys',
          action: 'Purge session cache & update connection strings',
          isHighRisk: false,
          status: 'pending',
          log: '[00:06.1] Flushed stale keys. Redis ping: PONG.',
        },
        {
          id: 5,
          title: 'Rolling Restart API Gateway',
          action: 'Zero-downtime traffic shift to healthy replicas',
          isHighRisk: false,
          status: 'pending',
          log: '[00:08.5] Health checks passed: 10/10 pods reporting 200 OK.',
        },
      ],
    };

    this.notify();
  }

  public async approveGate(commanderAddress?: string): Promise<void> {
    if (!this.activeJob) return;

    const address = commanderAddress || MST_CONFIG.operatorAddress;
    const sigResult = await mstBlockchain.signApprovalGate({
      incidentId: this.activeJob.id,
      stepTitle: 'Human Commander Approval Gate',
      targetService: this.activeJob.targetNodeId,
      commanderAddress: address,
    });

    this.activeJob.approvalSignature = sigResult.signature;
    this.activeJob.steps[1].status = 'completed';
    this.activeJob.steps[1].log = `[00:03.1] Cryptographically signed on MST Testnet (TxHash: ${sigResult.hash}). Approval accepted.`;
    this.activeJob.status = 'RUNNING';

    // Auto-advance subsequent steps
    setTimeout(() => {
      if (!this.activeJob) return;
      this.activeJob.steps[2].status = 'completed';
      this.notify();

      setTimeout(() => {
        if (!this.activeJob) return;
        this.activeJob.steps[3].status = 'completed';
        this.notify();

        setTimeout(() => {
          if (!this.activeJob) return;
          this.activeJob.steps[4].status = 'completed';
          this.activeJob.status = 'COMPLETED';

          // Restore target node
          this.setNodeStatus(this.activeJob.targetNodeId, 'healthy');
          this.notify();
        }, 800);
      }, 800);
    }, 800);

    this.notify();
  }

  public resetRecovery(): void {
    this.activeJob = null;
    this.notify();
  }
}

export const clusterState = new ClusterStateManager();
