/**
 * Horizon Unified Cluster State Manager
 * Reactive state store managing nodes, active recovery jobs, and audit logs.
 */
import type { SystemNode, AuditLogEntry } from '@/types';
import { DependencyGraph } from './dependencyGraph';
import { mstBlockchain, MST_CONFIG } from './mstBlockchain';
import { autoLoggingRateLimiter } from './nftMetadata';

export interface RecoveryJobStep {
  id: number;
  title: string;
  service: string;
  action: string;
  isHighRisk: boolean;
  status: 'completed' | 'running' | 'waiting_approval' | 'pending';
  log: string;
  tier?: number;
}

export interface RecoveryJobState {
  id: string;
  targetNodeId: string;
  targetNodeName: string;
  status: 'PENDING' | 'RUNNING' | 'PAUSED_APPROVAL' | 'COMPLETED' | 'FAILED';
  currentStepIndex: number;
  approvalSignature?: string;
  blastRadius: string[];
  detectedAt: number;
  resolvedAt?: number;
  elapsedMs?: number;
  steps: RecoveryJobStep[];
}

class ClusterStateManager {
  private nodes: Map<string, SystemNode> = new Map();
  private graph: DependencyGraph = new DependencyGraph();
  private auditLogs: AuditLogEntry[] = [];
  private activeJob: RecoveryJobState | null = null;
  private listeners: Set<() => void> = new Set();
  private autoRemediate: boolean = true;

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

    this.nodes.clear();
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

  public isAutoRemediate(): boolean {
    return this.autoRemediate;
  }

  public setAutoRemediate(val: boolean): void {
    this.autoRemediate = val;
    this.notify();
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

  public addAuditLog(entry: AuditLogEntry, tierKey?: string | number): void {
    const rateStatus = autoLoggingRateLimiter.recordLog(tierKey);
    const enrichedEntry: AuditLogEntry = {
      ...entry,
      rateLimitStatus: {
        limit: rateStatus.limit,
        remaining: rateStatus.remaining,
        tier: rateStatus.tier,
      },
    };
    this.auditLogs.unshift(enrichedEntry);
    if (this.auditLogs.length > 200) this.auditLogs.pop();
    this.notify();
  }

  public startRecovery(targetNodeId?: string): void {
    let targetId = targetNodeId;
    if (!targetId) {
      const downNode = Array.from(this.nodes.values()).find(
        (n) => n.status === 'down' || n.status === 'degraded'
      );
      targetId = downNode?.id || 'db-primary';
    }

    const target = this.nodes.get(targetId) || Array.from(this.nodes.values())[0];
    if (!target) return;

    const blast = this.graph.computeBlastRadius(target.id);
    const steps: RecoveryJobStep[] = [];
    let stepId = 1;

    // Step 1: Isolation
    steps.push({
      id: stepId++,
      title: `Isolate Impaired ${target.name}`,
      service: `${target.id} (${target.type})`,
      action: target.type === 'database' ? 'Drain connection pool & revoke write lock' : 'Divert ingress traffic away from degraded pods',
      isHighRisk: false,
      status: 'completed',
      log: `[00:01.1] ${target.name} isolated. Active traffic drained safely.`,
      tier: 0,
    });

    // Step 2: Human Commander Approval Gate (High-Risk)
    const requiresHighRiskApproval = target.type === 'database' || blast.severity === 'critical';
    steps.push({
      id: stepId++,
      title: 'Human Commander Approval Gate',
      service: 'Horizon Cryptographic Orchestrator',
      action: requiresHighRiskApproval
        ? `Cryptographic authorization for ${target.name} state failover (EIP-712)`
        : `Service mutation verification for ${target.name}`,
      isHighRisk: true,
      status: 'waiting_approval',
      log: '[00:02.0] Execution paused at gate: Awaiting BridgeKey EIP-712 cryptographic signature.',
      tier: 0,
    });

    // Step 3: Primary Target Restoration
    steps.push({
      id: stepId++,
      title: target.type === 'database'
        ? `Promote Standby Replica for ${target.name}`
        : target.type === 'cache'
        ? `Flush & Warmup ${target.name}`
        : `Rolling Zero-Downtime Restart of ${target.name}`,
      service: `${target.id} (${target.type})`,
      action: target.type === 'database'
        ? 'Execute replica promotion & repoint virtual IP'
        : target.type === 'cache'
        ? 'Purge stale keys & rehydrate from persistent store'
        : 'Trigger rolling container pod replacement',
      isHighRisk: false,
      status: 'pending',
      log: `Rebuilding primary state for ${target.name}.`,
      tier: 1,
    });

    // Step 4+: Cascading Downstream Caches
    const downstreamCaches = blast.affectedNodeIds
      .map((id) => this.nodes.get(id))
      .filter((n): n is SystemNode => n?.type === 'cache');

    downstreamCaches.forEach((c) => {
      steps.push({
        id: stepId++,
        title: `Invalidate Stale Cache: ${c.name}`,
        service: `${c.id} (cache)`,
        action: 'Purge dirty keys and update database connection pool',
        isHighRisk: false,
        status: 'pending',
        log: `Flushing stale keys in ${c.name}.`,
        tier: 2,
      });
    });

    // Step 5+: Cascading Downstream Apps & Gateways
    const downstreamApps = blast.affectedNodeIds
      .map((id) => this.nodes.get(id))
      .filter((n): n is SystemNode => n?.type === 'application' || n?.type === 'gateway');

    downstreamApps.forEach((app) => {
      steps.push({
        id: stepId++,
        title: `Rolling Restart: ${app.name}`,
        service: `${app.id} (${app.type})`,
        action: 'Zero-downtime rolling restart & health probe verification',
        isHighRisk: false,
        status: 'pending',
        log: `Rolling restart initiated for ${app.name}.`,
        tier: 3,
      });
    });

    // Final Verification Step
    steps.push({
      id: stepId++,
      title: 'Cryptographic Audit & Merkle Proof Anchoring',
      service: 'MST Testnet Validator (Chain 91562037)',
      action: 'Anchor recovery transaction hash and Merkle root on-chain',
      isHighRisk: false,
      status: 'pending',
      log: 'Post-recovery verification and immutable ledger anchoring.',
      tier: 4,
    });

    this.activeJob = {
      id: `INC-${Date.now().toString().slice(-4)}`,
      targetNodeId: target.id,
      targetNodeName: target.name,
      status: 'PAUSED_APPROVAL',
      currentStepIndex: 1,
      blastRadius: blast.affectedNodeIds,
      detectedAt: Date.now(),
      steps,
    };

    this.addAuditLog({
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      actor: 'AUTONOMOUS ORCHESTRATOR',
      action: `Incident Declared: ${target.name}`,
      details: `Generated ${steps.length} topological recovery steps. Blast radius: ${blast.affectedNodeIds.length} nodes impacted.`,
      severity: 'warning',
    });

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
    this.activeJob.steps[1].log = `[00:03.1] Cryptographically signed on MST Testnet (TxHash: ${sigResult.hash.slice(0, 10)}...). Resuming execution.`;
    this.activeJob.status = 'RUNNING';

    this.addAuditLog({
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      actor: `COMMANDER (${address.slice(0, 8)}...)`,
      action: `EIP-712 Gate Approved: ${this.activeJob.targetNodeName}`,
      details: `Cryptographic approval verified on MST Testnet (TxHash: ${sigResult.hash}).`,
      severity: 'info',
    });

    let nextIdx = 2;
    const advanceNext = () => {
      if (!this.activeJob) return;
      if (nextIdx < this.activeJob.steps.length) {
        this.activeJob.steps[nextIdx].status = 'completed';
        this.activeJob.currentStepIndex = nextIdx;
        nextIdx++;
        this.notify();
        setTimeout(advanceNext, 700);
      } else {
        this.activeJob.status = 'COMPLETED';
        this.activeJob.resolvedAt = Date.now();
        this.activeJob.elapsedMs = this.activeJob.resolvedAt - this.activeJob.detectedAt;

        const nodesToHeal = [this.activeJob.targetNodeId, ...this.activeJob.blastRadius];
        nodesToHeal.forEach((id) => this.setNodeStatus(id, 'healthy'));

        this.addAuditLog({
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          actor: 'AUTONOMOUS ORCHESTRATOR',
          action: `Incident Resolved: ${this.activeJob.targetNodeName}`,
          details: `Cluster fully restored in ${(this.activeJob.elapsedMs / 1000).toFixed(1)}s. 0 cycle deadlocks detected.`,
          severity: 'info',
        });

        this.notify();
      }
    };

    setTimeout(advanceNext, 600);
    this.notify();
  }

  public resetRecovery(): void {
    this.activeJob = null;
    this.notify();
  }

  public setCustomTopology(newNodes: SystemNode[], topologyName: string = 'Custom Architecture'): void {
    this.nodes.clear();
    this.graph.clear();

    newNodes.forEach((node) => {
      this.nodes.set(node.id, { ...node, status: 'healthy', consecutive_failures: 0 });
      this.graph.addNode(node);
    });

    newNodes.forEach((node) => {
      node.dependencies.forEach((dep) => {
        if (this.nodes.has(dep)) {
          this.graph.addDependency(node.id, dep);
        }
      });
    });

    this.activeJob = null;

    this.addAuditLog({
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      actor: 'AI AGENT (Sarvam Architect)',
      action: `Deploy Custom Topology: ${topologyName}`,
      details: `Reconfigured cluster with ${newNodes.length} nodes and dynamic DAG dependency hierarchy.`,
      severity: 'info',
    });

    this.notify();
  }

  public resetToDefaultTopology(): void {
    this.seedInitialState();
    this.activeJob = null;
    this.notify();
  }
}

export const clusterState = new ClusterStateManager();
