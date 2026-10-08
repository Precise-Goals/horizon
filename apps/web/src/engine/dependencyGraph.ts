/**
 * Horizon Autonomous Recovery Engine — Directed Acyclic Graph (DAG)
 * Pure TypeScript implementation for monolithic React/Vite/Bun deployment.
 */
import type { SystemNode } from '@/types';

export interface BlastRadiusResult {
  targetNodeId: string;
  affectedNodeIds: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  cascadeDepth: number;
}

export class DependencyGraph {
  private adjacency: Map<string, Set<string>> = new Map(); // dependent -> depends_on (upstream)
  private reverseAdjacency: Map<string, Set<string>> = new Map(); // provider -> dependents (downstream)
  private nodeMetadata: Map<string, SystemNode> = new Map();

  constructor() {
    this.clear();
  }

  public clear(): void {
    this.adjacency.clear();
    this.reverseAdjacency.clear();
    this.nodeMetadata.clear();
  }

  public addNode(node: SystemNode): void {
    this.nodeMetadata.set(node.id, node);
    if (!this.adjacency.has(node.id)) {
      this.adjacency.set(node.id, new Set());
    }
    if (!this.reverseAdjacency.has(node.id)) {
      this.reverseAdjacency.set(node.id, new Set());
    }
  }

  public addDependency(dependentId: string, dependsOnId: string): void {
    if (!this.adjacency.has(dependentId)) {
      this.adjacency.set(dependentId, new Set());
    }
    if (!this.reverseAdjacency.has(dependsOnId)) {
      this.reverseAdjacency.set(dependsOnId, new Set());
    }
    this.adjacency.get(dependentId)!.add(dependsOnId);
    this.reverseAdjacency.get(dependsOnId)!.add(dependentId);
  }

  public getNode(nodeId: string): SystemNode | undefined {
    return this.nodeMetadata.get(nodeId);
  }

  public getAllNodes(): SystemNode[] {
    return Array.from(this.nodeMetadata.values());
  }

  public hasCycle(): boolean {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = this.adjacency.get(nodeId) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const nodeId of this.nodeMetadata.keys()) {
      if (!visited.has(nodeId)) {
        if (dfs(nodeId)) return true;
      }
    }
    return false;
  }

  /**
   * Topological recovery sort: Returns nodes in order of bottom-up dependency.
   * Foundational services (Databases, Caches) appear first, followed by microservices, then gateways, then UI.
   */
  public getTopologicalRecoveryOrder(): string[] {
    const inDegree = new Map<string, number>();
    for (const nodeId of this.nodeMetadata.keys()) {
      inDegree.set(nodeId, 0);
    }

    // inDegree counts how many providers this node depends on
    for (const [, providers] of this.adjacency.entries()) {
      for (const provider of providers) {
        // provider is needed first
        if (inDegree.has(provider)) {
          // provider has lower in-degree
        }
      }
    }

    // Kahn's algorithm: Start with nodes that have NO upstream dependencies (independent foundation)
    // Dependencies map: dependent -> depends_on
    // So if A depends on B, B must be recovered before A.
    // Edge in recovery graph: B -> A
    const recoveryInDegree = new Map<string, number>();
    for (const id of this.nodeMetadata.keys()) {
      recoveryInDegree.set(id, 0);
    }

    for (const [dependent, providers] of this.adjacency.entries()) {
      for (const provider of providers) {
        if (this.nodeMetadata.has(provider)) {
          recoveryInDegree.set(dependent, (recoveryInDegree.get(dependent) || 0) + 1);
        }
      }
    }

    const queue: string[] = [];
    for (const [nodeId, degree] of recoveryInDegree.entries()) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    const sortedOrder: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      sortedOrder.push(current);

      const dependents = this.reverseAdjacency.get(current) || new Set();
      for (const dependent of dependents) {
        const nextDegree = (recoveryInDegree.get(dependent) || 1) - 1;
        recoveryInDegree.set(dependent, nextDegree);
        if (nextDegree === 0) {
          queue.push(dependent);
        }
      }
    }

    return sortedOrder;
  }

  /**
   * Calculates all downstream services impaired when targetNode fails.
   */
  public computeBlastRadius(failedNodeId: string): BlastRadiusResult {
    const affected = new Set<string>();
    const queue: { id: string; depth: number }[] = [{ id: failedNodeId, depth: 0 }];
    let maxDepth = 0;

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      maxDepth = Math.max(maxDepth, depth);

      const dependents = this.reverseAdjacency.get(id) || new Set();
      for (const dep of dependents) {
        if (!affected.has(dep)) {
          affected.add(dep);
          queue.push({ id: dep, depth: depth + 1 });
        }
      }
    }

    const count = affected.size;
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (count >= 5 || maxDepth >= 3) severity = 'critical';
    else if (count >= 3) severity = 'high';
    else if (count >= 1) severity = 'medium';

    return {
      targetNodeId: failedNodeId,
      affectedNodeIds: Array.from(affected),
      severity,
      cascadeDepth: maxDepth,
    };
  }

  public getGraphData(): { nodes: { id: string; name: string; type: string; status: string }[]; edges: { source: string; target: string }[] } {
    const nodes = Array.from(this.nodeMetadata.values()).map((n) => ({
      id: n.id,
      name: n.name,
      type: n.type,
      status: n.status,
    }));

    const edges: { source: string; target: string }[] = [];
    for (const [dependent, providers] of this.adjacency.entries()) {
      for (const provider of providers) {
        edges.push({ source: provider, target: dependent });
      }
    }

    return { nodes, edges };
  }
}
