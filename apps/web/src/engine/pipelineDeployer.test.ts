import { describe, it, expect, beforeEach } from 'bun:test';
import {
  SynchronousPipelineDeployer,
  type SynchronousNodeState,
  type DeploymentProgress,
} from './pipelineDeployer';
import { clusterState } from './state';
import type { CustomNodeDefinition } from './customDagPipeline';

describe('Synchronous Pipeline Deployer & Checksum Verifier Suite', () => {
  let deployer: SynchronousPipelineDeployer;

  const mockNodes: CustomNodeDefinition[] = [
    {
      id: 'db-tier',
      name: 'PostgreSQL Database',
      type: 'database',
      dependencies: [],
    },
    {
      id: 'cache-tier',
      name: 'Redis Cache',
      type: 'cache',
      dependencies: ['db-tier'],
    },
    {
      id: 'service-tier',
      name: 'Order API Service',
      type: 'application',
      dependencies: ['db-tier', 'cache-tier'],
    },
  ];

  beforeEach(() => {
    deployer = new SynchronousPipelineDeployer();
    clusterState.resetToDefaultTopology();
  });

  it('orders nodes in strict topological Kahn DAG sequence (parents first)', () => {
    const sorted = deployer.sortNodesTopologically(mockNodes);
    expect(sorted.length).toBe(3);
    expect(sorted[0].id).toBe('db-tier');
    expect(sorted[1].id).toBe('cache-tier');
    expect(sorted[2].id).toBe('service-tier');
  });

  it('verifies SHA-256 checksums synchronously and turns all healthy nodes green', async () => {
    const progressHistory: DeploymentProgress[] = [];

    const finalProgress = await deployer.execute({
      pipelineName: 'test-healthy-pipeline',
      nodes: mockNodes,
      autoRemediate: true,
      stepDelayMs: 20,
      onProgress: (prog) => {
        progressHistory.push(JSON.parse(JSON.stringify(prog)));
      },
    });

    expect(finalProgress.phase).toBe('completed');
    expect(finalProgress.totalNodes).toBe(3);
    expect(finalProgress.nodes.length).toBe(3);

    // Every node must turn verified_green and have a valid SHA-256 checksum
    finalProgress.nodes.forEach((node) => {
      expect(node.status).toBe('verified_green');
      expect(node.checksum).toBeDefined();
      expect(node.checksum?.startsWith('0x')).toBe(true);
      expect(node.checksum?.length).toBe(66); // 0x + 64 hex chars
    });

    // Verify synchronous progression occurred
    expect(progressHistory.length).toBeGreaterThan(3);
  });

  it('halts on node failure, detects auto-remedy is ON, auto-fixes, turns node green, and completes', async () => {
    const logs: string[] = [];

    const finalProgress = await deployer.execute({
      pipelineName: 'test-auto-remedy-pipeline',
      nodes: mockNodes,
      autoRemediate: true,
      stepDelayMs: 20,
      isNodeFailing: (nodeId) => nodeId === 'cache-tier', // Simulate failure on cache-tier
      onLog: (l) => logs.push(l),
    });

    expect(finalProgress.phase).toBe('completed');
    expect(finalProgress.nodes[1].nodeId).toBe('cache-tier');
    expect(finalProgress.nodes[1].status).toBe('verified_green');
    expect(finalProgress.nodes[1].remedyAction).toBeDefined();

    // Verify logs show failure halt and auto-remedy engagement
    expect(logs.some((l) => l.includes('[DEPLOYMENT HALTED]'))).toBe(true);
    expect(logs.some((l) => l.includes('[AUTO REMEDY: ON]'))).toBe(true);
    expect(logs.some((l) => l.includes('[AUTO REMEDY SUCCESS]'))).toBe(true);
  });

  it('halts on node failure when auto-remedy is OFF, waits for manual fix, and resumes green', async () => {
    const logs: string[] = [];
    let haltedPromiseReport: DeploymentProgress | null = null;

    // Start deployment asynchronously in manual mode
    const deployPromise = deployer.execute({
      pipelineName: 'test-manual-mode-pipeline',
      nodes: mockNodes,
      autoRemediate: false,
      stepDelayMs: 30,
      isNodeFailing: (nodeId) => nodeId === 'cache-tier',
      onProgress: (prog) => {
        if (prog.phase === 'paused_on_failure') {
          haltedPromiseReport = prog;
        }
      },
      onLog: (l) => logs.push(l),
    });

    // Wait until deployment halts at cache-tier
    await new Promise((r) => setTimeout(r, 150));

    expect(deployer.getProgress().phase).toBe('paused_on_failure');
    expect(deployer.getProgress().failedNodeId).toBe('cache-tier');
    expect(logs.some((l) => l.includes('[AUTO REMEDY: OFF]'))).toBe(true);

    // Operator triggers manual remedy
    deployer.triggerManualRemedy();

    const finalProgress = await deployPromise;
    expect(finalProgress.phase).toBe('completed');
    expect(finalProgress.nodes[1].status).toBe('verified_green');
    expect(finalProgress.nodes[2].status).toBe('verified_green');
    expect(logs.some((l) => l.includes('[MANUAL OPERATOR ACTION RECEIVED]'))).toBe(true);
    expect(logs.some((l) => l.includes('[MANUAL REMEDY SUCCESS]'))).toBe(true);
  });

  it('strictly refuses to proceed to node success if healing verification fails', async () => {
    const logs: string[] = [];

    const finalProgress = await deployer.execute({
      pipelineName: 'test-unhealed-pipeline',
      nodes: mockNodes,
      autoRemediate: true,
      stepDelayMs: 20,
      isNodeFailing: (nodeId) => nodeId === 'cache-tier',
      verifyHealing: () => false, // Healing verification fails!
      onLog: (l) => logs.push(l),
    });

    // Must be paused_on_failure, cache-tier must NOT be verified_green!
    expect(finalProgress.phase).toBe('paused_on_failure');
    expect(finalProgress.failedNodeId).toBe('cache-tier');
    expect(finalProgress.nodes[1].status).toBe('failed');
    expect(finalProgress.nodes[2].status).toBe('pending');
    expect(logs.some((l) => l.includes('[REMEDY PIPELINE INCOMPLETE]'))).toBe(true);
  });

  it('computes remedy pipeline checksum on failure, verifies completion, and resumes green one by one', async () => {
    const logs: string[] = [];
    const remedyChecksumsCaptured: { nodeId: string; checksum: string }[] = [];

    const finalProgress = await deployer.execute({
      pipelineName: 'test-remedy-checksum-pipeline',
      nodes: mockNodes,
      autoRemediate: true,
      stepDelayMs: 20,
      isNodeFailing: (nodeId) => nodeId === 'cache-tier',
      onRemedyChecksum: (nodeId, remedyChecksum) => {
        remedyChecksumsCaptured.push({ nodeId, checksum: remedyChecksum });
      },
      onLog: (l) => logs.push(l),
    });

    expect(finalProgress.phase).toBe('completed');
    expect(remedyChecksumsCaptured.length).toBe(1);
    expect(remedyChecksumsCaptured[0].nodeId).toBe('cache-tier');
    expect(remedyChecksumsCaptured[0].checksum.startsWith('0x')).toBe(true);

    // Verify cache-tier has remedyChecksum and remedyCompleted flag
    const cacheNode = finalProgress.nodes.find((n) => n.nodeId === 'cache-tier')!;
    expect(cacheNode.status).toBe('verified_green');
    expect(cacheNode.remedyCompleted).toBe(true);
    expect(cacheNode.remedyChecksum).toBe(remedyChecksumsCaptured[0].checksum);

    // Verify log confirms remedy completion before sequential resumption
    expect(logs.some((l) => l.includes('[REMEDY PIPELINE VERIFIED COMPLETE]'))).toBe(true);
    expect(logs.some((l) => l.includes('Resuming deployment pipeline one-by-one'))).toBe(true);

    // Downstream service-tier successfully resumed and completed green
    const serviceNode = finalProgress.nodes.find((n) => n.nodeId === 'service-tier')!;
    expect(serviceNode.status).toBe('verified_green');
  });
});
