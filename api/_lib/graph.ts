/**
 * Horizon Graph Engine (Pure Functions)
 * Implements DAG construction, cycle detection, reverse blast radius, and topological levels.
 */
import type { SystemNode } from '../../packages/shared/src/index';

export interface GraphAnalysis {
  hasCycle: boolean;
  cyclePath: string[];
  blastRadius: string[];
  topologicalLevels: string[][];
  rootCauseId?: string;
}

export class DependencyGraphEngine {
  private adjacency: Map<string, Set<string>> = new Map(); // node -> dependencies
  private reverseAdjacency: Map<string, Set<string>> = new Map(); // dependency -> dependents

  constructor(nodes: SystemNode[]) {
    nodes.forEach((n) => {
      if (!this.adjacency.has(n.id)) this.adjacency.set(n.id, new Set());
      if (!this.reverseAdjacency.has(n.id)) this.reverseAdjacency.set(n.id, new Set());

      n.dependencies.forEach((dep) => {
        this.adjacency.get(n.id)!.add(dep);
        if (!this.reverseAdjacency.has(dep)) this.reverseAdjacency.set(dep, new Set());
        this.reverseAdjacency.get(dep)!.add(n.id);
      });
    });
  }

  /**
   * Detects cycles using DFS. Returns cycle path if found.
   */
  public detectCycle(): { hasCycle: boolean; cyclePath: string[] } {
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const path: string[] = [];

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);
      path.push(nodeId);

      const neighbors = this.adjacency.get(nodeId) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          path.push(neighbor);
          return true;
        }
      }

      recStack.delete(nodeId);
      path.pop();
      return false;
    };

    for (const node of this.adjacency.keys()) {
      if (!visited.has(node)) {
        if (dfs(node)) {
          return { hasCycle: true, cyclePath: path };
        }
      }
    }

    return { hasCycle: false, cyclePath: [] };
  }

  /**
   * Computes downstream blast radius of a failing node via reverse traversal.
   */
  public getBlastRadius(failedNodeId: string): string[] {
    const affected = new Set<string>();
    const queue: string[] = [failedNodeId];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (!affected.has(curr)) {
        affected.add(curr);
        const dependents = this.reverseAdjacency.get(curr) || new Set();
        for (const dep of dependents) {
          queue.push(dep);
        }
      }
    }

    return Array.from(affected);
  }

  /**
   * Generates topological recovery levels for the affected subgraph.
   * Nodes in level 0 are foundational (dependencies satisfied first).
   */
  public computeTopologicalRecoveryLevels(affectedNodeIds: string[]): string[][] {
    const subSet = new Set(affectedNodeIds);
    // In-degree for subgraph: how many unfinished dependencies inside the affected set
    const inDegree = new Map<string, number>();

    affectedNodeIds.forEach((id) => {
      const deps = this.adjacency.get(id) || new Set();
      let count = 0;
      deps.forEach((d) => {
        if (subSet.has(d)) count++;
      });
      inDegree.set(id, count);
    });

    const levels: string[][] = [];
    let remaining = new Set(affectedNodeIds);

    while (remaining.size > 0) {
      const currentLevel: string[] = [];
      remaining.forEach((id) => {
        if (inDegree.get(id) === 0) {
          currentLevel.push(id);
        }
      });

      if (currentLevel.length === 0) {
        // Cycle in affected subgraph
        break;
      }

      levels.push(currentLevel);
      currentLevel.forEach((resolved) => {
        remaining.delete(resolved);
        const dependents = this.reverseAdjacency.get(resolved) || new Set();
        dependents.forEach((dep) => {
          if (remaining.has(dep)) {
            inDegree.set(dep, (inDegree.get(dep) || 1) - 1);
          }
        });
      });
    }

    return levels;
  }
}
