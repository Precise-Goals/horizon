import { describe, expect, it } from 'bun:test';
import {
  parseCustomDagYaml,
  validateAndCompilePipeline,
  convertCustomNodesToSystemNodes,
  serializePipelineToYaml,
  PIPELINE_TEMPLATES,
  ECOMMERCE_TEMPLATE_YAML,
  STREAMING_TEMPLATE_YAML,
  TICKET_BOOKING_TEMPLATE_YAML,
  BLOGGING_CMS_TEMPLATE_YAML,
  GENAI_RAG_TEMPLATE_YAML,
  FINTECH_TRADING_TEMPLATE_YAML,
  MINIMAL_3TIER_TEMPLATE_YAML,
  BLANK_TEMPLATE_YAML,
} from './customDagPipeline';

describe('Custom DAG YAML Pipeline & Simulator Engine', () => {
  it('parses and validates all pre-built templates without errors', () => {
    expect(PIPELINE_TEMPLATES.length).toBe(8);

    const templates = [
      ECOMMERCE_TEMPLATE_YAML,
      STREAMING_TEMPLATE_YAML,
      TICKET_BOOKING_TEMPLATE_YAML,
      BLOGGING_CMS_TEMPLATE_YAML,
      GENAI_RAG_TEMPLATE_YAML,
      FINTECH_TRADING_TEMPLATE_YAML,
      MINIMAL_3TIER_TEMPLATE_YAML,
      BLANK_TEMPLATE_YAML,
    ];

    templates.forEach((yaml) => {
      const spec = parseCustomDagYaml(yaml);
      expect(spec.spec.nodes.length).toBeGreaterThanOrEqual(3);

      const validation = validateAndCompilePipeline(spec);
      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
      expect(validation.cycleDetected).toBe(false);
      expect(validation.topologicalLevels.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('correctly calculates Kahn topological tiers and blast radius for E-Commerce template', () => {
    const spec = parseCustomDagYaml(ECOMMERCE_TEMPLATE_YAML);
    const validation = validateAndCompilePipeline(spec);

    expect(validation.isValid).toBe(true);
    expect(validation.nodes.length).toBe(7);

    // Tier 0 must contain foundational database (pg-primary)
    expect(validation.topologicalLevels[0]).toContain('pg-primary');

    // pg-primary failure blast radius must cascade down to all 6 downstream microservices
    const dbBlast = validation.blastRadiusMap['pg-primary'];
    expect(dbBlast).toContain('redis-cluster');
    expect(dbBlast).toContain('kafka-broker');
    expect(dbBlast).toContain('auth-service');
    expect(dbBlast).toContain('order-processor');
    expect(dbBlast).toContain('envoy-ingress');
    expect(dbBlast).toContain('checkout-portal');
    expect(dbBlast.length).toBe(6);

    // Gateway failure should only affect checkout portal
    const gwBlast = validation.blastRadiusMap['envoy-ingress'];
    expect(gwBlast).toEqual(['checkout-portal']);
  });

  it('detects circular dependency deadlocks and flags error', () => {
    const cycleYaml = `
apiVersion: horizon.recovery.io/v1alpha1
kind: AutonomousRecoveryPipeline
metadata:
  name: cyclic-deadlock-cluster
spec:
  nodes:
    - id: node-a
      name: Service A
      type: application
      dependencies:
        - node-b
    - id: node-b
      name: Service B
      type: application
      dependencies:
        - node-a
`;
    const spec = parseCustomDagYaml(cycleYaml);
    const validation = validateAndCompilePipeline(spec);

    expect(validation.isValid).toBe(false);
    expect(validation.cycleDetected).toBe(true);
    expect(validation.errors.some((e) => e.includes('Circular dependency deadlock'))).toBe(true);
  });

  it('flags missing dependencies and duplicate node IDs', () => {
    const badYaml = `
apiVersion: horizon.recovery.io/v1alpha1
kind: AutonomousRecoveryPipeline
metadata:
  name: invalid-cluster
spec:
  nodes:
    - id: node-1
      name: Service 1
      type: database
      dependencies:
        - non-existent-db
    - id: node-1
      name: Service 1 Duplicate
      type: cache
      dependencies: []
`;
    const spec = parseCustomDagYaml(badYaml);
    const validation = validateAndCompilePipeline(spec);

    expect(validation.isValid).toBe(false);
    expect(validation.errors.some((e) => e.includes('Duplicate node id "node-1"'))).toBe(true);
    expect(validation.errors.some((e) => e.includes('undefined dependency "non-existent-db"'))).toBe(true);
  });

  it('converts custom nodes to valid SystemNode structures for cluster state', () => {
    const spec = parseCustomDagYaml(MINIMAL_3TIER_TEMPLATE_YAML);
    const validation = validateAndCompilePipeline(spec);
    const systemNodes = convertCustomNodesToSystemNodes(validation.nodes);

    expect(systemNodes.length).toBe(3);
    expect(systemNodes[0].id).toBe('db-core');
    expect(systemNodes[0].type).toBe('database');
    expect(systemNodes[0].status).toBe('healthy');
  });

  it('serializes pipeline back to clean YAML manifest with recovery tiers', () => {
    const spec = parseCustomDagYaml(MINIMAL_3TIER_TEMPLATE_YAML);
    const validation = validateAndCompilePipeline(spec);
    const serialized = serializePipelineToYaml(
      validation.pipelineName,
      validation.nodes,
      validation.topologicalLevels,
      validation.blastRadiusMap
    );

    expect(serialized).toContain('AutonomousRecoveryPipeline');
    expect(serialized).toContain('minimal-resilient-cluster');
    expect(serialized).toContain('recoveryTiers:');
    expect(serialized).toContain('db-core');
    expect(serialized).toContain('downstreamBlastRadius:');
  });
});
