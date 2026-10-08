import React, { useState, useMemo } from 'react';
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
  Bot,
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
  Cpu,
  KeyRound,
  ExternalLink,
  Info,
  Activity,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router';

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

/* ─── Presentation Ready Prompt Suggestions ─── */
interface PromptSuggestion {
  id: string;
  title: string;
  category: string;
  badge: string;
  desc: string;
  prompt: string;
  icon: React.ElementType;
  accent: string;
}

const PRESENTATION_SUGGESTIONS: PromptSuggestion[] = [
  {
    id: 'ecommerce',
    title: 'E-Commerce Resilience Stack',
    category: 'Enterprise SaaS',
    badge: 'Popular',
    desc: 'PostgreSQL, Redis cache, Auth worker, Stripe payment, and Envoy gateway.',
    prompt: 'E-commerce platform with MySQL master, Redis cache, Auth worker, Stripe payment service, Order API, Envoy Gateway, and Next.js frontend.',
    icon: Layers,
    accent: 'bg-blue-50 text-[#0047AB] border-blue-200',
  },
  {
    id: 'genai',
    title: 'GenAI Vector RAG & Inference',
    category: 'AI / ML Stack',
    badge: 'LLM SRE',
    desc: 'Milvus + pgvector dual stores, Redis semantic KV cache, and vLLM inference server.',
    prompt: 'GenAI stack with PostgreSQL pgvector, Milvus vector store, Redis semantic cache, embedding chunking worker, and vLLM inference server behind LiteLLM gateway.',
    icon: Sparkles,
    accent: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    id: 'fintech',
    title: 'FinTech Core Ledger & Multi-Sig',
    category: 'Banking & Web3',
    badge: 'EIP-712',
    desc: 'PostgreSQL immutable ledger, Kafka event bus, fraud detection, and BridgeKey signer.',
    prompt: 'FinTech core banking with PostgreSQL immutable ledger, Kafka event bus, real-time fraud detection engine, core accounts API, and PCI-DSS edge gateway.',
    icon: ShieldCheck,
    accent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'streaming',
    title: 'Video Streaming & OTT Transcoder',
    category: 'Media & CDN',
    badge: 'High-Scale',
    desc: 'ScyllaDB catalog, Redis manifest cache, FFmpeg pool, and Cloudflare edge.',
    prompt: 'High-scale OTT streaming platform with ScyllaDB catalog, Redis manifest cache, FFmpeg transcoding workers, recommendation API, and Cloudflare video ingress.',
    icon: Play,
    accent: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'k8s',
    title: 'K8s Multi-Region Edge Mesh',
    category: 'Cloud Native',
    badge: 'Multi-Cloud',
    desc: 'CockroachDB geo-SQL, NATS JetStream, SPIRE zero-trust, and Istio Envoy ingress.',
    prompt: 'Build an active-active Kubernetes multi-region service mesh with CockroachDB distributed SQL, NATS JetStream event bus, SPIFFE/SPIRE zero-trust auth worker, Multi-tenant partition API, and Istio Envoy ingress mesh.',
    icon: Globe,
    accent: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  {
    id: 'deadlock',
    title: 'Circular Deadlock Chaos Trap',
    category: 'Chaos SRE',
    badge: 'Cycle Alert',
    desc: 'Orders and Inventory mutual deadlock loop with automated Kahn sort detection.',
    prompt: 'Simulate a circular deadlock where service A and service B depend on each other.',
    icon: AlertTriangle,
    accent: 'bg-rose-50 text-rose-700 border-rose-200',
  },
];

export const ArchitectPage: React.FC = () => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dag' | 'yaml' | 'recovery'>('dag');
  const [copied, setCopied] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Initial welcome message with pre-compiled E-Commerce architecture
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const initialDecoded = dagArchitectAgent.synthesizeArchitecture(
      'E-commerce system with PostgreSQL, Redis cache, Auth worker, Stripe payment service, API gateway, and Horizon Web UI.'
    );
    return [
      {
        id: 'msg-1',
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Welcome to the Horizon Agentic Flow Architect. I synthesize natural language infrastructure requirements into verified DAG topologies, run Kahn’s algorithm to prove cycle safety, and compile declarative YAML recovery pipelines. Click any template above or type a custom prompt below.',
        reasoning: 'Pre-loaded verified baseline: 7 enterprise microservices partitioned into 4 topological tiers. Cycle check: O(V + E) Kahn sort PASSED.',
        decoded: initialDecoded,
      },
    ];
  });

  const [currentArchitecture, setCurrentArchitecture] = useState<DecodedArchitecture>(() => {
    return dagArchitectAgent.synthesizeArchitecture(
      'E-commerce system with PostgreSQL, Redis cache, Auth worker, Stripe payment service, API gateway, and Horizon Web UI.'
    );
  });

  // Blast radius calculation when a node is selected in the visualizer
  const blastRadiusInfo = useMemo(() => {
    if (!selectedNodeId) return null;
    const node = currentArchitecture.nodes.find((n) => n.id === selectedNodeId);
    if (!node) return null;

    const downstream = new Set<string>();
    const queue = [selectedNodeId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const n of currentArchitecture.nodes) {
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
  }, [selectedNodeId, currentArchitecture]);

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
    setDeployed(false);
    setSelectedNodeId(null);

    // Simulated fluid reasoning steps
    setProcessingStep('Extracting infrastructure entities & database layers...');
    await new Promise((r) => setTimeout(r, 180));
    setProcessingStep("Constructing directed dependency edges & Kahn's DAG tiers...");
    await new Promise((r) => setTimeout(r, 200));

    try {
      const decoded = await dagArchitectAgent.processPrompt(query);
      setCurrentArchitecture(decoded);

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: decoded.summary,
        reasoning: decoded.cycleDetected
          ? decoded.cycleExplanation
          : `Synthesized ${decoded.nodes.length} nodes across ${decoded.topologicalLevels.length} topological tiers. Cycle check: O(V + E) Kahn's sort PASSED with zero deadlocks. Declarative YAML CRD compiled.`,
        decoded,
      };

      setChatMessages((prev) => [...prev, agentMsg]);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleCopyYaml = () => {
    navigator.clipboard.writeText(currentArchitecture.yamlPipeline);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadYaml = () => {
    const blob = new Blob([currentArchitecture.yamlPipeline], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentArchitecture.architectureName.toLowerCase().replace(/\s+/g, '-')}-pipeline.yaml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeployToCluster = () => {
    if (currentArchitecture.cycleDetected) {
      alert('Cannot deploy topology with circular dependency! Resolve deadlocks first.');
      return;
    }
    clusterState.setCustomTopology(currentArchitecture.nodes, currentArchitecture.architectureName);
    setDeployed(true);
    setTimeout(() => setDeployed(false), 4000);
  };

  const handleResetToDefault = () => {
    clusterState.resetToDefaultTopology();
    alert('Horizon cluster reset to baseline 7-node enterprise topology.');
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 sm:space-y-8 font-sans w-full"
    >
      {/* Top Breadcrumb & Status */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#6E6258] hover:text-[#1A1A1A] transition-colors"
        >
          <span>&larr; Return to Home</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetToDefault}
            className="text-xs text-[#6E6258] hover:text-[#1A1A1A] gap-1.5 font-semibold"
            title="Reset active cluster to default 7-node baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </Button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#0047AB]/10 text-[#0047AB] border border-[#0047AB]/20 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#0047AB]" />
            AGENTIC SYNTHESIZER
          </span>
        </div>
      </motion.div>

      {/* Main Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1A1A1A]">
              AI Flow Architect & Live Visualizer
            </h1>
            <p className="text-xs sm:text-sm text-[#5A4E44] mt-1.5 max-w-3xl leading-relaxed font-medium">
              Interact with the Sarvam AI SRE Copilot. Generate, verify, and animate full cloud architectures with real-time Kahn topological sort, dynamic YAML pipelines, and blast-radius visualizers.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Kahn O(V+E) Engine Live
            </span>
          </div>
        </div>
      </motion.div>

      {/* ============================================================
          ONE-CLICK PRESENTATION SUGGESTIONS (Demo Without Typing!)
          ============================================================ */}
      <motion.div variants={itemVariants} className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6E6258] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#0047AB]" />
            <span>Presentation Prompt Scenarios (One-Click Demo)</span>
          </span>
          <span className="text-[11px] font-mono text-[#8A7B6D] hidden sm:inline">
            Click any card to instantly generate DAG & YAML
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESENTATION_SUGGESTIONS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleSendMessage(item.prompt)}
                disabled={isProcessing}
                className="group p-3.5 rounded-2xl bg-white border border-[#E5D7C5] hover:border-[#0047AB] hover:shadow-[0_8px_20px_rgba(0,71,171,0.08)] hover:-translate-y-0.5 transition-all text-left flex flex-col justify-between cursor-pointer space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl border ${item.accent} group-hover:scale-105 transition-transform`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#0047AB] transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-[#6E6258] font-medium">{item.category}</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-[#FAF3EA] border border-[#E5D7C5] text-[#6E6258]">
                    {item.badge}
                  </span>
                </div>

                <p className="text-[11px] text-[#5A4E44] leading-relaxed line-clamp-2 font-medium">
                  {item.desc}
                </p>

                <div className="pt-1.5 border-t border-[#F2E8DC] flex items-center justify-between text-[10px] font-bold text-[#0047AB]">
                  <span>Synthesize Live Workflow</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ============================================================
          MAIN WORKSPACE: CHATGPT-STYLE CHAT (LEFT) + CLAUDE-STYLE LIVE CANVAS (RIGHT)
          ============================================================ */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT: CHATGPT-STYLE CONVERSATION (5 COLS) ================= */}
        <Card className="lg:col-span-5 p-5 flex flex-col h-[740px] justify-between skeuo-card border-[#E5D7C5]">
          {/* Chat Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#EADCC9]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0047AB] text-white flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-1.5">
                  <span>Sarvam SRE Copilot</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Active
                  </span>
                </h3>
                <p className="text-[10px] text-[#6E6258] font-mono font-medium">
                  Engine: Topological Kahn Synthesizer
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setChatMessages([
                  {
                    id: `msg-${Date.now()}`,
                    sender: 'agent',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    text: 'Chat history cleared. Choose a scenario or enter a new infrastructure prompt.',
                  },
                ]);
              }}
              className="text-[10px] text-[#6E6258] hover:text-[#1A1A1A] p-1 h-auto"
              title="Clear message history"
            >
              Clear
            </Button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Message Meta */}
                <div className="flex items-center gap-1.5 mb-1 text-[10px] text-[#8A7B6D] font-mono font-bold">
                  <span>{msg.sender === 'user' ? 'Operator Commander' : 'Sarvam Agent'}</span>
                  <span>&bull;</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-3.5 rounded-2xl max-w-[94%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#0047AB] text-white shadow-sm font-medium'
                      : 'bg-white border border-[#E5D7C5] text-[#2C241E] shadow-xs'
                  }`}
                >
                  <p className={msg.sender === 'user' ? 'text-white' : 'text-[#1A1A1A]'}>
                    {msg.text}
                  </p>

                  {/* Collapsible Reasoning & Cycle Analysis (ChatGPT / Claude style) */}
                  {msg.reasoning && (
                    <div className="mt-3 p-2.5 rounded-xl bg-[#FAF3EA] border border-[#E5D7C5] text-[11px] font-mono space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kahn’s Topological Reasoner</span>
                      </div>
                      <p className="text-[#5A4E44] text-[10px] leading-normal font-sans font-medium">
                        {msg.reasoning}
                      </p>
                    </div>
                  )}

                  {/* Claude-style Live Artifact Card */}
                  {msg.decoded && (
                    <div className="mt-3 p-3 rounded-xl bg-[#F7EFE5] border border-[#E0D0BE] flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-[#0047AB] text-white">
                            <Network className="w-3.5 h-3.5" />
                          </span>
                          <div>
                            <span className="text-[11px] font-bold text-[#1A1A1A] block">
                              {msg.decoded.architectureName}
                            </span>
                            <span className="text-[9px] font-mono text-[#6E6258]">
                              {msg.decoded.nodes.length} nodes &bull; {msg.decoded.topologicalLevels.length} tiers
                            </span>
                          </div>
                        </div>

                        {msg.decoded.cycleDetected ? (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
                            Deadlock
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Acyclic
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-[#E5D7C5]">
                        <button
                          onClick={() => {
                            setCurrentArchitecture(msg.decoded!);
                            setActiveTab('dag');
                          }}
                          className="flex-1 py-1 px-2 rounded-lg bg-white hover:bg-stone-50 border border-[#D5C5B2] text-[10px] font-bold text-[#0047AB] transition-colors cursor-pointer text-center"
                        >
                          Inspect in Live Canvas
                        </button>
                        {!msg.decoded.cycleDetected && (
                          <button
                            onClick={() => {
                              setCurrentArchitecture(msg.decoded!);
                              handleDeployToCluster();
                            }}
                            className="py-1 px-2.5 rounded-lg bg-[#0047AB] hover:bg-[#003680] text-white text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Rocket className="w-3 h-3" />
                            <span>Deploy</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Live Streaming/Synthesis indicator */}
            {isProcessing && (
              <div className="p-3.5 rounded-2xl bg-white border border-[#0047AB]/30 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#0047AB] font-bold">
                  <Bot className="w-4 h-4 animate-spin text-[#0047AB]" />
                  <span>Synthesizing Agentic Workflow...</span>
                </div>
                <div className="text-[11px] font-mono text-[#5A4E44] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0047AB] animate-ping" />
                  <span>{processingStep}</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Composer Form */}
          <div className="pt-3 border-t border-[#EADCC9] space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative"
            >
              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Describe cloud infrastructure, microservices, or recovery requirements..."
                rows={3}
                disabled={isProcessing}
                className="w-full rounded-2xl skeuo-well px-3.5 py-2.5 text-xs text-[#1A1A1A] placeholder-[#8A7B6D] focus:outline-none focus:ring-2 focus:ring-[#0047AB]/30 resize-none font-medium bg-[#FFFBF7]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />

              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] font-mono text-[#8A7B6D] font-medium">
                  Press Enter to synthesize
                </span>
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  disabled={!inputPrompt.trim() || isProcessing}
                  className="rounded-xl px-4 py-1.5 text-xs font-bold gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>Synthesize</span>
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* ================= RIGHT: CLAUDE-STYLE LIVE ARTIFACT CANVAS (7 COLS) ================= */}
        <Card className="lg:col-span-7 p-6 flex flex-col h-[740px] justify-between skeuo-card border-[#E5D7C5]">
          <div>
            {/* Live Canvas Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#EADCC9] gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-[#1A1A1A] tracking-tight">
                    {currentArchitecture.architectureName}
                  </h3>
                  {currentArchitecture.cycleDetected ? (
                    <Badge status="critical">Deadlock Loop</Badge>
                  ) : (
                    <Badge status="healthy">Acyclic Verified</Badge>
                  )}
                </div>
                <p className="text-xs text-[#6E6258] mt-0.5 font-medium">
                  {currentArchitecture.nodes.length} Services &bull; {currentArchitecture.edges.length} Dependencies &bull; {currentArchitecture.topologicalLevels.length} Recovery Tiers
                </p>
              </div>

              {/* Action Buttons: Deploy to Cluster, Copy, Download */}
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDeployToCluster}
                  disabled={currentArchitecture.cycleDetected}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold gap-1.5 transition-all ${
                    deployed ? 'bg-emerald-600 border-emerald-500 text-white' : ''
                  }`}
                  title="Deploy this architecture to active Horizon clusterState"
                >
                  {deployed ? <Check className="w-3.5 h-3.5" /> : <Rocket className="w-3.5 h-3.5" />}
                  <span>{deployed ? 'Active in Cluster!' : 'Deploy to Cluster'}</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyYaml}
                  className="rounded-xl p-2 h-8 w-8 text-[#6E6258] hover:text-[#1A1A1A]"
                  title="Copy YAML spec to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownloadYaml}
                  className="rounded-xl p-2 h-8 w-8 text-[#6E6258] hover:text-[#1A1A1A]"
                  title="Download .yaml manifest"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Canvas Navigation Tabs */}
            <div className="flex items-center gap-2 mb-4 border-b border-[#EADCC9] pb-2">
              <button
                onClick={() => setActiveTab('dag')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'dag'
                    ? 'bg-[#0047AB] text-white shadow-xs'
                    : 'text-[#6E6258] hover:text-[#1A1A1A] hover:bg-[#FAF3EA]'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Animated Flow Visualizer</span>
              </button>

              <button
                onClick={() => setActiveTab('yaml')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
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
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'recovery'
                    ? 'bg-[#0047AB] text-white shadow-xs'
                    : 'text-[#6E6258] hover:text-[#1A1A1A] hover:bg-[#FAF3EA]'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Topological Kahn Plan</span>
              </button>
            </div>

            {/* Cycle Warning Banner if detected */}
            {currentArchitecture.cycleDetected && (
              <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-300 text-xs text-red-900 flex items-start gap-2.5 shadow-xs">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <div>
                  <span className="font-bold">Circular Deadlock Detected:</span>
                  <p className="mt-0.5 text-red-800 leading-relaxed font-medium">
                    {currentArchitecture.cycleExplanation}
                  </p>
                </div>
              </div>
            )}

            {/* Interactive Node Blast Radius Inspector Banner */}
            {blastRadiusInfo && (
              <div className="mb-4 p-3 rounded-2xl bg-[#EBF1FA] border border-[#0047AB]/30 text-xs flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#0047AB]" />
                  <div>
                    <span className="font-bold text-[#1A1A1A]">
                      Inspecting Node: {blastRadiusInfo.selectedNode.name}
                    </span>
                    <span className="text-[10px] text-[#555555] block">
                      Upstream dependencies: {blastRadiusInfo.upstreamDeps.length} &bull; Downstream blast radius: {blastRadiusInfo.downstreamBlast.length} services affected
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="text-[10px] font-bold text-[#6E6258] hover:text-[#1A1A1A] px-2 py-1 rounded bg-white border border-[#CCD8EB]"
                >
                  Clear Selection
                </button>
              </div>
            )}

            {/* Canvas Main Viewport */}
            <div className="overflow-y-auto max-h-[500px] pr-1">
              <AnimatePresence mode="wait">
                {/* ── TAB 1: ANIMATED WORKFLOW VISUALIZER ── */}
                {activeTab === 'dag' && (
                  <motion.div
                    key="tab-dag"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Render Tiers from Top to Bottom (Gateways down to Databases) */}
                    {currentArchitecture.topologicalLevels
                      .slice()
                      .reverse()
                      .map((tierNodeIds, tierIndex) => {
                        const actualTier = currentArchitecture.topologicalLevels.length - 1 - tierIndex;
                        const tierNodes = currentArchitecture.nodes.filter((n) => tierNodeIds.includes(n.id));

                        return (
                          <div key={actualTier} className="space-y-2 relative">
                            {/* Tier Header with Recovery Order */}
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

                            {/* Node Cards in this Tier */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {tierNodes.map((node) => {
                                const Icon = iconMap[node.type] || Server;
                                const isSelected = selectedNodeId === node.id;
                                const isDownstream = blastRadiusInfo?.downstreamBlast.includes(node.id);
                                const isUpstream = blastRadiusInfo?.upstreamDeps.includes(node.id);

                                return (
                                  <div
                                    key={node.id}
                                    onClick={() => setSelectedNodeId(node.id)}
                                    className={`p-3.5 rounded-xl border transition-all space-y-2 cursor-pointer shadow-xs ${
                                      isSelected
                                        ? 'bg-[#EBF1FA] border-[#0047AB] ring-2 ring-[#0047AB] shadow-md scale-[1.02]'
                                        : isDownstream
                                        ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-400'
                                        : isUpstream
                                        ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400'
                                        : 'bg-white border-[#E5D7C5] hover:border-[#0047AB]/50 hover:shadow-md'
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

                                    {/* Dependencies & Signal */}
                                    <div className="pt-1.5 border-t border-[#F2E8DC] flex items-center justify-between text-[10px] font-mono text-[#6E6258]">
                                      <span className="truncate max-w-[150px]">
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

                {/* ── TAB 2: DYNAMIC DECLARATIVE YAML SPEC ── */}
                {activeTab === 'yaml' && (
                  <motion.div
                    key="tab-yaml"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#6E6258] bg-[#F4EBE0] px-3 py-1.5 rounded-xl border border-[#E5D7C5]">
                      <span>Spec: horizon.recovery.io/v1alpha1 &bull; AutonomousRecoveryPipeline</span>
                      <button
                        onClick={handleCopyYaml}
                        className="text-[#0047AB] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied!' : 'Copy YAML'}</span>
                      </button>
                    </div>

                    <pre className="p-4 rounded-2xl bg-[#1A1A1A] border border-black text-[11px] font-mono text-cyan-300 leading-relaxed overflow-x-auto select-all shadow-inner">
                      <code>{currentArchitecture.yamlPipeline}</code>
                    </pre>
                  </motion.div>
                )}

                {/* ── TAB 3: TOPOLOGICAL KAHN RECOVERY PLAN ── */}
                {activeTab === 'recovery' && (
                  <motion.div
                    key="tab-recovery"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#1A1A1A] space-y-1 shadow-xs">
                      <span className="font-bold flex items-center gap-1.5 text-[#0047AB]">
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Kahn’s Topological Recovery Sequence</span>
                      </span>
                      <p className="text-[11px] text-[#5A4E44] font-medium leading-relaxed">
                        Deterministic bottom-up execution sequence. When an outage occurs, Horizon restores foundational databases first to eliminate connection refuels and deadlocks.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {currentArchitecture.topologicalLevels.map((levelNodes, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-white border border-[#E5D7C5] flex items-center justify-between shadow-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-[#0047AB]/10 border border-[#0047AB]/25 text-[#0047AB] text-xs font-mono font-bold flex items-center justify-center">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#1A1A1A]">
                                Stage {idx + 1}: Restore {levelNodes.join(', ')}
                              </div>
                              <div className="text-[10px] text-[#6E6258] font-mono mt-0.5">
                                Concurrency: Parallel batch execution &bull; Health Check: HTTP 200 / SQL Ping
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Footer Telemetry */}
          <div className="pt-3 border-t border-[#EADCC9] flex items-center justify-between text-[11px] font-mono text-[#8A7B6D] font-bold">
            <span>Spec: horizon.recovery.io/v1alpha1</span>
            <span>Target Governance: MST Testnet 91562037</span>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ArchitectPage;
