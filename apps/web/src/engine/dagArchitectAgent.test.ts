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

    // Generated YAML must follow Horizon specification and be strictly derived from DAG
    expect(result.yamlPipeline).toContain('apiVersion: horizon.recovery.io/v1alpha1');
    expect(result.yamlPipeline).toContain('kind: AutonomousRecoveryPipeline');
    expect(result.yamlPipeline).toContain('db-mysql-master');
    expect(result.yamlPipeline).toContain('topologicalLevels:');
    expect(result.yamlPipeline).toContain('downstreamBlastRadius:');
    expect(result.yamlPipeline).toContain('healthProbe:');
    expect(result.yamlPipeline).toContain('recoveryPolicy:');
    expect(result.yamlPipeline).toContain('resilienceSlo:');
    expect(result.yamlPipeline).toContain('targetMTTRSeconds: 45');
    expect(result.yamlPipeline).toContain('kahnSortCycleSafetyVerified: true');
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

  it('compiles and validates raw structured JSON output from Sarvam AI API', () => {
    const rawAiJson = {
      architectureName: 'Sarvam FinTech Mesh',
      summary: 'Real-time settlement engine with immutable audit ledger.',
      reasoning: 'Foundational PostgreSQL ledger recovers first, followed by Kafka and fraud API.',
      nodes: [
        { id: 'db-ledger', name: 'PostgreSQL Ledger', type: 'database', dependencies: [] },
        { id: 'kafka-bus', name: 'Kafka Event Log', type: 'cache', dependencies: ['db-ledger'] },
        { id: 'fraud-worker', name: 'Fraud Detection Engine', type: 'application', dependencies: ['kafka-bus'] },
        { id: 'edge-gw', name: 'PCI-DSS Edge Gateway', type: 'gateway', dependencies: ['fraud-worker'] },
      ],
      cycleDetected: false,
    };

    const compiled = dagArchitectAgent.compileArchitectureFromJson(rawAiJson, 'FinTech settlement pipeline');
    expect(compiled).not.toBeNull();
    expect(compiled!.architectureName).toBe('Sarvam FinTech Mesh');
    expect(compiled!.cycleDetected).toBe(false);
    expect(compiled!.nodes.length).toBe(4);
    expect(compiled!.topologicalLevels.length).toBe(4);
    expect(compiled!.topologicalLevels[0]).toContain('db-ledger');
    expect(compiled!.topologicalLevels[3]).toContain('edge-gw');
    expect(compiled!.yamlPipeline).toContain('apiVersion: horizon.recovery.io/v1alpha1');
  });

  it('detects cycles when Sarvam AI JSON contains circular dependencies', () => {
    const cyclicJson = {
      architectureName: 'Deadlock Test',
      nodes: [
        { id: 'service-a', name: 'Service A', type: 'application', dependencies: ['service-b'] },
        { id: 'service-b', name: 'Service B', type: 'application', dependencies: ['service-a'] },
      ],
      cycleDetected: true,
      cycleExplanation: 'Mutual circular dependency between A and B',
    };

    const compiled = dagArchitectAgent.compileArchitectureFromJson(cyclicJson, 'Deadlock');
    expect(compiled).not.toBeNull();
    expect(compiled!.cycleDetected).toBe(true);
    expect(compiled!.cycleExplanation).toBeDefined();
  });
});
