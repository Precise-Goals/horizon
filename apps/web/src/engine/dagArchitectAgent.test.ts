import { describe, it, expect } from 'bun:test';
import { dagArchitectAgent } from './dagArchitectAgent';
import { clusterState } from './state';

describe('DagArchitectAgent Engine Suite', () => {
  it('synthesizes e-commerce microservices flow into valid acyclic DAG and tiers', () => {
    const prompt = 'We run an e-commerce platform with MySQL master, Redis cache, Auth worker, Stripe payment service, Order API, Envoy Gateway, and Next.js frontend.';
    const result = dagArchitectAgent.synthesizeArchitecture(prompt);

    expect(result.cycleDetected).toBe(false);
    expect(result.nodes.length).toBeGreaterThanOrEqual(5);
    expect(result.topologicalLevels.length).toBeGreaterThanOrEqual(3);

    // Root database should be in Tier 0
    expect(result.topologicalLevels[0]).toContain('db-mysql-master');

    // Generated YAML must follow Horizon specification
    expect(result.yamlPipeline).toContain('apiVersion: horizon.recovery.io/v1alpha1');
    expect(result.yamlPipeline).toContain('kind: AutonomousRecoveryPipeline');
    expect(result.yamlPipeline).toContain('db-mysql-master');
    expect(result.yamlPipeline).toContain('topologicalLevels:');
  });

  it('synthesizes GenAI Vector RAG stack with vector stores in Tier 0', () => {
    const prompt = 'Design a GenAI LLM RAG inference pipeline with pgvector, Milvus vector store, Redis semantic cache, embedding chunking worker, and vLLM inference server.';
    const result = dagArchitectAgent.synthesizeArchitecture(prompt);

    expect(result.cycleDetected).toBe(false);
    expect(result.architectureName).toContain('GenAI');
    expect(result.nodes.some((n) => n.id === 'vector-milvus')).toBe(true);
    expect(result.nodes.some((n) => n.id === 'db-pgvector')).toBe(true);

    // Both vector stores must be foundational (Level 0)
    expect(result.topologicalLevels[0]).toContain('db-pgvector');
    expect(result.topologicalLevels[0]).toContain('vector-milvus');
  });

  it('synthesizes FinTech Core Banking & Ledger mesh with EIP-712 governance flag', () => {
    const prompt = 'FinTech banking platform with PostgreSQL ledger, Kafka event log, fraud detection worker, core accounts API, and PCI edge gateway.';
    const result = dagArchitectAgent.synthesizeArchitecture(prompt);

    expect(result.cycleDetected).toBe(false);
    expect(result.architectureName).toContain('FinTech');
    expect(result.nodes.some((n) => n.id === 'db-ledger-master')).toBe(true);
    expect(result.yamlPipeline).toContain('BridgeKey EIP-712');
  });

  it('accurately catches circular dependency deadlock trap and flags cycle warning', () => {
    const prompt = 'Simulate a circular deadlock where service A and service B depend on each other.';
    const result = dagArchitectAgent.synthesizeArchitecture(prompt);

    expect(result.cycleDetected).toBe(true);
    expect(result.cycleExplanation).toBeDefined();
    expect(result.cycleExplanation).toContain('Cycle Path Detected');
    expect(result.yamlPipeline).toContain('REJECTED_CIRCULAR_DEPENDENCY');
  });

  it('deploys synthesized custom topology directly to clusterState', () => {
    const prompt = 'High-scale OTT streaming video platform with ScyllaDB, Redis manifest cache, FFmpeg transcoding workers, and Cloudflare gateway.';
    const result = dagArchitectAgent.synthesizeArchitecture(prompt);

    clusterState.setCustomTopology(result.nodes, result.architectureName);

    const activeNodes = clusterState.getNodes();
    expect(activeNodes.length).toBe(result.nodes.length);
    expect(activeNodes.some((n) => n.id === 'db-scylla-catalog')).toBe(true);

    // Graph must have been updated
    const graphData = clusterState.getGraph().getGraphData();
    expect(graphData.nodes.length).toBe(result.nodes.length);

    // Reset back to baseline for subsequent test isolation
    clusterState.resetToDefaultTopology();
    expect(clusterState.getNodes().length).toBe(7);
  });
});
