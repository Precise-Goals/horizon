import React, { useState } from 'react';
import { motion, AnimatePresence, type BezierDefinition } from 'framer-motion';
import { Link } from 'react-router';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Terminal,
  Cpu,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Network,
  FileCode,
  BookOpen,
  Command,
  ArrowRight,
  Server,
  Layers,
  Lock,
  Globe,
  Radio,
  Zap,
  Code2,
  AlertTriangle,
  Info,
  CheckCircle2,
  HelpCircle,
  Hash,
  ChevronDown,
  ChevronRight,
  Workflow,
  Key,
  ShieldAlert,
} from 'lucide-react';

const EASE: BezierDefinition = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, duration: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: EASE },
  },
};

interface ToolParam {
  name: string;
  type: string;
  required: boolean;
  defaultVal: string;
  description: string;
}

interface McpToolDoc {
  name: string;
  signature: string;
  summary: string;
  description: string;
  paramsList: ToolParam[];
  returnsDoc: string;
  jsonRpcRequest: string;
  jsonRpcResponse: string;
  errorCodes: string[];
}

export const DocsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mcp' | 'slash' | 'cli' | 'api'>('mcp');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [mcpClient, setMcpClient] = useState<'claude' | 'cursor' | 'antigravity' | 'windsurf'>('claude');
  const [selectedToolIndex, setSelectedToolIndex] = useState<number>(0);
  const [payloadView, setPayloadView] = useState<'request' | 'response'>('request');
  const [apiLang, setApiLang] = useState<'curl' | 'ts' | 'python'>('curl');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  /* MCP Configurations for Claude Desktop, Cursor, Antigravity, and Windsurf */
  const mcpConfigs = {
    claude: JSON.stringify(
      {
        mcpServers: {
          horizon: {
            command: 'bunx',
            args: ['@horizon/mcp-server@latest'],
            env: {
              HORIZON_API_URL: 'https://horizon-recovery.vercel.app/api/v1',
              MST_CHAIN_ID: '91562037',
              MST_RPC_URL: 'https://testnet.mstscan.com/rpc',
              SARVAM_AGENT_ENABLED: 'true',
            },
          },
        },
      },
      null,
      2
    ),
    cursor: JSON.stringify(
      {
        mcpServers: {
          horizon: {
            url: 'https://horizon-recovery.vercel.app/api/v1/mcp',
            transport: 'sse',
            headers: {
              'X-Horizon-Client': 'cursor-agent',
              'X-MST-Chain': '91562037',
            },
          },
        },
      },
      null,
      2
    ),
    antigravity: JSON.stringify(
      {
        servers: [
          {
            name: 'horizon',
            command: 'bun',
            args: ['run', 'scripts/docker-agent.ts', '--mcp-stdio'],
            description: 'Horizon Autonomous Infrastructure Recovery & SRE Tool Engine',
          },
        ],
      },
      null,
      2
    ),
    windsurf: JSON.stringify(
      {
        mcpServers: {
          horizon: {
            command: 'npx',
            args: ['-y', '@horizon/mcp-server'],
            env: {
              HORIZON_API_URL: 'https://horizon-recovery.vercel.app/api/v1',
            },
          },
        },
      },
      null,
      2
    ),
  };

  /* Exhaustive MDN Web Docs Tool Catalogue */
  const mcpToolsFull: McpToolDoc[] = [
    {
      name: 'horizon_get_topology',
      signature: 'horizon_get_topology(options?: GetTopologyOptions): Promise<TopologyResult>',
      summary: 'Retrieves current cluster DAG topology, node health states, and service dependency edges.',
      description:
        'Queries the active Horizon recovery engine to obtain the complete directed acyclic graph (DAG). Evaluates Kahn topological levels, computes in-degree values, and details all monitored microservices, database backends, caches, and ingress proxies alongside their operational states.',
      paramsList: [
        {
          name: 'filterStatus',
          type: '"all" | "healthy" | "down" | "degraded"',
          required: false,
          defaultVal: '"all"',
          description: 'Filter return set to nodes matching the specified operational status.',
        },
        {
          name: 'includeMetrics',
          type: 'boolean',
          required: false,
          defaultVal: 'true',
          description: 'When true, attaches rolling CPU, memory, and p99 latency telemetry metrics to each node.',
        },
        {
          name: 'namespace',
          type: 'string',
          required: false,
          defaultVal: '"default"',
          description: 'Target Kubernetes or cloud infrastructure namespace to query.',
        },
      ],
      returnsDoc:
        'Returns an object containing `nodes` (array of SystemNode definitions), `edges` (directional dependency pairs), `topologicalLevels` (Kahn tiers 0..N), and `cycles` (array of cyclic dependency paths, empty if acyclic).',
      jsonRpcRequest: JSON.stringify(
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'horizon_get_topology',
            arguments: {
              filterStatus: 'all',
              includeMetrics: true,
            },
          },
        },
        null,
        2
      ),
      jsonRpcResponse: JSON.stringify(
        {
          jsonrpc: '2.0',
          id: 1,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  totalNodes: 7,
                  acyclicVerified: true,
                  topologicalLevels: [
                    ['db-primary'],
                    ['redis-cache', 'kafka-queue'],
                    ['auth-service', 'payment-worker'],
                    ['api-gateway'],
                    ['web-frontend'],
                  ],
                  activeIncidents: 0,
                  healthSummary: { healthy: 7, degraded: 0, down: 0 },
                }),
              },
            ],
          },
        },
        null,
        2
      ),
      errorCodes: ['-32602 (Invalid params)', 'ERR_NODE_NOT_FOUND', 'ERR_CLUSTER_UNREACHABLE'],
    },
    {
      name: 'horizon_simulate_failure',
      signature: 'horizon_simulate_failure(target: SimulateFailureOptions): Promise<ChaosResult>',
      summary: 'Injects simulated chaos/failure outage on any target microservice to evaluate resiliency.',
      description:
        'Triggers deterministic chaos engineering on the specified node in the dependency graph. Computes the downstream blast radius using Breadth-First Search (BFS), triggers cascading degradation alerts, and initiates an incident record in the autonomous watchdog.',
      paramsList: [
        {
          name: 'nodeId',
          type: 'string',
          required: true,
          defaultVal: 'None',
          description: 'Unique identifier of the target node to simulate failure upon (e.g., "db-primary", "redis-cache").',
        },
        {
          name: 'reason',
          type: 'string',
          required: false,
          defaultVal: '"Simulated chaos injection"',
          description: 'Operational narrative or ticket reason for the simulated outage.',
        },
        {
          name: 'consecutiveFailures',
          type: 'number',
          required: false,
          defaultVal: '3',
          description: 'Synthetic heartbeat probe failures before autonomous recovery triggers.',
        },
      ],
      returnsDoc:
        'Returns `{ success: boolean, incidentId: string, affectedNode: string, blastRadius: string[], estimatedRecoveryTimeSec: number }`.',
      jsonRpcRequest: JSON.stringify(
        {
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/call',
          params: {
            name: 'horizon_simulate_failure',
            arguments: {
              nodeId: 'db-primary',
              reason: 'Simulated storage disk timeout drill',
            },
          },
        },
        null,
        2
      ),
      jsonRpcResponse: JSON.stringify(
        {
          jsonrpc: '2.0',
          id: 2,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  incidentId: 'INC-8821',
                  affectedNode: 'db-primary',
                  blastRadius: ['redis-cache', 'auth-service', 'payment-worker', 'api-gateway', 'web-frontend'],
                  watchdogTriggered: true,
                  estimatedRecoveryTimeSec: 45,
                }),
              },
            ],
          },
        },
        null,
        2
      ),
      errorCodes: ['-32602 (Invalid params)', 'ERR_NODE_NOT_FOUND', 'ERR_SIMULATION_BLOCKED'],
    },
    {
      name: 'horizon_trigger_recovery',
      signature: 'horizon_trigger_recovery(options: RecoveryOptions): Promise<RecoveryJobResult>',
      summary: 'Executes Kahn’s bottom-up topological recovery sequence on damaged dependency hierarchy.',
      description:
        'Initiates autonomous recovery orchestration. Computes the Kahn topological tiers of damaged services and executes multi-step playbooks starting from Tier 0 (foundational storage) up to Tier N (ingress gateways). Enforces pre-flight health barriers before each tier transition.',
      paramsList: [
        {
          name: 'targetNodeId',
          type: 'string',
          required: true,
          defaultVal: 'None',
          description: 'Root failing node initiating the recovery cascade.',
        },
        {
          name: 'autoApproveLowRisk',
          type: 'boolean',
          required: false,
          defaultVal: 'true',
          description: 'When true, automatically advances low-risk container restarts without commander prompts.',
        },
        {
          name: 'dryRun',
          type: 'boolean',
          required: false,
          defaultVal: 'false',
          description: 'When true, synthesizes the execution plan without modifying cluster state.',
        },
      ],
      returnsDoc:
        'Returns `{ jobId: string, targetNode: string, steps: PlaybookStep[], currentStatus: string, requiresGateApproval: boolean }`.',
      jsonRpcRequest: JSON.stringify(
        {
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'horizon_trigger_recovery',
            arguments: {
              targetNodeId: 'db-primary',
              autoApproveLowRisk: true,
            },
          },
        },
        null,
        2
      ),
      jsonRpcResponse: JSON.stringify(
        {
          jsonrpc: '2.0',
          id: 3,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  jobId: 'REC-9942',
                  status: 'in_progress',
                  currentTier: 0,
                  totalSteps: 4,
                  requiresGateApproval: true,
                  steps: [
                    { id: 1, name: 'Promote Read Replica', risk: 'high', status: 'pending_approval' },
                    { id: 2, name: 'Flush Stale Connections', risk: 'low', status: 'pending' },
                    { id: 3, name: 'Warm Redis Cache', risk: 'low', status: 'pending' },
                    { id: 4, name: 'Restore Ingress Routing', risk: 'low', status: 'pending' },
                  ],
                }),
              },
            ],
          },
        },
        null,
        2
      ),
      errorCodes: ['ERR_UNAUTHORIZED_CUTOVER', 'ERR_NODE_NOT_FOUND', 'ERR_DAG_CYCLE_DETECTED'],
    },
    {
      name: 'horizon_sign_approval_gate',
      signature: 'horizon_sign_approval_gate(payload: ApprovalPayload): Promise<Web3SignatureResult>',
      summary: 'Cryptographically signs high-risk database or ingress cutover using BridgeKey EIP-712 on MST Testnet.',
      description:
        'Submits an EIP-712 typed data message to the operator’s Web3 wallet (BridgeKey / MetaMask) connected to MST Blockchain Testnet (Chain ID 91562037). Validates domain separator, Commander authorization, and unlocks execution of gated Tier 0 actions.',
      paramsList: [
        {
          name: 'incidentId',
          type: 'string',
          required: true,
          defaultVal: 'None',
          description: 'Unique incident identifier (e.g., "INC-8821").',
        },
        {
          name: 'stepId',
          type: 'number',
          required: true,
          defaultVal: 'None',
          description: 'Step identifier requiring cryptographic approval.',
        },
        {
          name: 'signerAddress',
          type: 'string',
          required: false,
          defaultVal: 'window.ethereum.selectedAddress',
          description: 'Ethereum address of the authorized operator/commander.',
        },
      ],
      returnsDoc:
        'Returns `{ approved: boolean, txHash: string, chainId: 91562037, signerAddress: string, blockExplorerUrl: string }`.',
      jsonRpcRequest: JSON.stringify(
        {
          jsonrpc: '2.0',
          id: 4,
          method: 'tools/call',
          params: {
            name: 'horizon_sign_approval_gate',
            arguments: {
              incidentId: 'INC-8821',
              stepId: 1,
            },
          },
        },
        null,
        2
      ),
      jsonRpcResponse: JSON.stringify(
        {
          jsonrpc: '2.0',
          id: 4,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  approved: true,
                  txHash: '0x8a7f92b4510cde739412e43bc0912f718aa019c084f90117849e7bce82eec384',
                  chainId: 91562037,
                  contractAddress: '0x3EDad230dCFc6Dd3C357490b9feDa49639646BB7',
                  blockExplorerUrl: 'https://testnet.mstscan.com/tx/0x8a7f92b4510cde739412e43bc0912f718aa019c084f90117849e7bce82eec384',
                }),
              },
            ],
          },
        },
        null,
        2
      ),
      errorCodes: ['ERR_BRIDGEKEY_TIMEOUT', 'ERR_USER_REJECTED', 'ERR_INVALID_CHAIN_ID'],
    },
    {
      name: 'horizon_verify_audit_proof',
      signature: 'horizon_verify_audit_proof(query: AuditProofQuery): Promise<MerkleAuditProofResult>',
      summary: 'Verifies SHA-256 Merkle audit root anchored on the MST Blockchain against state transition logs.',
      description:
        'Queries the MST Blockchain Testnet smart contract `HorizonAuditLedger` (0x3EDad2...) for the cryptographic Merkle root hash. Computes cryptographic state proof against local execution logs to ensure non-repudiation and zero tampering.',
      paramsList: [
        {
          name: 'logId',
          type: 'string',
          required: true,
          defaultVal: 'None',
          description: 'Unique recovery audit log identifier (e.g., "LOG-41982").',
        },
        {
          name: 'expectedHash',
          type: 'string',
          required: false,
          defaultVal: 'Computed locally',
          description: 'Expected SHA-256 state transition root hash to verify against blockchain state.',
        },
      ],
      returnsDoc:
        'Returns `{ verified: boolean, blockNumber: number, onChainHash: string, timestamp: number, rootVerified: boolean }`.',
      jsonRpcRequest: JSON.stringify(
        {
          jsonrpc: '2.0',
          id: 5,
          method: 'tools/call',
          params: {
            name: 'horizon_verify_audit_proof',
            arguments: {
              logId: 'LOG-41982',
            },
          },
        },
        null,
        2
      ),
      jsonRpcResponse: JSON.stringify(
        {
          jsonrpc: '2.0',
          id: 5,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  verified: true,
                  blockNumber: 4819203,
                  onChainHash: '0x3f5c9e29a881d3f9b94091eac609115fa01ec055819d20c571994e4d6a1ed81a',
                  contractAddress: '0x3EDad230dCFc6Dd3C357490b9feDa49639646BB7',
                  timestamp: 1770514800,
                  tamperEvident: true,
                }),
              },
            ],
          },
        },
        null,
        2
      ),
      errorCodes: ['ERR_AUDIT_NOT_FOUND', 'ERR_MERKLE_MISMATCH', 'ERR_RPC_CONNECTION_FAILURE'],
    },
    {
      name: 'horizon_synthesize_yaml',
      signature: 'horizon_synthesize_yaml(prompt: SynthesizeOptions): Promise<SynthesizedDagResult>',
      summary: 'Invokes Sarvam AI (sarvam-105b) to compile declarative recovery pipelines from plain English.',
      description:
        'Uses Sarvam AI SRE reasoning to parse natural language architecture descriptions into an acyclic Kahn DAG. Dynamically computes recovery tiers, down-stream blast radius, health check protocols, and compiles a declarative Kubernetes-style recovery pipeline YAML.',
      paramsList: [
        {
          name: 'naturalLanguagePrompt',
          type: 'string',
          required: true,
          defaultVal: 'None',
          description: 'Natural language description of architecture, microservices, and dependency graph.',
        },
        {
          name: 'strictAcyclic',
          type: 'boolean',
          required: false,
          defaultVal: 'true',
          description: 'When true, detects and rejects circular dependency deadlocks with an error explanation.',
        },
        {
          name: 'targetMTTRSeconds',
          type: 'number',
          required: false,
          defaultVal: '45',
          description: 'Service Level Objective target MTTR seconds to encode into resilience SLO block.',
        },
      ],
      returnsDoc:
        'Returns `{ yaml: string, topologicalLevels: string[][], cycleDetected: boolean, architectureName: string, nodesCount: number }`.',
      jsonRpcRequest: JSON.stringify(
        {
          jsonrpc: '2.0',
          id: 6,
          method: 'tools/call',
          params: {
            name: 'horizon_synthesize_yaml',
            arguments: {
              naturalLanguagePrompt: 'E-commerce platform with MySQL master, Redis cache, Auth worker, Stripe payment API, and Envoy Ingress.',
            },
          },
        },
        null,
        2
      ),
      jsonRpcResponse: JSON.stringify(
        {
          jsonrpc: '2.0',
          id: 6,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  architectureName: 'E-Commerce Microservices Mesh',
                  cycleDetected: false,
                  topologicalLevels: [
                    ['db-mysql-master'],
                    ['redis-cache'],
                    ['auth-worker', 'payment-api'],
                    ['envoy-ingress'],
                  ],
                  yamlLength: 2140,
                  previewYaml: 'apiVersion: horizon.recovery.io/v1alpha1\nkind: AutonomousRecoveryPipeline\n...',
                }),
              },
            ],
          },
        },
        null,
        2
      ),
      errorCodes: ['ERR_DAG_CYCLE_DETECTED', 'ERR_SARVAM_AI_TIMEOUT', 'ERR_INVALID_SYNTAX'],
    },
  ];

  /* Error Codes Reference Table (MDN Style) */
  const errorCodesReference = [
    {
      code: '-32700',
      name: 'Parse Error',
      category: 'JSON-RPC 2.0',
      description: 'Invalid JSON was received by the server. An error occurred on the client while parsing the JSON text.',
      remediation: 'Ensure the request payload is valid, un-truncated JSON formatted according to UTF-8 encoding.',
    },
    {
      code: '-32600',
      name: 'Invalid Request',
      category: 'JSON-RPC 2.0',
      description: 'The JSON sent is not a valid JSON-RPC 2.0 Request object (missing "jsonrpc": "2.0" or "method").',
      remediation: 'Verify standard JSON-RPC 2.0 headers, method string, and incremental id field.',
    },
    {
      code: '-32601',
      name: 'Method Not Found',
      category: 'JSON-RPC 2.0',
      description: 'The requested tool or method does not exist in the registered Horizon MCP catalogue.',
      remediation: 'Call `tools/list` to inspect available tool names, or verify tool prefix "horizon_".',
    },
    {
      code: '-32602',
      name: 'Invalid Params',
      category: 'JSON-RPC 2.0',
      description: 'Tool parameters do not conform to the JSON Schema specification (missing required field or type mismatch).',
      remediation: 'Inspect the parameters table for the target tool and supply all required arguments with matching types.',
    },
    {
      code: 'ERR_DAG_CYCLE_DETECTED',
      name: 'Circular Dependency Deadlock',
      category: 'Topological Engine',
      description: 'Kahn’s topological ordering algorithm detected a closed cycle (e.g. Node A -> Node B -> Node A).',
      remediation: 'Refactor service dependencies to eliminate the loop before synthesizing recovery execution plans.',
    },
    {
      code: 'ERR_UNAUTHORIZED_CUTOVER',
      name: 'EIP-712 Gate Rejection',
      category: 'Web3 Consensus',
      description: 'High-risk Tier 0 recovery action was executed without valid EIP-712 human commander cryptographic signature.',
      remediation: 'Dispatch `horizon_sign_approval_gate` with commander wallet credentials on MST Testnet (Chain ID 91562037).',
    },
    {
      code: 'ERR_BRIDGEKEY_TIMEOUT',
      name: 'Signature Window Expired',
      category: 'Web3 Consensus',
      description: 'Cryptographic wallet signature request remained unsigned beyond the 60-second safety window.',
      remediation: 'Confirm the operator’s Web3 wallet extension is unlocked and focused, then retry approval.',
    },
    {
      code: 'ERR_NODE_NOT_FOUND',
      name: 'Unknown System Node',
      category: 'Cluster State',
      description: 'Target nodeId is not present in the active cluster dependency graph.',
      remediation: 'Call `horizon_get_topology` to fetch the authoritative list of registered system nodes.',
    },
    {
      code: 'ERR_SIMULATION_BLOCKED',
      name: 'Active Incident Lockout',
      category: 'Autonomous Watchdog',
      description: 'Chaos simulation injection was rejected because a live production recovery is currently executing.',
      remediation: 'Wait for the active recovery job to complete or issue `/status` to monitor current MTTR stopwatch.',
    },
  ];

  /* Compatibility Matrix */
  const compatibilityMatrix = [
    {
      client: 'Claude Desktop',
      minVersion: 'v0.7.0+',
      transport: 'stdio (Standard I/O)',
      toolsList: 'Full Support',
      toolsCall: 'Full Support',
      web3Gating: 'Supported via MST RPC',
      status: 'Tier 1 Official',
    },
    {
      client: 'Cursor IDE',
      minVersion: 'v0.40.0+',
      transport: 'SSE (Server-Sent Events)',
      toolsList: 'Full Support',
      toolsCall: 'Full Support',
      web3Gating: 'Supported via Browser Bridge',
      status: 'Tier 1 Official',
    },
    {
      client: 'Google Antigravity CLI (AGY)',
      minVersion: 'v1.4.0+',
      transport: 'stdio / Local Daemon',
      toolsList: 'Full Support',
      toolsCall: 'Full Support',
      web3Gating: 'Native Extension Hook',
      status: 'Tier 1 Official',
    },
    {
      client: 'Windsurf (Codeium)',
      minVersion: 'v1.0.0+',
      transport: 'stdio / npx',
      toolsList: 'Full Support',
      toolsCall: 'Full Support',
      web3Gating: 'Supported via Webhook',
      status: 'Tier 2 Certified',
    },
    {
      client: 'Custom Python / Node Agent',
      minVersion: 'MCP SDK 1.0+',
      transport: 'stdio / SSE / HTTP',
      toolsList: 'Full Support',
      toolsCall: 'Full Support',
      web3Gating: 'Direct RPC (viem / ethers.js)',
      status: 'Universal',
    },
  ];

  /* Slash Commands */
  const slashCommands = [
    {
      cmd: '/diagnose',
      args: '[node-id]',
      desc: 'Performs topological health analysis across all dependency tiers and computes blast radius.',
      example: '/diagnose db-primary',
      badge: 'Read-Only',
    },
    {
      cmd: '/heal',
      args: '<service-name>',
      desc: 'Initiates deterministic topological self-healing sequence in strict bottom-up dependency order.',
      example: '/heal postgresql-primary',
      badge: 'Orchestrator',
    },
    {
      cmd: '/blast-radius',
      args: '<service-name>',
      desc: 'Calculates all cascaded downstream services that experience degradation if target is down.',
      example: '/blast-radius redis-cache',
      badge: 'Analyzer',
    },
    {
      cmd: '/gate-sign',
      args: '<incident-id>',
      desc: 'Triggers EIP-712 cryptographic Commander signature prompt for BridgeKey Wallet on MST Testnet.',
      example: '/gate-sign INC-8821',
      badge: 'EIP-712 Gate',
    },
    {
      cmd: '/audit-verify',
      args: '<tx-hash | log-id>',
      desc: 'Queries MST Blockchain Testnet smart contract (0x3EDad2...) for Merkle root attestation.',
      example: '/audit-verify 0x7a8f...b291',
      badge: 'Web3 Proof',
    },
    {
      cmd: '/simulate',
      args: '<service-name>',
      desc: 'Chaos engineering: injects temporary socket timeout or process termination for drill testing.',
      example: '/simulate api-gateway',
      badge: 'Chaos SRE',
    },
    {
      cmd: '/export-yaml',
      args: '[architecture]',
      desc: 'Synthesizes Kubernetes Custom Resource Definition (CRD) and Horizon declarative recovery spec.',
      example: '/export-yaml e-commerce-stack',
      badge: 'Synthesizer',
    },
    {
      cmd: '/status',
      args: '',
      desc: 'Returns live SLA uptime, active incidents, MTTR stopwatch, and Docker daemon bridge connection.',
      example: '/status',
      badge: 'Telemetry',
    },
  ];

  /* CLI Commands */
  const cliCommands = [
    {
      cmd: 'horizon mcp start',
      options: '--port 3000 --transport sse',
      desc: 'Spawns Model Context Protocol server exposing Horizon SRE tools over standard I/O or Server-Sent Events.',
    },
    {
      cmd: 'horizon status',
      options: '--watch --format json',
      desc: 'Polls real-time cluster health, dependency tiers, and active MTTR stopwatch.',
    },
    {
      cmd: 'horizon simulate <node-id>',
      options: '--duration 30s --failures 3',
      desc: 'Triggers simulated outage on specified node to evaluate autonomous failover.',
    },
    {
      cmd: 'horizon recover <node-id>',
      options: '--auto-approve --dry-run',
      desc: 'Orchestrates topological Kahn bottom-up recovery playbook sequence.',
    },
    {
      cmd: 'horizon audit tail',
      options: '--limit 50 --verify-onchain',
      desc: 'Streams cryptographically anchored incident ledger directly from MST Blockchain.',
    },
    {
      cmd: 'horizon wallet connect',
      options: '--chain-id 91562037',
      desc: 'Pairs BridgeKey browser wallet or private key for automated commander multi-sig signing.',
    },
    {
      cmd: 'horizon agent run',
      options: '--prompt "diagnose and recover db-primary"',
      desc: 'Launches headless Sarvam AI agent copilot to inspect and heal infrastructure.',
    },
  ];

  /* REST API Endpoints */
  const apiEndpoints = [
    {
      method: 'GET',
      path: '/api/v1/health',
      desc: 'Evaluates cluster operational state, node status counts, and active incidents.',
      response: '{\n  "status": "UP",\n  "timestamp": "2026-10-09T02:40:00Z",\n  "version": "1.0.0",\n  "totalNodes": 7,\n  "activeIncidents": 0\n}',
    },
    {
      method: 'GET',
      path: '/api/v1/nodes',
      desc: 'Returns all monitored microservices, database replicas, and dependency links.',
      response: '[\n  {\n    "id": "db-primary",\n    "name": "PostgreSQL Primary",\n    "type": "database",\n    "status": "healthy",\n    "dependencies": []\n  }\n]',
    },
    {
      method: 'GET',
      path: '/api/v1/graph/analysis',
      desc: 'Executes Kahn’s topological sort to verify acyclic DAG structure and detect circular deadlocks.',
      response: '{\n  "hasCycle": false,\n  "cyclePath": []\n}',
    },
    {
      method: 'POST',
      path: '/api/v1/chaos',
      desc: 'Triggers simulated failure or manual healing of any cluster node.',
      payload: '{\n  "nodeId": "db-primary",\n  "action": "fail"\n}',
      response: '{\n  "message": "Node db-primary set to DOWN",\n  "incident": { "id": "INC-8821", "status": "awaiting_approval" }\n}',
    },
    {
      method: 'POST',
      path: '/api/v1/tick',
      desc: 'Advances the autonomous recovery orchestrator to execute the next pending playbook step.',
      response: '{\n  "advanced": true,\n  "incident": { "id": "INC-8821", "current_level": 1 }\n}',
    },
  ];

  const selectedTool = mcpToolsFull[selectedToolIndex];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 font-sans w-full max-w-7xl mx-auto pb-16"
    >
      {/* MDN-Style Breadcrumb Navigation */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#EADCC9] pb-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-[#6E6258]">
          <Link to="/" className="hover:text-[#1A1A1A] transition-colors">Horizon</Link>
          <span className="text-[#C2B29F]">/</span>
          <span className="text-[#5A4E44]">Specifications</span>
          <span className="text-[#C2B29F]">/</span>
          <span className="text-[#0047AB] font-bold">Model Context Protocol (RFC-MCP-2024-11-05)</span>
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[11px] font-mono text-emerald-800 font-bold">Living Standard &bull; Production</span>
          </div>
          <span className="text-[11px] font-mono text-[#6E6258] bg-[#FAF3EA] px-2.5 py-1 rounded-full border border-[#E5D7C5]">
            MST Chain: 91562037
          </span>
        </div>
      </motion.div>

      {/* Header & Meta Summary */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-bold bg-[#0047AB]/10 text-[#0047AB] border border-[#0047AB]/20">
              <Code2 className="w-3.5 h-3.5 text-[#0047AB]" />
              <span>MDN WEB DOCS SPECIFICATION &bull; API REFERENCE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1A1A1A]">
              Model Context Protocol (MCP) Reference
            </h1>
            <p className="text-sm sm:text-base text-[#5A4E44] leading-relaxed font-medium">
              The Horizon Model Context Protocol (MCP) Server provides standard, bidirectional JSON-RPC 2.0 tool execution
              for LLM agents. It exposes live dependency DAG inspection, chaos simulation, topological Kahn recovery orchestration,
              and cryptographic EIP-712 human commander signing gates.
            </p>
          </div>

          {/* MDN Specification Metadata Box */}
          <div className="w-full lg:w-80 shrink-0 p-4 rounded-2xl bg-white border border-[#E5D7C5] shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#EADCC9]">
              <span className="font-bold text-[#1A1A1A] uppercase tracking-wider text-[11px]">Specification Details</span>
              <Badge status="info" className="text-[10px] bg-blue-50 text-[#0047AB] border-blue-200 font-mono">
                RFC-MCP-2024
              </Badge>
            </div>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#6E6258]">Transports:</span>
                <span className="font-bold text-[#1A1A1A]">stdio | SSE | HTTP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6258]">Wire Protocol:</span>
                <span className="font-bold text-[#1A1A1A]">JSON-RPC 2.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6258]">MST Testnet:</span>
                <span className="font-bold text-[#0047AB]">Chain 91562037</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6258]">Auth & Gate:</span>
                <span className="font-bold text-emerald-800">EIP-712 Multi-Sig</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6258]">Contract:</span>
                <span className="font-bold text-[#1A1A1A] truncate max-w-[120px]" title="0x3EDad230dCFc6Dd3C357490b9feDa49639646BB7">
                  0x3EDad23...6BB7
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-[#EADCC9]">
              <Link to="/architect" className="w-full">
                <Button variant="primary" size="sm" className="w-full text-xs font-bold gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Agent Architect</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* MDN Admonition: Protocol Safety Barrier */}
      <motion.div variants={itemVariants} className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 shadow-xs flex items-start gap-3.5">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm">
          <div className="font-bold text-amber-900 flex items-center gap-2">
            <span>IMPORTANT: Cryptographic EIP-712 Consensus Barrier</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 font-bold">
              SECURITY INVARIANT
            </span>
          </div>
          <p className="text-amber-800 leading-relaxed font-medium">
            High-risk Tier 0 infrastructure recovery operations (database failovers, stateful volume resets, and DNS traffic switchovers)
            unconditionally require an authorized Commander cryptographic signature via BridgeKey Wallet on MST Testnet. Autonomous agents
            cannot execute cutovers without this cryptographic proof.
          </p>
        </div>
      </motion.div>

      {/* Main Tabs Navigation */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 border-b border-[#EADCC9] pb-3 text-xs">
        <button
          onClick={() => setActiveTab('mcp')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'mcp'
              ? 'bg-[#0047AB] text-white shadow-sm'
              : 'bg-[#FAF3EA] text-[#6E6258] hover:text-[#1A1A1A] hover:bg-[#F4EBE0] border border-[#E5D7C5]'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>MCP Server & Tools Reference</span>
        </button>

        <button
          onClick={() => setActiveTab('slash')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'slash'
              ? 'bg-[#0047AB] text-white shadow-sm'
              : 'bg-[#FAF3EA] text-[#6E6258] hover:text-[#1A1A1A] hover:bg-[#F4EBE0] border border-[#E5D7C5]'
          }`}
        >
          <Command className="w-4 h-4" />
          <span>Slash (/) Commands</span>
        </button>

        <button
          onClick={() => setActiveTab('cli')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'cli'
              ? 'bg-[#0047AB] text-white shadow-sm'
              : 'bg-[#FAF3EA] text-[#6E6258] hover:text-[#1A1A1A] hover:bg-[#F4EBE0] border border-[#E5D7C5]'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>CLI Reference</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'api'
              ? 'bg-[#0047AB] text-white shadow-sm'
              : 'bg-[#FAF3EA] text-[#6E6258] hover:text-[#1A1A1A] hover:bg-[#F4EBE0] border border-[#E5D7C5]'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>REST & Edge API</span>
        </button>
      </motion.div>

      {/* Tab 1: Comprehensive MCP Server & MDN Tool Reference */}
      {activeTab === 'mcp' && (
        <div className="space-y-10">
          {/* Quick Jump In-Page TOC */}
          <div className="p-4 rounded-2xl bg-[#FAF3EA] border border-[#E5D7C5] flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-[#1A1A1A] uppercase tracking-wider text-[11px] mr-2">In This Guide:</span>
            <a href="#quickstart" className="px-3 py-1 rounded-lg bg-white border border-[#E5D7C5] text-[#0047AB] font-bold hover:bg-blue-50 transition-colors">
              1. Quick Start
            </a>
            <a href="#client-config" className="px-3 py-1 rounded-lg bg-white border border-[#E5D7C5] text-[#0047AB] font-bold hover:bg-blue-50 transition-colors">
              2. Client Setup
            </a>
            <a href="#tool-specifications" className="px-3 py-1 rounded-lg bg-white border border-[#E5D7C5] text-[#0047AB] font-bold hover:bg-blue-50 transition-colors">
              3. Tool Catalogue
            </a>
            <a href="#wire-inspector" className="px-3 py-1 rounded-lg bg-white border border-[#E5D7C5] text-[#0047AB] font-bold hover:bg-blue-50 transition-colors">
              4. JSON-RPC 2.0 Wire
            </a>
            <a href="#error-codes" className="px-3 py-1 rounded-lg bg-white border border-[#E5D7C5] text-[#0047AB] font-bold hover:bg-blue-50 transition-colors">
              5. Error Codes
            </a>
            <a href="#compatibility" className="px-3 py-1 rounded-lg bg-white border border-[#E5D7C5] text-[#0047AB] font-bold hover:bg-blue-50 transition-colors">
              6. Compatibility Matrix
            </a>
          </div>

          {/* Section 1: Quickstart Deck */}
          <section id="quickstart" className="cobalt-patch p-6 sm:p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-xs font-mono font-bold">
                <Terminal className="w-3.5 h-3.5" />
                <span>Instant Agent Toolchain Installation</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Zero-Configuration MCP Integration for LLM Agents
              </h2>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-medium">
                Execute Horizon MCP locally over stdio or connect remotely through Server-Sent Events (SSE).
                Allows Claude, Cursor, Antigravity, and autonomous agents to diagnose topologies, calculate blast radiuses,
                and orchestrate Kahn recovery sequences.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 p-3 rounded-xl bg-black/40 border border-white/20 flex items-center justify-between font-mono text-xs text-cyan-300">
                  <span className="truncate">bunx @horizon/mcp-server@latest</span>
                  <button
                    onClick={() => copyToClipboard('bunx @horizon/mcp-server@latest', 'hero-cli')}
                    className="text-white/80 hover:text-white ml-2 p-1 rounded hover:bg-white/10 transition-colors"
                    title="Copy command"
                  >
                    {copiedKey === 'hero-cli' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <a
                  href="https://modelcontextprotocol.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-[#0047AB] text-xs font-bold hover:bg-stone-100 transition-colors shadow-md"
                >
                  <span>Official MCP Specification</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </section>

          {/* Section 2: Client Configuration with Exhaustive OS Paths */}
          <section id="client-config" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-black text-[#1A1A1A] flex items-center gap-2">
                  <Hash className="w-5 h-5 text-[#0047AB]" />
                  <span>Client Configuration Reference</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#6E6258] font-medium">
                  Add the Horizon MCP server configuration to your AI agent environment. File paths and JSON configurations are detailed per IDE.
                </p>
              </div>

              {/* Client selector tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#FAF3EA] border border-[#E5D7C5]">
                {(['claude', 'cursor', 'antigravity', 'windsurf'] as const).map((client) => (
                  <button
                    key={client}
                    onClick={() => setMcpClient(client)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer ${
                      mcpClient === client
                        ? 'bg-white text-[#0047AB] shadow-xs border border-[#E5D7C5]'
                        : 'text-[#6E6258] hover:text-[#1A1A1A]'
                    }`}
                  >
                    {client === 'antigravity' ? 'Antigravity CLI' : client}
                  </button>
                ))}
              </div>
            </div>

            <Card className="p-6 skeuo-card border-[#E5D7C5] space-y-4">
              {/* OS File Path Box */}
              <div className="p-3.5 rounded-xl bg-[#FAF3EA] border border-[#E5D7C5] space-y-2 text-xs">
                <span className="font-bold text-[#1A1A1A] uppercase text-[11px] tracking-wider block">
                  Configuration File Locations by Operating System:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono text-[11px] text-[#5A4E44]">
                  <div className="p-2 rounded-lg bg-white border border-[#EADCC9]">
                    <span className="text-[#8A7B6D] font-bold block mb-0.5">macOS:</span>
                    <span className="truncate block">
                      {mcpClient === 'claude' && '~/Library/Application Support/Claude/claude_desktop_config.json'}
                      {mcpClient === 'cursor' && '~/.cursor/mcp.json (or .cursor/mcp.json in workspace)'}
                      {mcpClient === 'antigravity' && '~/.gemini/antigravity-cli/mcp_servers.json'}
                      {mcpClient === 'windsurf' && '~/.codeium/windsurf/mcp_config.json'}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-[#EADCC9]">
                    <span className="text-[#8A7B6D] font-bold block mb-0.5">Windows:</span>
                    <span className="truncate block">
                      {mcpClient === 'claude' && '%APPDATA%\\Claude\\claude_desktop_config.json'}
                      {mcpClient === 'cursor' && '%USERPROFILE%\\.cursor\\mcp.json'}
                      {mcpClient === 'antigravity' && '%USERPROFILE%\\.gemini\\antigravity-cli\\mcp_servers.json'}
                      {mcpClient === 'windsurf' && '%USERPROFILE%\\.codeium\\windsurf\\mcp_config.json'}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-[#EADCC9]">
                    <span className="text-[#8A7B6D] font-bold block mb-0.5">Linux:</span>
                    <span className="truncate block">
                      {mcpClient === 'claude' && '~/.config/Claude/claude_desktop_config.json'}
                      {mcpClient === 'cursor' && '~/.config/cursor/mcp.json'}
                      {mcpClient === 'antigravity' && '~/.gemini/antigravity-cli/mcp_servers.json'}
                      {mcpClient === 'windsurf' && '~/.config/windsurf/mcp_config.json'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Code Box with Copy Action */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#6E6258] font-mono">
                  <span className="font-bold text-[#1A1A1A]">JSON Configuration:</span>
                  <button
                    onClick={() => copyToClipboard(mcpConfigs[mcpClient], `mcp-${mcpClient}`)}
                    className="inline-flex items-center gap-1.5 font-bold text-[#0047AB] hover:underline cursor-pointer"
                  >
                    {copiedKey === `mcp-${mcpClient}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Configuration</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-black shadow-inner overflow-x-auto text-xs font-mono text-cyan-300">
                  <pre>
                    <code>{mcpConfigs[mcpClient]}</code>
                  </pre>
                </div>
              </div>

              {/* Environment Variables Reference Table */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider block">
                  Environment Variables Reference:
                </span>
                <div className="overflow-x-auto rounded-xl border border-[#E5D7C5] bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#FAF3EA] border-b border-[#EADCC9] text-[#6E6258] font-mono text-[11px] font-bold">
                        <th className="p-3">Variable</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Default / Required</th>
                        <th className="p-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F4EBE0] font-mono text-[11px]">
                      <tr>
                        <td className="p-3 font-bold text-[#0047AB]">HORIZON_API_URL</td>
                        <td className="p-3 text-[#6E6258]">URL</td>
                        <td className="p-3 text-emerald-800 font-bold">Required</td>
                        <td className="p-3 font-sans text-[#1A1A1A]">Production Horizon orchestrator endpoint or local daemon URL.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-[#0047AB]">MST_CHAIN_ID</td>
                        <td className="p-3 text-[#6E6258]">Number</td>
                        <td className="p-3">91562037</td>
                        <td className="p-3 font-sans text-[#1A1A1A]">MST Blockchain Testnet EVM Chain identifier for EIP-712 signing.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-[#0047AB]">MST_RPC_URL</td>
                        <td className="p-3 text-[#6E6258]">URL</td>
                        <td className="p-3">https://testnet.mstscan.com/rpc</td>
                        <td className="p-3 font-sans text-[#1A1A1A]">JSON-RPC node for blockchain Merkle root query and smart contract state.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-[#0047AB]">SARVAM_AGENT_ENABLED</td>
                        <td className="p-3 text-[#6E6258]">Boolean</td>
                        <td className="p-3">true</td>
                        <td className="p-3 font-sans text-[#1A1A1A]">Enables native Sarvam-105b LLM integration for automated SRE synthesis.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </section>

          {/* Section 3: MDN Web Docs Exhaustive Tool Specifications */}
          <section id="tool-specifications" className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-[#1A1A1A] flex items-center gap-2">
                <Hash className="w-5 h-5 text-[#0047AB]" />
                <span>Tool Catalogue & Formal Specifications</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#6E6258] font-medium">
                Detailed MDN Web Docs style reference for each of the 6 registered Horizon MCP tools.
                Click on any tool below to inspect parameters, return types, error conditions, and wire payloads.
              </p>
            </div>

            {/* Tool Selection Tabs */}
            <div className="flex flex-wrap gap-2 pb-2">
              {mcpToolsFull.map((tool, idx) => (
                <button
                  key={tool.name}
                  onClick={() => setSelectedToolIndex(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    selectedToolIndex === idx
                      ? 'bg-[#0047AB] text-white shadow-sm border border-[#0047AB]'
                      : 'bg-[#FAF3EA] text-[#5A4E44] hover:text-[#1A1A1A] hover:bg-[#F4EBE0] border border-[#E5D7C5]'
                  }`}
                >
                  <Workflow className="w-3.5 h-3.5" />
                  <span>{tool.name}</span>
                </button>
              ))}
            </div>

            {/* Active Selected Tool Deep Specification Card */}
            <Card className="p-6 sm:p-8 skeuo-card border-[#E5D7C5] space-y-6">
              {/* Header & Badges */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EADCC9]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl font-black font-mono text-[#0047AB]">{selectedTool.name}</h3>
                    <Badge status="healthy" className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border-emerald-300">
                      RFC-MCP ACTIVE
                    </Badge>
                  </div>
                  <p className="text-xs text-[#6E6258] font-medium">{selectedTool.summary}</p>
                </div>

                <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-xs font-mono text-[#0047AB] font-bold truncate">
                  Method: tools/call
                </div>
              </div>

              {/* Formal Syntax Box */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider block">Syntax:</span>
                <div className="p-3.5 rounded-xl bg-[#FAF3EA] border border-[#E5D7C5] font-mono text-xs text-[#1A1A1A] overflow-x-auto">
                  <code>{selectedTool.signature}</code>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider block">Description:</span>
                <p className="text-xs sm:text-sm text-[#403830] leading-relaxed font-medium">
                  {selectedTool.description}
                </p>
              </div>

              {/* Parameters Table (MDN Format) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider block">Parameters:</span>
                <div className="overflow-x-auto rounded-xl border border-[#E5D7C5] bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#FAF3EA] border-b border-[#EADCC9] text-[#6E6258] font-mono text-[11px] font-bold">
                        <th className="p-3">Parameter</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Required</th>
                        <th className="p-3">Default</th>
                        <th className="p-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F4EBE0] font-mono text-[11px]">
                      {selectedTool.paramsList.map((param) => (
                        <tr key={param.name} className="hover:bg-[#FFF8F0] transition-colors">
                          <td className="p-3 font-bold text-[#0047AB]">{param.name}</td>
                          <td className="p-3 text-[#6E6258]">{param.type}</td>
                          <td className="p-3">
                            {param.required ? (
                              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                                Required
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                                Optional
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-[#5A4E44]">{param.defaultVal}</td>
                          <td className="p-3 font-sans text-[#1A1A1A] leading-relaxed">{param.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Return Value Specification */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider block">Return Value:</span>
                <div className="p-3.5 rounded-xl bg-white border border-[#E5D7C5] text-xs font-medium text-[#403830] leading-relaxed">
                  {selectedTool.returnsDoc}
                </div>
              </div>

              {/* Error Conditions */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider block">Possible Errors:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedTool.errorCodes.map((err) => (
                    <span
                      key={err}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-mono text-xs font-bold"
                    >
                      {err}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </section>

          {/* Section 4: Interactive JSON-RPC 2.0 Wire Inspector */}
          <section id="wire-inspector" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-black text-[#1A1A1A] flex items-center gap-2">
                  <Hash className="w-5 h-5 text-[#0047AB]" />
                  <span>JSON-RPC 2.0 Wire Protocol Inspector</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#6E6258] font-medium">
                  Inspect the exact wire payloads transmitted between your AI Agent and the Horizon MCP Server for <span className="font-mono font-bold text-[#0047AB]">{selectedTool.name}</span>.
                </p>
              </div>

              <div className="flex items-center gap-2 p-1 rounded-xl bg-[#FAF3EA] border border-[#E5D7C5]">
                <button
                  onClick={() => setPayloadView('request')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    payloadView === 'request'
                      ? 'bg-white text-[#0047AB] shadow-xs border border-[#E5D7C5]'
                      : 'text-[#6E6258] hover:text-[#1A1A1A]'
                  }`}
                >
                  Request (tools/call)
                </button>
                <button
                  onClick={() => setPayloadView('response')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    payloadView === 'response'
                      ? 'bg-white text-[#0047AB] shadow-xs border border-[#E5D7C5]'
                      : 'text-[#6E6258] hover:text-[#1A1A1A]'
                  }`}
                >
                  Response (200 OK)
                </button>
              </div>
            </div>

            <Card className="p-5 skeuo-card border-[#E5D7C5] space-y-3">
              <div className="flex items-center justify-between text-xs text-[#6E6258] font-mono">
                <span>
                  {payloadView === 'request'
                    ? `JSON-RPC 2.0 Request Payload: ${selectedTool.name}`
                    : `JSON-RPC 2.0 Success Response Payload`}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      payloadView === 'request' ? selectedTool.jsonRpcRequest : selectedTool.jsonRpcResponse,
                      `payload-${selectedTool.name}-${payloadView}`
                    )
                  }
                  className="inline-flex items-center gap-1.5 font-bold text-[#0047AB] hover:underline cursor-pointer"
                >
                  {copiedKey === `payload-${selectedTool.name}-${payloadView}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Payload</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-black shadow-inner overflow-x-auto text-xs font-mono text-cyan-300">
                <pre>
                  <code>{payloadView === 'request' ? selectedTool.jsonRpcRequest : selectedTool.jsonRpcResponse}</code>
                </pre>
              </div>
            </Card>
          </section>

          {/* Section 5: Standard JSON-RPC & Domain Error Codes Table */}
          <section id="error-codes" className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-[#1A1A1A] flex items-center gap-2">
                <Hash className="w-5 h-5 text-[#0047AB]" />
                <span>Error Code Reference (MDN Format)</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#6E6258] font-medium">
                Standard JSON-RPC 2.0 specification errors alongside Horizon domain exceptions, failure causes, and agent remediation workflows.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E5D7C5] bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF3EA] border-b border-[#EADCC9] text-[#6E6258] uppercase font-mono tracking-wider text-[11px] font-bold">
                    <th className="p-3.5">Code</th>
                    <th className="p-3.5">Error Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Cause & Description</th>
                    <th className="p-3.5">Agent Remediation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EBE0] font-mono text-[11px]">
                  {errorCodesReference.map((err) => (
                    <tr key={err.code} className="hover:bg-[#FFF8F0] transition-colors">
                      <td className="p-3.5 font-bold text-rose-700 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200">
                          {err.code}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-[#1A1A1A] whitespace-nowrap">{err.name}</td>
                      <td className="p-3.5 text-[#6E6258] whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-[#FAF3EA] border border-[#E5D7C5]">
                          {err.category}
                        </span>
                      </td>
                      <td className="p-3.5 font-sans font-medium text-[#403830] max-w-sm leading-relaxed">
                        {err.description}
                      </td>
                      <td className="p-3.5 font-sans font-medium text-emerald-800 max-w-xs leading-relaxed">
                        {err.remediation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 6: Client Compatibility Matrix */}
          <section id="compatibility" className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-[#1A1A1A] flex items-center gap-2">
                <Hash className="w-5 h-5 text-[#0047AB]" />
                <span>Client & Runtime Compatibility Matrix</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#6E6258] font-medium">
                Tested compatibility across AI desktop clients, CLI runtimes, IDE extensions, and Web3 consensus features.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E5D7C5] bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF3EA] border-b border-[#EADCC9] text-[#6E6258] uppercase font-mono tracking-wider text-[11px] font-bold">
                    <th className="p-3.5">Client / Agent</th>
                    <th className="p-3.5">Min Version</th>
                    <th className="p-3.5">Transport</th>
                    <th className="p-3.5">Discovery</th>
                    <th className="p-3.5">Tool Calling</th>
                    <th className="p-3.5">EIP-712 Signing</th>
                    <th className="p-3.5">Tier Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EBE0] font-mono text-[11px]">
                  {compatibilityMatrix.map((row) => (
                    <tr key={row.client} className="hover:bg-[#FFF8F0] transition-colors">
                      <td className="p-3.5 font-bold text-[#1A1A1A] whitespace-nowrap">{row.client}</td>
                      <td className="p-3.5 text-[#6E6258] whitespace-nowrap">{row.minVersion}</td>
                      <td className="p-3.5 text-[#0047AB] font-bold whitespace-nowrap">{row.transport}</td>
                      <td className="p-3.5 text-emerald-700 font-semibold whitespace-nowrap">{row.toolsList}</td>
                      <td className="p-3.5 text-emerald-700 font-semibold whitespace-nowrap">{row.toolsCall}</td>
                      <td className="p-3.5 text-[#1A1A1A] whitespace-nowrap">{row.web3Gating}</td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0047AB] font-bold border border-blue-200">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* Tab 2: Slash (/) Commands */}
      {activeTab === 'slash' && (
        <div className="space-y-6">
          <Card className="p-6 skeuo-card border-[#E5D7C5] space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A]">In-Chat & Copilot Slash Commands</h3>
              <p className="text-xs text-[#6E6258] font-medium">
                Use slash commands directly in Sarvam AI Copilot or MCP-enabled IDEs (Cursor, Antigravity, Claude) to trigger SRE actions without clicking through the UI.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E5D7C5] bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF3EA] border-b border-[#EADCC9] text-[#6E6258] uppercase font-mono tracking-wider text-[11px] font-bold">
                    <th className="p-3.5">Command</th>
                    <th className="p-3.5">Arguments</th>
                    <th className="p-3.5">Purpose & Action</th>
                    <th className="p-3.5">Example</th>
                    <th className="p-3.5">Copy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EBE0]">
                  {slashCommands.map((sc) => (
                    <tr key={sc.cmd} className="hover:bg-[#FFF8F0] transition-colors font-mono">
                      <td className="p-3.5 font-bold text-[#0047AB] whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200">
                          {sc.cmd}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#6E6258] whitespace-nowrap font-medium">
                        {sc.args || '—'}
                      </td>
                      <td className="p-3.5 font-sans font-medium text-[#1A1A1A] max-w-xs leading-relaxed">
                        {sc.desc}
                      </td>
                      <td className="p-3.5 text-emerald-800 font-semibold whitespace-nowrap">
                        {sc.example}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <button
                          onClick={() => copyToClipboard(sc.example, sc.cmd)}
                          className="p-1.5 rounded-lg bg-[#FAF3EA] hover:bg-[#F4EBE0] border border-[#E5D7C5] text-[#0047AB] transition-colors cursor-pointer"
                          title="Copy example"
                        >
                          {copiedKey === sc.cmd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: CLI Reference */}
      {activeTab === 'cli' && (
        <div className="space-y-6">
          <Card className="p-6 skeuo-card border-[#E5D7C5] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EADCC9] gap-3">
              <div>
                <h3 className="text-base font-bold text-[#1A1A1A]">Horizon CLI Reference (@horizon/cli)</h3>
                <p className="text-xs text-[#6E6258] font-medium">
                  Autonomous SRE command line interface for headless orchestration, CI/CD pipeline verification, and local daemon bridge.
                </p>
              </div>

              <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-xs font-mono font-bold text-[#0047AB]">
                bun add -g @horizon/cli
              </div>
            </div>

            <div className="space-y-3">
              {cliCommands.map((cli) => (
                <div
                  key={cli.cmd}
                  className="p-4 rounded-xl skeuo-well border-[#E5D7C5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-[#1A1A1A] text-sm">{cli.cmd}</span>
                      <span className="text-[#8A7B6D]">{cli.options}</span>
                    </div>
                    <p className="text-[#5A4E44] font-medium">{cli.desc}</p>
                  </div>

                  <button
                    onClick={() => copyToClipboard(`${cli.cmd} ${cli.options}`.trim(), cli.cmd)}
                    className="skeuo-btn-secondary px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === cli.cmd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#0047AB]" />}
                    <span>{copiedKey === cli.cmd ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: REST & Edge API */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <Card className="p-6 skeuo-card border-[#E5D7C5] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EADCC9] gap-3">
              <div>
                <h3 className="text-base font-bold text-[#1A1A1A]">REST & Serverless Edge API Specification</h3>
                <p className="text-xs text-[#6E6258] font-medium">
                  Hono-powered Edge routes deployed on Vercel Functions with sub-millisecond execution.
                </p>
              </div>

              {/* Language code snippet switcher */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#FAF3EA] border border-[#E5D7C5]">
                {(['curl', 'ts', 'python'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setApiLang(lang)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all uppercase cursor-pointer ${
                      apiLang === lang
                        ? 'bg-white text-[#0047AB] shadow-xs border border-[#E5D7C5]'
                        : 'text-[#6E6258] hover:text-[#1A1A1A]'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {apiEndpoints.map((ep) => (
                <div key={ep.path} className="p-4 rounded-2xl bg-white border border-[#E5D7C5] shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#EADCC9]">
                    <div className="flex items-center gap-2.5 font-mono text-xs">
                      <span
                        className={`px-2 py-0.5 rounded font-black ${
                          ep.method === 'GET'
                            ? 'bg-blue-50 text-[#0047AB] border border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-bold text-[#1A1A1A]">{ep.path}</span>
                    </div>

                    <button
                      onClick={() => copyToClipboard(`https://horizon-recovery.vercel.app${ep.path}`, ep.path)}
                      className="text-xs text-[#0047AB] font-bold hover:underline flex items-center gap-1"
                    >
                      {copiedKey === ep.path ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy URL</span>
                    </button>
                  </div>

                  <p className="text-xs text-[#5A4E44] font-medium">{ep.desc}</p>

                  {/* Code snippet display */}
                  <div className="p-3.5 rounded-xl bg-[#1A1A1A] border border-black text-[11px] font-mono text-cyan-300 overflow-x-auto shadow-inner">
                    <pre>
                      <code>
                        {apiLang === 'curl' && `curl -X ${ep.method} "https://horizon-recovery.vercel.app${ep.path}" \\\n  -H "Content-Type: application/json"`}
                        {apiLang === 'ts' && `const res = await fetch("https://horizon-recovery.vercel.app${ep.path}", {\n  method: "${ep.method}",\n  headers: { "Content-Type": "application/json" }\n});\nconst data = await res.json();`}
                        {apiLang === 'python' && `import httpx\n\nres = httpx.${ep.method.toLowerCase()}("https://horizon-recovery.vercel.app${ep.path}")\ndata = res.json()`}
                      </code>
                    </pre>
                  </div>

                  {/* Sample Response */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#8A7B6D] font-bold uppercase">Sample Response 200 OK:</span>
                    <div className="p-3 rounded-xl skeuo-well border-[#E5D7C5] text-[11px] font-mono text-[#1A1A1A] overflow-x-auto">
                      <pre>
                        <code>{ep.response}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </motion.div>
  );
};

export default DocsPage;
