/**
 * Horizon Custom DAG YAML Pipeline Engine & Failure Simulator
 * Parses, validates, and simulates failures on user-defined DAG infrastructure pipelines.
 * Enforces acyclic Kahn topological sorting O(V+E) and computes dynamic blast radius.
 */

import type { SystemNode, NodeType } from '../types';

export interface CustomNodeDefinition {
  id: string;
  name: string;
  type: NodeType;
  dependencies: string[];
  healthProbe?: {
    protocol?: string;
    endpoint?: string;
    port?: number;
    timeoutMs?: number;
    intervalSeconds?: number;
  };
  recoveryPolicy?: {
    playbook?: string;
    rollbackStrategy?: string;
    requiresApproval?: boolean;
  };
}

export interface CustomPipelineSpec {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    environment?: string;
    description?: string;
    version?: string;
  };
  spec: {
    governanceGate?: {
      required?: boolean;
      standard?: string;
      chainId?: number;
      contract?: string;
    };
    nodes: CustomNodeDefinition[];
  };
}

export interface PipelineValidationResult {
  isValid: boolean;
  pipelineName: string;
  nodes: CustomNodeDefinition[];
  topologicalLevels: string[][];
  blastRadiusMap: Record<string, string[]>;
  cycleDetected: boolean;
  cyclePath?: string[];
  errors: string[];
  warnings: string[];
}

export interface PipelineTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  nodeCount: number;
  tierCount: number;
  yaml: string;
}

// ============================================================================
// PRE-BUILT PRODUCTION-GRADE DAG PIPELINE TEMPLATES
// ============================================================================

export const ECOMMERCE_TEMPLATE_YAML = `apiVersion: horizon.recovery.io/v1alpha1
kind: AutonomousRecoveryPipeline
metadata:
  name: e-commerce-resilience-mesh
  environment: production
  description: High-availability 7-tier e-commerce microservices mesh with state caching and ingress
spec:
  governanceGate:
    required: true
    standard: EIP-712
    chainId: 91562037
    contract: "0x3EDad230dCFc6Dd3C357490b9feDa49639646BB7"
  nodes:
    - id: pg-primary
      name: PostgreSQL Primary Database
      type: database
      dependencies: []
      healthProbe:
        protocol: SQL_PING
        port: 5432
        timeoutMs: 1500
      recoveryPolicy:
        playbook: database_failover
        rollbackStrategy: read_replica_promotion
        requiresApproval: true

    - id: redis-cluster
      name: Redis Distributed Session Cache
      type: cache
      dependencies:
        - pg-primary
      healthProbe:
        protocol: TCP_PING
        port: 6379
        timeoutMs: 500
      recoveryPolicy:
        playbook: cache_purge
        rollbackStrategy: warm_cache_hydration
        requiresApproval: false

    - id: kafka-broker
      name: Kafka Order Stream Broker
      type: cache
      dependencies:
        - pg-primary
      healthProbe:
        protocol: TCP_PING
        port: 9092
        timeoutMs: 1000
      recoveryPolicy:
        playbook: service_restart
        rollbackStrategy: consumer_rebalance
        requiresApproval: false

    - id: auth-service
      name: OAuth2 & JWT Identity Service
      type: application
      dependencies:
        - pg-primary
        - redis-cluster
      healthProbe:
        protocol: HTTP_GET
        endpoint: /health
        port: 8081
        timeoutMs: 800
      recoveryPolicy:
        playbook: service_restart
        rollbackStrategy: circuit_breaker_open
        requiresApproval: false

    - id: order-processor
      name: Order Fulfillment Worker Pool
      type: application
      dependencies:
        - pg-primary
        - kafka-broker
      healthProbe:
        protocol: HTTP_GET
        endpoint: /ready
        port: 8082
        timeoutMs: 1200
      recoveryPolicy:
        playbook: service_restart
        rollbackStrategy: dead_letter_queue_flush
        requiresApproval: false

    - id: envoy-ingress
      name: Envoy API Edge Gateway
      type: gateway
      dependencies:
        - auth-service
        - order-processor
      healthProbe:
        protocol: HTTP_GET
        endpoint: /healthz
        port: 443
        timeoutMs: 500
      recoveryPolicy:
        playbook: dynamic_traffic_shift
        rollbackStrategy: fallback_origin_routing
        requiresApproval: false

    - id: checkout-portal
      name: Next.js Client Storefront Portal
      type: application
      dependencies:
        - envoy-ingress
      healthProbe:
        protocol: HTTP_GET
        endpoint: /api/health
        port: 3000
        timeoutMs: 600
      recoveryPolicy:
        playbook: service_restart
        rollbackStrategy: static_maintenance_page
        requiresApproval: false
`;

export const GENAI_RAG_TEMPLATE_YAML = `apiVersion: horizon.recovery.io/v1alpha1
kind: AutonomousRecoveryPipeline
metadata:
  name: genai-rag-inference-mesh
  environment: production
  description: GPU-accelerated Generative AI RAG architecture with vector retrieval and streaming LLM
spec:
  governanceGate:
    required: true
    standard: EIP-712
    chainId: 91562037
    contract: "0x3EDad230dCFc6Dd3C357490b9feDa49639646BB7"
  nodes:
    - id: pgvector-store
      name: PostgreSQL pgvector Semantic Store
      type: database
      dependencies: []
      healthProbe:
        protocol: SQL_PING
        port: 5432
        timeoutMs: 2000
      recoveryPolicy:
        playbook: database_failover
        requiresApproval: true

    - id: semantic-cache
      name: Redis Semantic Prompt Cache
      type: cache
      dependencies:
        - pgvector-store
      healthProbe:
        protocol: TCP_PING
        port: 6379
        timeoutMs: 400
      recoveryPolicy:
        playbook: cache_purge
        requiresApproval: false

    - id: embeddings-worker
      name: Text Embedding Batch Worker
      type: application
      dependencies:
        - pgvector-store
        - semantic-cache
      healthProbe:
        protocol: HTTP_GET
        endpoint: /health
        port: 8000
        timeoutMs: 1500
      recoveryPolicy:
        playbook: service_restart
        requiresApproval: false

    - id: vllm-gpu-engine
      name: vLLM GPU TensorRT Engine
      type: application
      dependencies:
        - semantic-cache
      healthProbe:
        protocol: HTTP_GET
        endpoint: /v1/models
        port: 8080
        timeoutMs: 3000
      recoveryPolicy:
        playbook: service_restart
        requiresApproval: false

    - id: rag-api-gateway
      name: FastAPI Streaming Inference Gateway
      type: gateway
      dependencies:
        - embeddings-worker
        - vllm-gpu-engine
      healthProbe:
        protocol: HTTP_GET
        endpoint: /healthz
        port: 443
        timeoutMs: 600
      recoveryPolicy:
        playbook: dynamic_traffic_shift
        requiresApproval: false

    - id: ai-chat-client
      name: Enterprise AI Copilot Client
      type: application
      dependencies:
        - rag-api-gateway
      healthProbe:
        protocol: HTTP_GET
        endpoint: /ready
        port: 3000
        timeoutMs: 500
      recoveryPolicy:
        playbook: service_restart
        requiresApproval: false
`;

export const FINTECH_TRADING_TEMPLATE_YAML = `apiVersion: horizon.recovery.io/v1alpha1
kind: AutonomousRecoveryPipeline
metadata:
  name: fintech-ledger-trading-mesh
  environment: production
  description: Sub-millisecond double-entry ledger with real-time risk evaluator and FIX trading gateway
spec:
  governanceGate:
    required: true
    standard: EIP-712
    chainId: 91562037
    contract: "0x3EDad230dCFc6Dd3C357490b9feDa49639646BB7"
  nodes:
    - id: immutable-ledger-db
      name: PostgreSQL Double-Entry Ledger
      type: database
      dependencies: []
      healthProbe:
        protocol: SQL_PING
        port: 5432
        timeoutMs: 1000
      recoveryPolicy:
        playbook: database_failover
        requiresApproval: true

    - id: matching-engine-cache
      name: In-Memory Order Book State (Aerospike)
      type: cache
      dependencies:
        - immutable-ledger-db
      healthProbe:
        protocol: TCP_PING
        port: 3000
        timeoutMs: 200
      recoveryPolicy:
        playbook: cache_purge
        requiresApproval: false

    - id: risk-evaluator
      name: Pre-Trade Real-Time Risk Evaluator
      type: application
      dependencies:
        - immutable-ledger-db
        - matching-engine-cache
      healthProbe:
        protocol: HTTP_GET
        endpoint: /risk/health
        port: 9001
        timeoutMs: 300
      recoveryPolicy:
        playbook: service_restart
        requiresApproval: false

    - id: fix-trading-gateway
      name: FIX Protocol Low-Latency Ingress Gateway
      type: gateway
      dependencies:
        - risk-evaluator
      healthProbe:
        protocol: TCP_PING
        port: 9800
        timeoutMs: 150
      recoveryPolicy:
        playbook: dynamic_traffic_shift
        requiresApproval: false

    - id: merkle-audit-logger
      name: MST On-Chain Merkle Audit Notary
      type: application
      dependencies:
        - immutable-ledger-db
      healthProbe:
        protocol: HTTP_GET
        endpoint: /audit/status
        port: 8090
        timeoutMs: 800
      recoveryPolicy:
        playbook: service_restart
        requiresApproval: false

    - id: trader-terminal
      name: Institutional Trading Workstation
      type: application
      dependencies:
        - fix-trading-gateway
        - merkle-audit-logger
      healthProbe:
        protocol: HTTP_GET
        endpoint: /terminal/ready
        port: 443
        timeoutMs: 400
      recoveryPolicy:
        playbook: service_restart
        requiresApproval: false
`;

export const MINIMAL_3TIER_TEMPLATE_YAML = `apiVersion: horizon.recovery.io/v1alpha1
kind: AutonomousRecoveryPipeline
metadata:
  name: minimal-resilient-cluster
  environment: staging
  description: Lightweight 3-tier foundation verifying bottom-up database to ingress recovery
spec:
  governanceGate:
    required: true
    standard: EIP-712
    chainId: 91562037
  nodes:
    - id: db-core
      name: Aurora MySQL Database Cluster
      type: database
      dependencies: []
      healthProbe:
        protocol: SQL_PING
        port: 3306
        timeoutMs: 1000
      recoveryPolicy:
        playbook: database_failover
        requiresApproval: true

    - id: api-backend
      name: Go Microservice Backend
      type: application
      dependencies:
        - db-core
      healthProbe:
        protocol: HTTP_GET
        endpoint: /healthz
        port: 8080
        timeoutMs: 500
      recoveryPolicy:
        playbook: service_restart
        requiresApproval: false

    - id: edge-ingress
      name: Cloudflare Ingress Gateway
      type: gateway
      dependencies:
        - api-backend
      healthProbe:
        protocol: HTTP_GET
        endpoint: /ready
        port: 443
        timeoutMs: 300
      recoveryPolicy:
        playbook: dynamic_traffic_shift
        requiresApproval: false
`;

export const BLANK_TEMPLATE_YAML = `apiVersion: horizon.recovery.io/v1alpha1
kind: AutonomousRecoveryPipeline
metadata:
  name: my-custom-pipeline
  environment: production
  description: Custom user-defined infrastructure dependency topology
spec:
  governanceGate:
    required: true
    standard: EIP-712
    chainId: 91562037
    contract: "0x3EDad230dCFc6Dd3C357490b9feDa49639646BB7"
  nodes:
    # 1. Foundational state stores (Databases) have NO upstream dependencies:
    - id: my-database
      name: Custom Primary Database
      type: database               # database | cache | application | gateway
      dependencies: []
      healthProbe:
        protocol: SQL_PING
        port: 5432
        timeoutMs: 1000
      recoveryPolicy:
        playbook: database_failover
        requiresApproval: true

    # 2. Caches or message queues depending on database:
    - id: my-cache
      name: Custom In-Memory Cache
      type: cache
      dependencies:
        - my-database
      healthProbe:
        protocol: TCP_PING
        port: 6379
        timeoutMs: 500
      recoveryPolicy:
        playbook: cache_purge
        requiresApproval: false

    # 3. Application microservices depending on database and cache:
    - id: my-app-service
      name: Custom Application Microservice
      type: application
      dependencies:
        - my-database
        - my-cache
      healthProbe:
        protocol: HTTP_GET
        endpoint: /health
        port: 8080
        timeoutMs: 800
      recoveryPolicy:
        playbook: service_restart
        requiresApproval: false

    # 4. Ingress edge gateway:
    - id: my-gateway
      name: Custom API Edge Gateway
      type: gateway
      dependencies:
        - my-app-service
      healthProbe:
        protocol: HTTP_GET
        endpoint: /healthz
        port: 443
        timeoutMs: 400
      recoveryPolicy:
        playbook: dynamic_traffic_shift
        requiresApproval: false
`;

export const PIPELINE_TEMPLATES: PipelineTemplate[] = [
  {
    id: 'ecommerce',
    name: 'E-Commerce Resilience Mesh (7 Tiers)',
    category: 'Microservices',
    description: 'PostgreSQL → Redis & Kafka → Auth & Order Workers → Envoy Gateway → Next.js Storefront',
    nodeCount: 7,
    tierCount: 4,
    yaml: ECOMMERCE_TEMPLATE_YAML,
  },
  {
    id: 'genai',
    name: 'GenAI Vector RAG & LLM Inference (6 Tiers)',
    category: 'AI / LLM',
    description: 'pgvector & Redis Semantic Cache → Embeddings Worker & vLLM GPU → FastAPI Gateway → AI Client',
    nodeCount: 6,
    tierCount: 4,
    yaml: GENAI_RAG_TEMPLATE_YAML,
  },
  {
    id: 'fintech',
    name: 'FinTech Trading & Immutable Ledger (6 Tiers)',
    category: 'FinTech / Web3',
    description: 'Ledger DB → In-Memory Order Book → Pre-Trade Risk → FIX Gateway & Merkle Notary → Trader Terminal',
    nodeCount: 6,
    tierCount: 4,
    yaml: FINTECH_TRADING_TEMPLATE_YAML,
  },
  {
    id: 'minimal',
    name: 'Minimal 3-Tier Baseline (3 Tiers)',
    category: 'Cloud Baseline',
    description: 'Aurora Database → Go Microservice Backend → Cloudflare Edge Ingress Gateway',
    nodeCount: 3,
    tierCount: 3,
    yaml: MINIMAL_3TIER_TEMPLATE_YAML,
  },
  {
    id: 'blank',
    name: 'Custom Blank Template (Editable Skeleton)',
    category: 'Starter',
    description: 'Annotated YAML starter skeleton ready for custom node definitions and dependency edges',
    nodeCount: 4,
    tierCount: 4,
    yaml: BLANK_TEMPLATE_YAML,
  },
];

// ============================================================================
// PURE TYPESCRIPT RESILIENT YAML PARSER & VALIDATOR
// ============================================================================

/**
 * Resilient, zero-external-dependency YAML parser for Horizon DAG recovery pipelines.
 * Parses YAML structured manifests and extracts metadata, nodes, dependencies, and health probes.
 */
export function parseCustomDagYaml(yamlText: string): CustomPipelineSpec {
  if (!yamlText || !yamlText.trim()) {
    throw new Error('YAML pipeline definition is empty.');
  }

  const lines = yamlText.split(/\r?\n/);
  let pipelineName = 'custom-pipeline';
  let environment = 'production';
  let description = '';
  const nodes: CustomNodeDefinition[] = [];

  let currentNode: Partial<CustomNodeDefinition> | null = null;
  let inNodesList = false;
  let currentListKey: string | null = null;
  let currentSection: string | null = null; // 'healthProbe' | 'recoveryPolicy'

  const flushCurrentNode = () => {
    if (currentNode && currentNode.id) {
      nodes.push({
        id: String(currentNode.id).trim(),
        name: currentNode.name ? String(currentNode.name).trim() : String(currentNode.id).trim(),
        type: (currentNode.type as NodeType) || 'application',
        dependencies: Array.isArray(currentNode.dependencies) ? currentNode.dependencies : [],
        healthProbe: currentNode.healthProbe,
        recoveryPolicy: currentNode.recoveryPolicy,
      });
      currentNode = null;
      currentSection = null;
      currentListKey = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const lineWithoutComment = rawLine.split('#')[0];
    const trimmed = lineWithoutComment.trim();

    if (!trimmed) continue;

    // Check top-level metadata
    if (trimmed.startsWith('name:')) {
      const val = trimmed.replace(/^name:\s*/, '').replace(/["']/g, '').trim();
      if (!inNodesList) pipelineName = val;
      else if (currentNode) currentNode.name = val;
      continue;
    }

    if (trimmed.startsWith('environment:')) {
      environment = trimmed.replace(/^environment:\s*/, '').replace(/["']/g, '').trim();
      continue;
    }

    if (trimmed.startsWith('description:')) {
      description = trimmed.replace(/^description:\s*/, '').replace(/["']/g, '').trim();
      continue;
    }

    if (trimmed.startsWith('nodes:')) {
      inNodesList = true;
      continue;
    }

    // Entering a new node in the list
    if (inNodesList && (trimmed.startsWith('- id:') || trimmed.startsWith('- id :'))) {
      flushCurrentNode();
      const idVal = trimmed.replace(/^-\s*id\s*:\s*/, '').replace(/["']/g, '').trim();
      currentNode = {
        id: idVal,
        name: idVal,
        type: 'application',
        dependencies: [],
      };
      continue;
    }

    // Node properties
    if (currentNode) {
      // Inline dependencies: dependencies: ["db-primary", "redis-cache"] or dependencies: []
      if (trimmed.startsWith('dependencies:')) {
        const afterColon = trimmed.replace(/^dependencies:\s*/, '').trim();
        if (afterColon.startsWith('[') && afterColon.endsWith(']')) {
          const inner = afterColon.slice(1, -1).trim();
          if (!inner) {
            currentNode.dependencies = [];
          } else {
            currentNode.dependencies = inner
              .split(',')
              .map((d) => d.replace(/["'\s]/g, '').trim())
              .filter(Boolean);
          }
          currentListKey = null;
        } else {
          currentNode.dependencies = [];
          currentListKey = 'dependencies';
        }
        continue;
      }

      // List item under dependencies: - db-primary
      if (currentListKey === 'dependencies' && trimmed.startsWith('-')) {
        const depId = trimmed.replace(/^-\s*/, '').replace(/["']/g, '').trim();
        if (depId && currentNode.dependencies) {
          currentNode.dependencies.push(depId);
        }
        continue;
      }

      // Other node keys
      if (trimmed.startsWith('type:')) {
        const rawType = trimmed.replace(/^type:\s*/, '').replace(/["']/g, '').toLowerCase().trim();
        const validTypes: NodeType[] = ['database', 'cache', 'application', 'gateway'];
        currentNode.type = validTypes.includes(rawType as NodeType) ? (rawType as NodeType) : 'application';
        currentListKey = null;
        continue;
      }

      if (trimmed.startsWith('name:')) {
        currentNode.name = trimmed.replace(/^name:\s*/, '').replace(/["']/g, '').trim();
        currentListKey = null;
        continue;
      }

      if (trimmed.startsWith('healthProbe:')) {
        currentSection = 'healthProbe';
        currentListKey = null;
        currentNode.healthProbe = currentNode.healthProbe || {};
        continue;
      }

      if (trimmed.startsWith('recoveryPolicy:')) {
        currentSection = 'recoveryPolicy';
        currentListKey = null;
        currentNode.recoveryPolicy = currentNode.recoveryPolicy || {};
        continue;
      }

      if (currentSection === 'healthProbe' && currentNode.healthProbe) {
        if (trimmed.startsWith('protocol:')) {
          currentNode.healthProbe.protocol = trimmed.replace(/^protocol:\s*/, '').replace(/["']/g, '').trim();
        } else if (trimmed.startsWith('endpoint:')) {
          currentNode.healthProbe.endpoint = trimmed.replace(/^endpoint:\s*/, '').replace(/["']/g, '').trim();
        } else if (trimmed.startsWith('port:')) {
          currentNode.healthProbe.port = parseInt(trimmed.replace(/^port:\s*/, ''), 10) || undefined;
        } else if (trimmed.startsWith('timeoutMs:')) {
          currentNode.healthProbe.timeoutMs = parseInt(trimmed.replace(/^timeoutMs:\s*/, ''), 10) || undefined;
        }
      }

      if (currentSection === 'recoveryPolicy' && currentNode.recoveryPolicy) {
        if (trimmed.startsWith('playbook:')) {
          currentNode.recoveryPolicy.playbook = trimmed.replace(/^playbook:\s*/, '').replace(/["']/g, '').trim();
        } else if (trimmed.startsWith('rollbackStrategy:')) {
          currentNode.recoveryPolicy.rollbackStrategy = trimmed.replace(/^rollbackStrategy:\s*/, '').replace(/["']/g, '').trim();
        } else if (trimmed.startsWith('requiresApproval:')) {
          currentNode.recoveryPolicy.requiresApproval = trimmed.replace(/^requiresApproval:\s*/, '').trim().toLowerCase() === 'true';
        }
      }
    }
  }

  flushCurrentNode();

  if (nodes.length === 0) {
    throw new Error('No valid nodes defined in the YAML under "spec.nodes". Please define at least one node with an "id:".');
  }

  return {
    apiVersion: 'horizon.recovery.io/v1alpha1',
    kind: 'AutonomousRecoveryPipeline',
    metadata: {
      name: pipelineName,
      environment,
      description,
    },
    spec: {
      nodes,
    },
  };
}

/**
 * Validates a pipeline definition: checks node ID format, missing dependencies,
 * acyclic condition via Kahn's algorithm, and computes blast radiuses for every node.
 */
export function validateAndCompilePipeline(spec: CustomPipelineSpec): PipelineValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const nodes = spec.spec?.nodes || [];

  if (nodes.length === 0) {
    errors.push('Pipeline must contain at least one node in spec.nodes.');
    return {
      isValid: false,
      pipelineName: spec.metadata?.name || 'unnamed-pipeline',
      nodes: [],
      topologicalLevels: [],
      blastRadiusMap: {},
      cycleDetected: false,
      errors,
      warnings,
    };
  }

  // 1. Verify Node ID uniqueness and format
  const seenIds = new Set<string>();
  nodes.forEach((n, idx) => {
    if (!n.id || !n.id.trim()) {
      errors.push(`Node at index ${idx} is missing an 'id'.`);
      return;
    }
    const cleanId = n.id.trim();
    if (seenIds.has(cleanId)) {
      errors.push(`Duplicate node id "${cleanId}" detected. Every node ID must be unique.`);
    }
    seenIds.add(cleanId);
  });

  // 2. Verify all dependencies point to existing nodes
  nodes.forEach((n) => {
    n.dependencies.forEach((dep) => {
      if (!seenIds.has(dep)) {
        errors.push(`Node "${n.id}" references undefined dependency "${dep}".`);
      }
      if (dep === n.id) {
        errors.push(`Node "${n.id}" cannot depend on itself (self-referential loop).`);
      }
    });
  });

  // 3. Cycle Detection & Topological Levels via Kahn's Algorithm
  const nodeMap = new Map<string, CustomNodeDefinition>(nodes.map((n) => [n.id, n]));
  const inDegree = new Map<string, number>();
  nodes.forEach((n) => {
    const validDeps = n.dependencies.filter((d) => seenIds.has(d));
    inDegree.set(n.id, validDeps.length);
  });

  const levels: string[][] = [];
  const resolved = new Set<string>();
  let cycleDetected = false;
  let cyclePath: string[] | undefined;

  while (resolved.size < nodes.length) {
    const currentTier: string[] = [];
    nodes.forEach((n) => {
      if (!resolved.has(n.id) && inDegree.get(n.id) === 0) {
        currentTier.push(n.id);
      }
    });

    if (currentTier.length === 0) {
      cycleDetected = true;
      const unresolved = nodes.filter((n) => !resolved.has(n.id)).map((n) => n.id);
      cyclePath = unresolved;
      errors.push(
        `Circular dependency deadlock detected between nodes: [${unresolved.join(', ')}]. Systems would wait indefinitely in an outage!`
      );
      break;
    }

    levels.push(currentTier);
    currentTier.forEach((id) => resolved.add(id));

    nodes.forEach((n) => {
      if (!resolved.has(n.id)) {
        const remainingDeps = n.dependencies.filter((d) => !resolved.has(d));
        inDegree.set(n.id, remainingDeps.length);
      }
    });
  }

  // 4. Compute BFS Blast Radius for every node
  const blastRadiusMap: Record<string, string[]> = {};
  nodes.forEach((target) => {
    const downstream = new Set<string>();
    const queue = [target.id];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      for (const candidate of nodes) {
        if (candidate.dependencies.includes(curr) && !downstream.has(candidate.id)) {
          downstream.add(candidate.id);
          queue.push(candidate.id);
        }
      }
    }

    blastRadiusMap[target.id] = Array.from(downstream);
  });

  // Check warnings (e.g. database without approval or missing health probe)
  nodes.forEach((n) => {
    if (n.type === 'database' && !n.recoveryPolicy?.requiresApproval) {
      warnings.push(`Node "${n.id}" is a database but does not have requiresApproval: true.`);
    }
  });

  return {
    isValid: errors.length === 0,
    pipelineName: spec.metadata?.name || 'custom-pipeline',
    nodes,
    topologicalLevels: levels,
    blastRadiusMap,
    cycleDetected,
    cyclePath,
    errors,
    warnings,
  };
}

/**
 * Converts validated custom nodes into standard SystemNodes for state.ts.
 */
export function convertCustomNodesToSystemNodes(nodes: CustomNodeDefinition[]): SystemNode[] {
  return nodes.map((n) => ({
    id: n.id,
    name: n.name || n.id,
    type: n.type || 'application',
    status: 'healthy',
    dependencies: n.dependencies || [],
    consecutive_failures: 0,
  }));
}

/**
 * Serializes a compiled pipeline back to clean, standardized Horizon YAML.
 */
export function serializePipelineToYaml(
  pipelineName: string,
  nodes: CustomNodeDefinition[],
  levels: string[][],
  blastRadiusMap: Record<string, string[]>
): string {
  const timestamp = new Date().toISOString();

  const nodeBlocks = nodes.map((n) => {
    const tierIdx = levels.findIndex((lvl) => lvl.includes(n.id));
    const blast = blastRadiusMap[n.id] || [];
    const isDb = n.type === 'database';
    const playbook = n.recoveryPolicy?.playbook || (isDb ? 'database_failover' : n.type === 'cache' ? 'cache_purge' : n.type === 'gateway' ? 'dynamic_traffic_shift' : 'service_restart');
    const requiresApproval = n.recoveryPolicy?.requiresApproval ?? isDb;

    const probe = n.healthProbe || {};
    const protocol = probe.protocol || (isDb ? 'SQL_PING' : n.type === 'cache' ? 'TCP_PING' : 'HTTP_GET');
    const port = probe.port || (isDb ? 5432 : n.type === 'cache' ? 6379 : n.type === 'gateway' ? 443 : 8080);
    const timeoutMs = probe.timeoutMs || 1000;

    return `    - id: ${n.id}
      name: "${n.name}"
      type: ${n.type}
      tier: ${tierIdx >= 0 ? tierIdx : 0}
      dependencies: [${n.dependencies.map((d) => `"${d}"`).join(', ')}]
      downstreamBlastRadius: [${blast.map((b) => `"${b}"`).join(', ')}]
      healthProbe:
        protocol: ${protocol}
        port: ${port}
        timeoutMs: ${timeoutMs}
      recoveryPolicy:
        playbook: ${playbook}
        requiresHumanApproval: ${requiresApproval ? 'true # Gated by EIP-712' : 'false'}`;
  });

  return `apiVersion: horizon.recovery.io/v1alpha1
kind: AutonomousRecoveryPipeline
metadata:
  name: "${pipelineName}"
  generatedAt: "${timestamp}"
  verification: "KAHN_TOPOLOGICAL_SORT_O(V+E)"
spec:
  governanceGate:
    required: true
    standard: "EIP-712"
    chainId: 91562037
    contract: "0x3EDad230dCFc6Dd3C357490b9feDa49639646BB7"
  recoveryTiers:
${levels
  .map(
    (lvl, idx) => `    - tier: ${idx}
      nodes: [${lvl.map((id) => `"${id}"`).join(', ')}]`
  )
  .join('\n')}
  nodes:
${nodeBlocks.join('\n\n')}
`;
}
