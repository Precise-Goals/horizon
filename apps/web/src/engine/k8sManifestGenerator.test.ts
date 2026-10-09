import { describe, it, expect } from 'bun:test';
import {
  generateKubernetesManifests,
  computeManifestChecksums,
} from './k8sManifestGenerator';
import type { CustomNodeDefinition } from './customDagPipeline';

describe('Kubernetes Manifest & Background Checksum Generator Suite', () => {
  const mockNodes: CustomNodeDefinition[] = [
    {
      id: 'db-postgres',
      name: 'PostgreSQL Database',
      type: 'database',
      dependencies: [],
    },
    {
      id: 'redis-cache',
      name: 'Redis Cache',
      type: 'cache',
      dependencies: ['db-postgres'],
    },
    {
      id: 'api-service',
      name: 'Order API Gateway',
      type: 'gateway',
      dependencies: ['redis-cache'],
    },
  ];

  it('generates production-grade Kubernetes Deployments, Services, and ConfigMap with liveness probes', () => {
    const yaml = generateKubernetesManifests('resilience-cluster', mockNodes);
    expect(yaml).toContain('apiVersion: apps/v1');
    expect(yaml).toContain('kind: Deployment');
    expect(yaml).toContain('kind: Service');
    expect(yaml).toContain('kind: ConfigMap');
    expect(yaml).toContain('livenessProbe:');
    expect(yaml).toContain('failureThreshold: 3');
    expect(yaml).toContain('db-postgres');
    expect(yaml).toContain('redis-cache');
    expect(yaml).toContain('api-service');
  });

  it('computes background SHA-256 checksums for YAML, K8s manifests, and DAG topology', async () => {
    const dagYaml = 'apiVersion: horizon.recovery.io/v1alpha1\nkind: AutonomousRecoveryPipeline';
    const k8sYaml = generateKubernetesManifests('resilience-cluster', mockNodes);

    const report = await computeManifestChecksums(dagYaml, k8sYaml, mockNodes);

    expect(report.dagYamlChecksum.startsWith('0x')).toBe(true);
    expect(report.k8sYamlChecksum.startsWith('0x')).toBe(true);
    expect(report.topologyChecksum.startsWith('0x')).toBe(true);
    expect(report.compositeClusterChecksum.startsWith('0x')).toBe(true);
    expect(report.dagYamlChecksum.length).toBe(66);
    expect(report.totalK8sResources).toBe(mockNodes.length * 2 + 1);
  });
});
