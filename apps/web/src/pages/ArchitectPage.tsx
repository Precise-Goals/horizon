import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, type BezierDefinition } from 'framer-motion';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  dagArchitectAgent,
  type DecodedArchitecture,
  type ChatMessage,
} from '../engine/dagArchitectAgent';
import { clusterState } from '../engine/state';
import type { SystemNode } from '../types';
import {
  Send,
  Network,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  Download,
  ArrowRight,
  Database,
  Server,
  Layers,
  Globe,
  Rocket,
  ShieldAlert,
  Play,
  ShieldCheck,
  KeyRound,
  Activity,
  Zap,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '../lib/utils';

const iconMap: Record<string, React.ElementType> = {
  database: Database,
  cache: Server,
  gateway: Globe,
  application: Layers,
};

const EASE: BezierDefinition = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, duration: 0.28 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: EASE },
  },
};

/* ─── Presentation Ready Prompt Suggestions ─── */
interface PromptSuggestion {
  id: string;
  title: string;
  category: string;
  badge: string;
  prompt: string;
  icon: React.ElementType;
}

const PRESENTATION_SUGGESTIONS: PromptSuggestion[] = [
  {
    id: 'ecommerce',
    title: 'E-Commerce Resilience Stack',
    category: 'Enterprise SaaS',
    badge: 'Popular',
    prompt: 'E-commerce platform with MySQL master, Redis cache, Auth worker, Stripe payment service, Order API, Envoy Gateway, and Next.js frontend.',
    icon: Layers,
  },
  {
    id: 'genai',
    title: 'GenAI Vector RAG & Inference',
    category: 'AI / ML Stack',
    badge: 'LLM SRE',
    prompt: 'GenAI stack with PostgreSQL pgvector, Milvus vector store, Redis semantic cache, embedding chunking worker, and vLLM inference server behind LiteLLM gateway.',
    icon: Sparkles,
  },
  {
    id: 'fintech',
    title: 'FinTech Core Ledger & Multi-Sig',
    category: 'Banking & Web3',
    badge: 'EIP-712',
    prompt: 'FinTech core banking with PostgreSQL immutable ledger, Kafka event bus, real-time fraud detection engine, core accounts API, and PCI-DSS edge gateway.',
    icon: ShieldCheck,
  },
  {
    id: 'streaming',
    title: 'OTT Video Transcoder Pool',
    category: 'Media & CDN',
    badge: 'High-Scale',
    prompt: 'High-scale OTT streaming platform with ScyllaDB catalog, Redis manifest cache, FFmpeg transcoding workers, recommendation API, and Cloudflare video ingress.',
    icon: Play,
  },
  {
    id: 'k8s',
    title: 'K8s Multi-Region Mesh',
    category: 'Cloud Native',
    badge: 'Multi-Cloud',
    prompt: 'Build an active-active Kubernetes multi-region service mesh with CockroachDB distributed SQL, NATS JetStream event bus, SPIFFE/SPIRE zero-trust auth worker, Multi-tenant partition API, and Istio Envoy ingress mesh.',
    icon: Globe,
  },
  {
    id: 'deadlock',
    title: 'Circular Deadlock Chaos Trap',
    category: 'Chaos SRE',
    badge: 'Cycle Alert',
    prompt: 'Simulate a circular deadlock where service A and service B depend on each other.',
    icon: AlertTriangle,
  },
];

/* ─── Embedded Architecture Artifact Canvas (Claude Style) ─── */
interface ArchitectureArtifactProps {
  architecture: DecodedArchitecture;
  onDeploy: (arch: DecodedArchitecture) => void;
  isDeployed?: boolean;
}

const ArchitectureArtifact: React.FC<ArchitectureArtifactProps> = ({
  architecture,
  onDeploy,
  isDeployed,
}) => {
  const [activeTab, setActiveTab] = useState<'dag' | 'yaml' | 'recovery'>('dag');
  const [copied, setCopied] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Blast radius calculation when an individual node is clicked
  const blastRadiusInfo = useMemo(() => {
    if (!selectedNodeId) return null;
    const node = architecture.nodes.find((n) => n.id === selectedNodeId);
    if (!node) return null;

    const downstream = new Set<string>();
    const queue = [selectedNodeId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const n of architecture.nodes) {
        if (n.dependencies.includes(current) && !downstream.has(n.id)) {
          downstream.add(n.id);
          queue.push(n.id);
        }
      }
    }

    return {
      selectedNode: node,
      upstreamDeps: node.dependencies,
      downstreamBlast: Array.from(downstream),
    };
  }, [selectedNodeId, architecture.nodes]);

  const handleCopyYaml = () => {
    navigator.clipboard.writeText(architecture.yamlPipeline);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadYaml = () => {
    const blob = new Blob([architecture.yamlPipeline], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${architecture.architectureName.toLowerCase().replace(/\s+/g, '-')}-pipeline.yaml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="horizon-artifact-embed w-full mt-3.5 rounded-2xl bg-white border border-[#E5D7C5] shadow-[0_4px_24px_rgba(26,26,26,0.06)] overflow-hidden">
      {/* Artifact Top Bar */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-[#FAF3EA] border-b border-[#E5D7C5] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0047AB] text-white flex items-center justify-center shadow-xs shrink-0">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-[#1A1A1A] tracking-tight">
                {architecture.architectureName}
              </h4>
              {architecture.cycleDetected ? (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
                  Deadlock Loop
                </span>
              ) : (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Acyclic Verified
                </span>
              )}
            </div>
            <p className="text-[10px] text-[#6E6258] font-mono mt-0.5">
              {architecture.nodes.length} Microservices &bull; {architecture.edges.length} Dependencies &bull; {architecture.topologicalLevels.length} Recovery Tiers
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onDeploy(architecture)}
            disabled={architecture.cycleDetected}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold gap-1.5 transition-all ${
              isDeployed ? 'bg-emerald-600 border-emerald-500 text-white' : ''
            }`}
            title="Deploy this architecture to active cluster state"
          >
            {isDeployed ? <Check className="w-3.5 h-3.5" /> : <Rocket className="w-3.5 h-3.5" />}
            <span>{isDeployed ? 'Deployed to Cluster!' : 'Deploy to Cluster'}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyYaml}
            className="rounded-xl p-2 h-8 w-8 text-[#6E6258] hover:text-[#1A1A1A]"
            title="Copy YAML spec"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadYaml}
            className="rounded-xl p-2 h-8 w-8 text-[#6E6258] hover:text-[#1A1A1A]"
            title="Download .yaml spec"
          >
            <Download className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Artifact View Tabs */}
      <div className="px-4 pt-2.5 pb-2 border-b border-[#EADCC9] bg-white flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dag')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'dag'
              ? 'bg-[#0047AB] text-white shadow-xs'
              : 'text-[#6E6258] hover:text-[#1A1A1A] hover:bg-[#FAF3EA]'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Flow Visualizer</span>
        </button>

        <button
          onClick={() => setActiveTab('yaml')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'yaml'
              ? 'bg-[#0047AB] text-white shadow-xs'
              : 'text-[#6E6258] hover:text-[#1A1A1A] hover:bg-[#FAF3EA]'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Dynamic YAML Spec</span>
        </button>

        <button
          onClick={() => setActiveTab('recovery')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'recovery'
              ? 'bg-[#0047AB] text-white shadow-xs'
              : 'text-[#6E6258] hover:text-[#1A1A1A] hover:bg-[#FAF3EA]'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Kahn Recovery Plan</span>
        </button>
      </div>

      {/* Main Artifact Canvas Body */}
      <div className="p-4 sm:p-5">
        {/* Circular Deadlock Warning */}
        {architecture.cycleDetected && (
          <div className="mb-3.5 p-3 rounded-xl bg-red-50 border border-red-300 text-xs text-red-900 flex items-start gap-2 shadow-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div>
              <span className="font-bold">Deadlock Loop Detected:</span>
              <p className="mt-0.5 text-red-800 leading-relaxed font-medium">
                {architecture.cycleExplanation}
              </p>
            </div>
          </div>
        )}

        {/* Blast Radius Inspector Notification Banner */}
        {blastRadiusInfo && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-[#EBF1FA] border border-[#0047AB]/30 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0047AB]" />
              <div>
                <span className="font-bold text-[#1A1A1A]">
                  Node Selected: {blastRadiusInfo.selectedNode.name}
                </span>
                <span className="text-[10px] text-[#555555] block">
                  Upstream deps: {blastRadiusInfo.upstreamDeps.length} &bull; Downstream blast radius: {blastRadiusInfo.downstreamBlast.length} affected
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedNodeId(null)}
              className="text-[10px] font-bold text-[#6E6258] hover:text-[#1A1A1A] px-2 py-0.5 rounded bg-white border border-[#CCD8EB] cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* TAB 1: FLOW VISUALIZER */}
          {activeTab === 'dag' && (
            <motion.div
              key="tab-dag"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 max-h-[460px] overflow-y-auto pr-1"
            >
              {architecture.topologicalLevels
                .slice()
                .reverse()
                .map((tierNodeIds, tierIndex) => {
                  const actualTier = architecture.topologicalLevels.length - 1 - tierIndex;
                  const tierNodes = architecture.nodes.filter((n) => tierNodeIds.includes(n.id));

                  return (
                    <div key={actualTier} className="space-y-2 relative">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#6E6258] border-b border-[#EADCC9] pb-1 font-bold">
                        <span className="text-[#0047AB] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#0047AB]" />
                          {actualTier === 0
                            ? 'TIER 0: FOUNDATIONAL PERSISTENCE & STORAGE'
                            : actualTier === 1
                            ? 'TIER 1: CACHES, KV STORES & EVENT BROKERS'
                            : actualTier === 2
                            ? 'TIER 2: CORE MICROSERVICES & WORKERS'
                            : actualTier === 3
                            ? 'TIER 3: INGRESS ROUTERS & API GATEWAYS'
                            : `TIER ${actualTier}: CLIENT APPLICATIONS`}
                        </span>
                        <span className="text-[#8A7B6D]">Recover Sequence: #{actualTier + 1}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {tierNodes.map((node) => {
                          const Icon = iconMap[node.type] || Server;
                          const isSelected = selectedNodeId === node.id;
                          const isDownstream = blastRadiusInfo?.downstreamBlast.includes(node.id);
                          const isUpstream = blastRadiusInfo?.upstreamDeps.includes(node.id);

                          return (
                            <div
                              key={node.id}
                              onClick={() => setSelectedNodeId(node.id)}
                              className={`p-3 rounded-xl border transition-all space-y-1.5 cursor-pointer shadow-xs ${
                                isSelected
                                  ? 'bg-[#EBF1FA] border-[#0047AB] ring-2 ring-[#0047AB] shadow-md scale-[1.01]'
                                  : isDownstream
                                  ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-400'
                                  : isUpstream
                                  ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400'
                                  : 'bg-white border-[#E5D7C5] hover:border-[#0047AB]/50 hover:shadow-xs'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`p-1.5 rounded-lg border ${
                                      isSelected
                                        ? 'bg-[#0047AB] text-white border-[#003680]'
                                        : 'bg-[#0047AB]/10 text-[#0047AB] border-[#0047AB]/20'
                                    }`}
                                  >
                                    <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-xs font-bold text-[#1A1A1A] truncate max-w-[130px]">
                                    {node.name}
                                  </span>
                                </div>
                                <span
                                  className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                                    node.status === 'healthy'
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                                  }`}
                                >
                                  {node.type}
                                </span>
                              </div>

                              <div className="pt-1 border-t border-[#F2E8DC] flex items-center justify-between text-[10px] font-mono text-[#6E6258]">
                                <span className="truncate max-w-[140px]">
                                  {node.dependencies.length === 0
                                    ? 'Root Dependency'
                                    : `Deps: ${node.dependencies.length}`}
                                </span>
                                <span className="flex items-center gap-1 font-bold text-[#0047AB]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>Ready</span>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </motion.div>
          )}

          {/* TAB 2: YAML SPEC */}
          {activeTab === 'yaml' && (
            <motion.div
              key="tab-yaml"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <pre className="p-3.5 rounded-xl bg-[#1A1A1A] border border-black text-[11px] font-mono text-cyan-300 leading-relaxed overflow-x-auto select-all shadow-inner max-h-[380px]">
                <code>{architecture.yamlPipeline}</code>
              </pre>
            </motion.div>
          )}

          {/* TAB 3: RECOVERY PLAN */}
          {activeTab === 'recovery' && (
            <motion.div
              key="tab-recovery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1"
            >
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#1A1A1A] space-y-0.5 shadow-xs">
                <span className="font-bold flex items-center gap-1.5 text-[#0047AB]">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Deterministic Recovery Rollout</span>
                </span>
                <p className="text-[11px] text-[#5A4E44] font-medium leading-relaxed">
                  Kahn’s acyclic sort guarantees zero deadlock loops. Foundational storage restores and passes readiness probes before upstream callers route traffic.
                </p>
              </div>

              {architecture.topologicalLevels.map((levelNodes, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white border border-[#E5D7C5] flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#0047AB]/10 border border-[#0047AB]/25 text-[#0047AB] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1A1A1A]">
                        Stage {idx + 1}: Restore {levelNodes.join(', ')}
                      </div>
                      <div className="text-[10px] text-[#6E6258] font-mono">
                        Parallel batch execution &bull; Health probe: HTTP 200 / SQL Ping
                      </div>
                    </div>
                  </div>

                  <div>
                    {idx === 0 ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <KeyRound className="w-3 h-3 text-amber-700" />
                        <span>BridgeKey Gate</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                        Autonomous
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ─── Main Full-Screen Architect Page ─── */
export const ArchitectPage: React.FC = () => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [thinkingStep, setThinkingStep] = useState<string>('');
  const [deployedArchName, setDeployedArchName] = useState<string | null>(null);

  // Thread scroll reference for automatic auto-scroll to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message with verified baseline architecture embedded
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const initialDecoded = dagArchitectAgent.synthesizeArchitecture(
      'E-commerce system with PostgreSQL, Redis cache, Auth worker, Stripe payment service, API gateway, and Horizon Web UI.'
    );
    return [
      {
        id: 'msg-welcome',
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Welcome to the Horizon Agentic Flow Architect. I synthesize natural language infrastructure requirements into verified DAG topologies, run Kahn’s algorithm to prove cycle safety, and compile declarative YAML recovery pipelines. Click any template or type an architecture requirement below.',
        reasoning: 'Baseline verified: 7 enterprise microservices partitioned into 4 topological tiers. Cycle check: O(V + E) Kahn sort PASSED with zero circular deadlocks.',
        decoded: initialDecoded,
      },
    ];
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isProcessing, thinkingStep]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsProcessing(true);

    // Dynamic simulated reasoning steps like Claude / Sarvam reasoning engine
    setThinkingStep('Analyzing natural language requirements & identifying entities...');
    await new Promise((r) => setTimeout(r, 160));
    setThinkingStep('Detecting persistence stores, caching layers, and ingress gateways...');
    await new Promise((r) => setTimeout(r, 180));
    setThinkingStep("Constructing directed dependency graph & executing Kahn's topological sort...");
    await new Promise((r) => setTimeout(r, 200));
    setThinkingStep('Validating acyclic graph invariant & compiling declarative YAML pipeline...');
    await new Promise((r) => setTimeout(r, 160));

    try {
      const decoded = await dagArchitectAgent.processPrompt(query);

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: decoded.summary,
        reasoning: decoded.cycleDetected
          ? decoded.cycleExplanation
          : `Synthesized ${decoded.nodes.length} microservices across ${decoded.topologicalLevels.length} topological recovery tiers. Kahn’s algorithm proved acyclic structure: O(V + E) = ${decoded.nodes.length + decoded.edges.length} operations. Declarative YAML recovery pipeline ready.`,
        decoded,
      };

      setChatMessages((prev) => [...prev, agentMsg]);
    } finally {
      setIsProcessing(false);
      setThinkingStep('');
    }
  };

  const handleDeployToCluster = (architecture: DecodedArchitecture) => {
    if (architecture.cycleDetected) {
      alert('Cannot deploy topology with circular dependency! Resolve deadlocks first.');
      return;
    }
    clusterState.setCustomTopology(architecture.nodes, architecture.architectureName);
    setDeployedArchName(architecture.architectureName);
    setTimeout(() => setDeployedArchName(null), 4000);
  };

  const handleResetToDefault = () => {
    clusterState.resetToDefaultTopology();
    alert('Horizon cluster reset to baseline 7-node enterprise topology.');
  };

  const handleClearHistory = () => {
    setChatMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Chat history cleared. Choose a scenario or enter any infrastructure requirement.',
      },
    ]);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="horizon-agent-fullscreen w-full flex-1 flex flex-col justify-between font-sans min-h-[calc(100vh-140px)]"
    >
      {/* ── Top Bar Header ── */}
      <motion.div variants={itemVariants} className="pb-3 border-b border-[#E5D7C5] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E6258] hover:text-[#1A1A1A] transition-colors"
          >
            <span>&larr; Home</span>
          </Link>
          <span className="text-[#D0C2B0] text-xs">|</span>
          <div className="flex items-center gap-2">
            {/* Logo.png Agent Icon in Top Header */}
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-[#0A1128] border border-[rgba(26,26,26,0.15)] shadow-xs flex items-center justify-center p-0.5 shrink-0">
              <img src="/logo.png" alt="Horizon Agent Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1A1A1A] tracking-tight leading-none">
                Horizon Agentic Flow Architect
              </h2>
              <span className="text-[10px] font-mono text-[#0047AB] font-bold">
                Sarvam-105B &bull; Kahn Topological Engine
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetToDefault}
            className="text-xs text-[#6E6258] hover:text-[#1A1A1A] gap-1.5 font-semibold"
            title="Reset active cluster to baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Baseline</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            className="text-xs text-[#6E6258] hover:text-[#1A1A1A] gap-1.5"
            title="Clear conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </Button>
        </div>
      </motion.div>

      {/* ── Main Full-Screen Chat Thread ── */}
      <div className="flex-1 overflow-y-auto py-5 space-y-6 max-w-4xl mx-auto w-full px-1">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Sender Metadata Row */}
            <div className="flex items-center gap-2 mb-1 text-[11px] font-mono font-bold text-[#8A7B6D]">
              {msg.sender === 'agent' && (
                <div className="w-6 h-6 rounded-md overflow-hidden bg-[#0A1128] border border-[#0047AB]/30 shadow-xs flex items-center justify-center p-0.5">
                  <img src="/logo.png" alt="Horizon Agent" className="w-full h-full object-contain" />
                </div>
              )}
              <span>{msg.sender === 'user' ? 'Operator Commander' : 'Horizon SRE Agent'}</span>
              <span>&bull;</span>
              <span>{msg.timestamp}</span>
            </div>

            {/* Message Bubble Body */}
            <div
              className={`w-full rounded-2xl ${
                msg.sender === 'user'
                  ? 'max-w-xl ml-auto p-4 bg-[#0047AB] text-white shadow-md font-medium text-xs leading-relaxed'
                  : 'p-0 text-[#1A1A1A] text-xs'
              }`}
            >
              {msg.sender === 'user' ? (
                <p>{msg.text}</p>
              ) : (
                <div className="space-y-3">
                  {/* Dynamic Claude-Style Collapsible Thought Process Box */}
                  {msg.reasoning && (
                    <div className="rounded-xl bg-[#FAF3EA] border border-[#E5D7C5] p-3 text-[11px] font-mono space-y-1">
                      <div className="flex items-center gap-1.5 text-[#0047AB] font-bold">
                        <img src="/logo.png" alt="Horizon Icon" className="w-3.5 h-3.5 object-contain rounded" />
                        <span>Kahn’s Topological Reasoning Engine</span>
                      </div>
                      <p className="text-[#5A4E44] text-[11px] leading-relaxed font-sans font-medium">
                        {msg.reasoning}
                      </p>
                    </div>
                  )}

                  {/* Summary Text */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E5D7C5] shadow-xs text-xs sm:text-sm leading-relaxed text-[#1A1A1A]">
                    <p>{msg.text}</p>
                  </div>

                  {/* Embedded Dynamic Graph Visualizer & Artifact (Claude Style) */}
                  {msg.decoded && (
                    <ArchitectureArtifact
                      architecture={msg.decoded}
                      onDeploy={handleDeployToCluster}
                      isDeployed={deployedArchName === msg.decoded.architectureName}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Dynamic Thinking State (as AI thinks in real time) */}
        {isProcessing && (
          <div className="flex flex-col items-start w-full">
            <div className="flex items-center gap-2 mb-1.5 text-[11px] font-mono font-bold text-[#8A7B6D]">
              <div className="relative w-6 h-6 rounded-md overflow-hidden bg-[#0A1128] border border-[#0047AB] shadow-md flex items-center justify-center p-0.5">
                <img src="/logo.png" alt="Horizon Agent" className="w-full h-full object-contain animate-pulse" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#0047AB] animate-ping" />
              </div>
              <span className="text-[#0047AB]">Horizon Agent Thinking...</span>
            </div>

            <div className="w-full p-4 rounded-2xl bg-white border border-[#0047AB]/30 shadow-md space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0047AB]">
                <div className="w-5 h-5 rounded-md overflow-hidden bg-[#0A1128] flex items-center justify-center p-0.5">
                  <img src="/logo.png" alt="Horizon Agent Logo" className="w-full h-full object-contain" />
                </div>
                <span>Synthesizing Infrastructure Architecture...</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF3EA] border border-[#E5D7C5] flex items-center gap-2 text-xs font-mono text-[#5A4E44]">
                <span className="w-2 h-2 rounded-full bg-[#0047AB] animate-ping" />
                <span>{thinkingStep}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Sticky Bottom Dock: Suggestions & Composer Bar ── */}
      <motion.div variants={itemVariants} className="pt-3 border-t border-[#E5D7C5] space-y-3 max-w-4xl mx-auto w-full">
        {/* Quick Scenario Prompt Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-mono uppercase font-bold text-[#8A7B6D] shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#0047AB]" />
            <span>Templates:</span>
          </span>
          {PRESENTATION_SUGGESTIONS.map((sug) => (
            <button
              key={sug.id}
              onClick={() => handleSendMessage(sug.prompt)}
              disabled={isProcessing}
              className="shrink-0 px-2.5 py-1 rounded-full bg-white hover:bg-[#FAF3EA] border border-[#E5D7C5] hover:border-[#0047AB] text-[11px] font-medium text-[#1A1A1A] transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:scale-[1.02]"
            >
              <sug.icon className="w-3 h-3 text-[#0047AB]" />
              <span>{sug.title}</span>
            </button>
          ))}
        </div>

        {/* Chat Composer Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative rounded-2xl skeuo-card p-2 border border-[#E5D7C5] bg-white shadow-lg flex items-center gap-2"
        >
          {/* Agent Logo icon inside composer */}
          <div className="pl-2 shrink-0">
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-[#0A1128] border border-[rgba(26,26,26,0.15)] flex items-center justify-center p-0.5">
              <img src="/logo.png" alt="Horizon Agent" className="w-full h-full object-contain" />
            </div>
          </div>

          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask Horizon: 'Build a fintech ledger with Postgres and Kafka', 'Simulate circular deadlock'..."
            rows={1}
            disabled={isProcessing}
            className="flex-1 py-1.5 px-2 text-xs sm:text-sm text-[#1A1A1A] placeholder-[#8A7B6D] focus:outline-none bg-transparent resize-none font-medium leading-relaxed"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />

          <Button
            type="submit"
            size="sm"
            variant="primary"
            disabled={!inputPrompt.trim() || isProcessing}
            className="rounded-xl px-4 py-2 text-xs font-bold gap-1.5 shrink-0 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Synthesize</span>
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ArchitectPage;
