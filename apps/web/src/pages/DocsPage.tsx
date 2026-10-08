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

export const DocsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mcp' | 'slash' | 'cli' | 'api'>('mcp');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [mcpClient, setMcpClient] = useState<'claude' | 'cursor' | 'antigravity' | 'windsurf'>('claude');
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
            command: "bunx",
            args: ["@horizon/mcp-server@latest"],
            env: {
              HORIZON_API_URL: "https://horizon-recovery.vercel.app/api/v1",
              MST_CHAIN_ID: "91562037",
              MST_RPC_URL: "https://testnet.mstscan.com/rpc",
              SARVAM_AGENT_ENABLED: "true"
            }
          }
        }
      },
      null,
      2
    ),
    cursor: JSON.stringify(
      {
        mcpServers: {
          horizon: {
            url: "https://horizon-recovery.vercel.app/api/v1/mcp",
            transport: "sse",
            headers: {
              "X-Horizon-Client": "cursor-agent",
              "X-MST-Chain": "91562037"
            }
          }
        }
      },
      null,
      2
    ),
    antigravity: JSON.stringify(
      {
        servers: [
          {
            name: "horizon",
            command: "bun",
            args: ["run", "scripts/docker-agent.ts", "--mcp-stdio"],
            description: "Horizon Autonomous Infrastructure Recovery & SRE Tool Engine"
          }
        ]
      },
      null,
      2
    ),
    windsurf: JSON.stringify(
      {
        mcpServers: {
          horizon: {
            command: "npx",
            args: ["-y", "@horizon/mcp-server"],
            env: {
              HORIZON_API_URL: "https://horizon-recovery.vercel.app/api/v1"
            }
          }
        }
      },
      null,
      2
    ),
  };

  /* MCP Tools Specification */
  const mcpTools = [
    {
      name: 'horizon_get_topology',
      desc: 'Retrieves current cluster DAG topology, node health states, and service dependency edges.',
      params: '{ filterStatus?: "healthy" | "down" | "degraded" }',
      returns: '{ nodes: SystemNode[], edges: DependencyEdge[], cycles: string[] }',
    },
    {
      name: 'horizon_simulate_failure',
      desc: 'Injects simulated chaos/failure outage on any target microservice to evaluate resiliency.',
      params: '{ nodeId: string, reason?: string, consecutiveFailures?: number }',
      returns: '{ success: boolean, affectedNode: string, blastRadius: string[] }',
    },
    {
      name: 'horizon_trigger_recovery',
      desc: 'Executes Kahn’s bottom-up topological recovery sequence on damaged dependency hierarchy.',
      params: '{ targetNodeId: string, autoApproveLowRisk?: boolean }',
      returns: '{ jobId: string, steps: PlaybookStep[], initialStatus: string }',
    },
    {
      name: 'horizon_sign_approval_gate',
      desc: 'Cryptographically signs high-risk database or ingress cutover using BridgeKey EIP-712 on MST Testnet.',
      params: '{ incidentId: string, stepId: number, signerAddress?: string }',
      returns: '{ approved: boolean, txHash: string, chainId: 91562037 }',
    },
    {
      name: 'horizon_verify_audit_proof',
      desc: 'Verifies SHA-256 Merkle audit root anchored on the MST Blockchain against state transition logs.',
      params: '{ logId: string, expectedHash?: string }',
      returns: '{ verified: boolean, blockNumber: number, onChainHash: string }',
    },
    {
      name: 'horizon_synthesize_yaml',
      desc: 'Invokes Sarvam AI (sarvam-105b) to compile declarative recovery pipelines from plain English.',
      params: '{ naturalLanguagePrompt: string }',
      returns: '{ yaml: string, topologicalLevels: string[][], cycleDetected: boolean }',
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-7 font-sans w-full"
    >
      {/* Top Breadcrumb Navigation */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#6E6258] hover:text-[#1A1A1A] transition-colors"
        >
          <span>&larr; Return to Home</span>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#0047AB] animate-pulse" />
          <span className="text-xs font-mono text-[#0047AB] font-bold">MCP v1.0.0 SSE & Stdio Active</span>
        </div>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1A1A1A]">
              MCP Server & AI Documentation
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#0047AB]/10 text-[#0047AB] border border-[#0047AB]/20 shadow-xs">
              <Code2 className="w-3.5 h-3.5 text-[#0047AB]" />
              MODEL CONTEXT PROTOCOL
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5A4E44] mt-1.5 max-w-3xl leading-relaxed font-medium">
            Seamlessly integrate Horizon with Claude Desktop, Cursor, Antigravity CLI, Windsurf, and custom AI agents.
            Access real-time DAG topology, autonomous recovery tools, EIP-712 signer gates, and slash commands.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/architect">
            <Button variant="primary" size="sm" className="gap-2 text-xs font-bold shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch AI Agent</span>
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Hero Cobalt Blue Patch: Quick Start Command Deck */}
      <motion.div variants={itemVariants} className="cobalt-patch p-6 sm:p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-xs font-mono font-bold">
            <Terminal className="w-3.5 h-3.5" />
            <span>Instant Agent Toolchain Installation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Connect AI Agents directly to Horizon Infrastructure
          </h2>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-medium">
            Run the Horizon MCP server to equip your LLM coding agents with live autonomous SRE powers:
            reading dependency graphs, diagnosing cascading blast radiuses, simulating outages, and approving cryptographic gates.
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
              <span>MCP Protocol Spec</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 border-b border-[#EADCC9] pb-3 text-xs">
        <button
          onClick={() => setActiveTab('mcp')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'mcp'
              ? 'bg-[#0047AB] text-white shadow-sm'
              : 'bg-[#FAF3EA] text-[#6E6258] hover:text-[#1A1A1A] hover:bg-[#F4EBE0] border border-[#E5D7C5]'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>MCP Server & Configs</span>
        </button>

        <button
          onClick={() => setActiveTab('slash')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
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
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
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
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'api'
              ? 'bg-[#0047AB] text-white shadow-sm'
              : 'bg-[#FAF3EA] text-[#6E6258] hover:text-[#1A1A1A] hover:bg-[#F4EBE0] border border-[#E5D7C5]'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>REST & Edge API</span>
        </button>
      </motion.div>

      {/* Tab 1: MCP Server & Client Configurations */}
      {activeTab === 'mcp' && (
        <div className="space-y-6">
          {/* Client Switcher and JSON Preview */}
          <Card className="p-6 skeuo-card border-[#E5D7C5] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EADCC9] gap-3">
              <div>
                <h3 className="text-base font-bold text-[#1A1A1A]">One-Click MCP Client Configuration</h3>
                <p className="text-xs text-[#6E6258] font-medium">
                  Copy and paste into your AI IDE configuration file to immediately connect Horizon tools.
                </p>
              </div>

              {/* IDE selector pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#FAF3EA] border border-[#E5D7C5]">
                {(['claude', 'cursor', 'antigravity', 'windsurf'] as const).map((client) => (
                  <button
                    key={client}
                    onClick={() => setMcpClient(client)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer ${
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

            {/* Path indicator & Code box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#6E6258] font-mono">
                <span>
                  {mcpClient === 'claude' && 'Target: ~/Library/Application Support/Claude/claude_desktop_config.json'}
                  {mcpClient === 'cursor' && 'Target: .cursor/mcp.json'}
                  {mcpClient === 'antigravity' && 'Target: ~/.gemini/antigravity-cli/mcp_servers.json'}
                  {mcpClient === 'windsurf' && 'Target: ~/.codeium/windsurf/mcp_config.json'}
                </span>
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
          </Card>

          {/* MCP Tools Specification Directory */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1A1A1A]">Exposed MCP SRE Tools Directory</h3>
              <span className="text-xs font-mono text-[#0047AB] font-bold">6 Registered Tools</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mcpTools.map((tool) => (
                <Card key={tool.name} className="p-5 skeuo-card border-[#E5D7C5] space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#EADCC9]">
                      <span className="font-mono text-xs font-bold text-[#0047AB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {tool.name}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        READY
                      </span>
                    </div>
                    <p className="text-xs text-[#403830] mt-2 font-medium leading-relaxed">{tool.desc}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#EADCC9] text-[11px] font-mono">
                    <div className="flex items-start gap-2">
                      <span className="text-[#8A7B6D] font-bold shrink-0">Params:</span>
                      <code className="text-[#1A1A1A] bg-[#FAF3EA] px-1.5 py-0.5 rounded truncate max-w-full">
                        {tool.params}
                      </code>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#8A7B6D] font-bold shrink-0">Returns:</span>
                      <code className="text-[#0047AB] bg-[#FAF3EA] px-1.5 py-0.5 rounded truncate max-w-full">
                        {tool.returns}
                      </code>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
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
                      <span className={`px-2 py-0.5 rounded font-black ${
                        ep.method === 'GET' ? 'bg-blue-50 text-[#0047AB] border border-blue-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      }`}>
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
