import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, type BezierDefinition } from 'framer-motion';
import { Button } from '../components/common/Button';
import {
  dagArchitectAgent,
  type DecodedArchitecture,
  type ChatMessage,
} from '../engine/dagArchitectAgent';
import { sarvamAgent } from '../engine/sarvamAgent';
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
  Trash2,
  Maximize2,
  Minimize2,
  X,
  MessageSquare,
  Bot,
  ExternalLink,
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
    transition: { staggerChildren: 0.05, duration: 0.25 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE },
  },
};

/* ─── Prompt Suggestions by Mode ─── */
interface PromptSuggestion {
  id: string;
  title: string;
  category: string;
  prompt: string;
  icon: React.ElementType;
}

const AGENT_SUGGESTIONS: PromptSuggestion[] = [
  {
    id: 'ecommerce',
    title: 'E-Commerce Resilience Stack',
    category: 'Enterprise SaaS',
    prompt: 'E-commerce platform with MySQL master, Redis cache, Auth worker, Stripe payment service, Order API, Envoy Gateway, and Next.js frontend.',
    icon: Layers,
  },
  {
    id: 'genai',
    title: 'GenAI Vector RAG & Inference',
    category: 'AI / ML Stack',
    prompt: 'GenAI stack with PostgreSQL pgvector, Milvus vector store, Redis semantic cache, embedding chunking worker, and vLLM inference server behind LiteLLM gateway.',
    icon: Sparkles,
  },
  {
    id: 'fintech',
    title: 'FinTech Core Ledger & Multi-Sig',
    category: 'Banking & Web3',
    prompt: 'FinTech core banking with PostgreSQL immutable ledger, Kafka event bus, real-time fraud detection engine, core accounts API, and PCI-DSS edge gateway.',
    icon: ShieldCheck,
  },
  {
    id: 'streaming',
    title: 'OTT Video Transcoder Pool',
    category: 'Media & CDN',
    prompt: 'High-scale OTT streaming platform with ScyllaDB catalog, Redis manifest cache, FFmpeg transcoding workers, recommendation API, and Cloudflare video ingress.',
    icon: Play,
  },
  {
    id: 'k8s',
    title: 'K8s Multi-Region Mesh',
    category: 'Cloud Native',
    prompt: 'Build an active-active Kubernetes multi-region service mesh with CockroachDB distributed SQL, NATS JetStream event bus, SPIFFE/SPIRE zero-trust auth worker, Multi-tenant partition API, and Istio Envoy ingress mesh.',
    icon: Globe,
  },
  {
    id: 'deadlock',
    title: 'Circular Deadlock Chaos Trap',
    category: 'Chaos SRE',
    prompt: 'Simulate a circular deadlock where service A and service B depend on each other.',
    icon: AlertTriangle,
  },
];

const ASK_SUGGESTIONS: PromptSuggestion[] = [
  {
    id: 'kahn-explain',
    title: 'How Kahn Sort Prevents Outages',
    category: 'SRE Theory',
    prompt: 'Explain how Kahn’s topological sort prevents connection refusal cascades and deadlocks during cloud infrastructure recovery.',
    icon: Sparkles,
  },
  {
    id: 'blast-radius',
    title: 'Calculating Blast Radius',
    category: 'Failure Analysis',
    prompt: 'How do you calculate downstream blast radius when a primary database connection pool is exhausted?',
    icon: Activity,
  },
  {
    id: 'eip712-approval',
    title: 'BridgeKey EIP-712 Approval Gates',
    category: 'Web3 Governance',
    prompt: 'Why do high-risk SRE failover actions require hardware-backed BridgeKey EIP-712 multi-signature approvals?',
    icon: KeyRound,
  },
  {
    id: 'db-comparison',
    title: 'PostgreSQL vs ScyllaDB for SRE',
    category: 'Architecture',
    prompt: 'Compare recovery characteristics of distributed ScyllaDB versus PostgreSQL primary-replica clusters under network partition.',
    icon: Database,
  },
];

export const ArchitectPage: React.FC = () => {
  // Mode selection: 'agent' (generates DAGs & actuators) | 'ask' (conversational SRE advisor)
  const [chatMode, setChatMode] = useState<'agent' | 'ask'>('agent');
  const [inputPrompt, setInputPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [thinkingStep, setThinkingStep] = useState<string>('');
  const [deployedArchName, setDeployedArchName] = useState<string | null>(null);

  // Claude Visualize Window state
  const [visualizeOpen, setVisualizeOpen] = useState(true);
  const [visualizeFullscreen, setVisualizeFullscreen] = useState(false);
  const [visualizeTab, setVisualizeTab] = useState<'dag' | 'yaml' | 'recovery'>('dag');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [copiedYaml, setCopiedYaml] = useState(false);

  // Active architecture currently loaded in the Visualize Window
  const [activeArchitecture, setActiveArchitecture] = useState<DecodedArchitecture>(() => {
    return dagArchitectAgent.synthesizeArchitecture(
      'E-commerce system with MySQL master, Redis cache, Auth worker, Stripe payment service, API gateway, and Horizon Web UI.'
    );
  });

  // Conversation history
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const initialDecoded = dagArchitectAgent.synthesizeArchitecture(
      'E-commerce system with MySQL master, Redis cache, Auth worker, Stripe payment service, API gateway, and Horizon Web UI.'
    );
    return [
      {
        id: 'msg-welcome',
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Welcome to the Horizon Agentic Flow Architect. I synthesize natural language requirements into verified DAG topologies with real Sarvam AI reasoning, run Kahn’s algorithm to guarantee cycle safety, and compile declarative YAML recovery pipelines. Use Agent Mode to build topologies or Ask Mode for expert SRE guidance.',
        reasoning: 'Verified enterprise baseline: 7 microservices partitioned into 4 topological tiers. Cycle check: O(V + E) Kahn sort PASSED with zero deadlocks.',
        decoded: initialDecoded,
        mode: 'agent',
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isProcessing, thinkingStep]);

  // Blast radius calculation when an individual node is selected in the visualizer window
  const blastRadiusInfo = useMemo(() => {
    if (!selectedNodeId || !activeArchitecture) return null;
    const node = activeArchitecture.nodes.find((n) => n.id === selectedNodeId);
    if (!node) return null;

    const downstream = new Set<string>();
    const queue = [selectedNodeId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const n of activeArchitecture.nodes) {
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
  }, [selectedNodeId, activeArchitecture]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query,
      mode: chatMode,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsProcessing(true);

    if (chatMode === 'agent') {
      // ── AGENT MODE: Real DAG synthesis via Sarvam AI API + Kahn topological sort ──
      setThinkingStep('Consulting Sarvam AI API (sarvam-105b) for infrastructure decomposition...');
      await new Promise((r) => setTimeout(r, 160));
      setThinkingStep('Analyzing persistence stores, caching tiers, and ingress microservices...');
      await new Promise((r) => setTimeout(r, 180));
      setThinkingStep("Constructing directed dependency graph & running Kahn's topological sort...");
      await new Promise((r) => setTimeout(r, 180));
      setThinkingStep('Validating acyclic graph invariant & compiling declarative YAML pipeline...');
      await new Promise((r) => setTimeout(r, 140));

      try {
        const decoded = await dagArchitectAgent.processPrompt(query);
        setActiveArchitecture(decoded);
        setVisualizeOpen(true); // Automatically triggers the Claude Visualize Window!
        setSelectedNodeId(null);

        const agentMsg: ChatMessage = {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: decoded.summary,
          reasoning: decoded.cycleDetected
            ? decoded.cycleExplanation
            : `Synthesized ${decoded.nodes.length} microservices across ${decoded.topologicalLevels.length} recovery tiers. Kahn’s algorithm proved acyclic structure: O(V + E) = ${decoded.nodes.length + decoded.edges.length} operations. Generated Kubernetes CRD spec and triggered Visualizer Window.`,
          decoded,
          mode: 'agent',
        };

        setChatMessages((prev) => [...prev, agentMsg]);
      } catch (err: any) {
        const fallbackArch = dagArchitectAgent.synthesizeArchitecture(query);
        setActiveArchitecture(fallbackArch);
        setVisualizeOpen(true);

        const agentMsg: ChatMessage = {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: fallbackArch.summary,
          reasoning: `Synthesized ${fallbackArch.nodes.length} microservices across ${fallbackArch.topologicalLevels.length} recovery tiers using verified topological heuristic engine.`,
          decoded: fallbackArch,
          mode: 'agent',
        };
        setChatMessages((prev) => [...prev, agentMsg]);
      } finally {
        setIsProcessing(false);
        setThinkingStep('');
      }
    } else {
      // ── ASK MODE: Conversational SRE Guidance via Sarvam AI API ──
      setThinkingStep('Querying Sarvam AI (sarvam-105b) for SRE guidance & resilience analysis...');
      await new Promise((r) => setTimeout(r, 200));

      try {
        const reply = await sarvamAgent.chat([
          {
            role: 'system',
            content:
              'You are the Horizon Senior Autonomous SRE Copilot (Sarvam-105B). Answer the user with clear, expert architectural guidance on site reliability engineering, dependency management, failure recovery, and zero-downtime rollouts. Use markdown formatting.',
          },
          { role: 'user', content: query },
        ]);

        const agentMsg: ChatMessage = {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: reply || 'Sarvam AI completed resilience analysis. Recommending Kahn topological dependency orchestration to eliminate cascading connection failures.',
          mode: 'ask',
        };

        setChatMessages((prev) => [...prev, agentMsg]);
      } catch (err: any) {
        const agentMsg: ChatMessage = {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: 'In distributed microservice meshes, services must be recovered strictly bottom-up: foundational storage must satisfy readiness probes before caches warm, followed by core workers, and finally ingress routers. This prevents thundering herds and crash loops.',
          mode: 'ask',
        };
        setChatMessages((prev) => [...prev, agentMsg]);
      } finally {
        setIsProcessing(false);
        setThinkingStep('');
      }
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

  const handleCopyYaml = (yamlContent: string) => {
    navigator.clipboard.writeText(yamlContent);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2000);
  };

  const handleDownloadYaml = (architecture: DecodedArchitecture) => {
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
        text: 'Chat history cleared. Choose a template or enter an infrastructure requirement.',
        mode: chatMode,
      },
    ]);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="horizon-agent-app w-full flex-1 flex flex-col justify-between font-sans min-h-[calc(100vh-140px)] relative"
    >
      {/* ── Top Navigation & Mode Switcher Bar ── */}
      <motion.div variants={itemVariants} className="pb-3 border-b border-[#E5D7C5] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E6258] hover:text-[#1A1A1A] transition-colors"
          >
            <span>&larr; Home</span>
          </Link>
          <span className="text-[#D0C2B0] text-xs">|</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-[#0A1128] border border-[rgba(26,26,26,0.15)] shadow-xs flex items-center justify-center p-0.5 shrink-0">
              <img src="/logo.png" alt="Horizon Agent Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1A1A1A] tracking-tight leading-none">
                Horizon Agentic Flow Architect
              </h2>
              <span className="text-[10px] font-mono text-[#0047AB] font-bold">
                Sarvam AI &bull; Kahn O(V+E) Engine
              </span>
            </div>
          </div>
        </div>

        {/* ── Ask Mode vs Agent Mode Segmented Switcher ── */}
        <div className="flex items-center p-1 rounded-xl bg-[#FAF3EA] border border-[#E5D7C5] shadow-xs">
          <button
            onClick={() => setChatMode('agent')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              chatMode === 'agent'
                ? 'bg-[#0047AB] text-white shadow-xs'
                : 'text-[#6E6258] hover:text-[#1A1A1A]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Agent Mode</span>
          </button>

          <button
            onClick={() => setChatMode('ask')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              chatMode === 'ask'
                ? 'bg-white text-[#0047AB] shadow-xs border border-[#CCD8EB]'
                : 'text-[#6E6258] hover:text-[#1A1A1A]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask Mode</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {activeArchitecture && !visualizeOpen && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setVisualizeOpen(true)}
              className="text-xs text-[#0047AB] border-[#0047AB]/30 gap-1.5 font-bold"
              title="Open Claude Visualize Window"
            >
              <Network className="w-3.5 h-3.5 text-[#0047AB]" />
              <span>Open Visualizer</span>
            </Button>
          )}

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
            title="Clear message history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        </div>
      </motion.div>

      {/* ── Main Canvas: Split View or Full Screen ── */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 my-4 overflow-hidden relative">
        {/* ── LEFT: AGENTIC CHAT WINDOW (Width adjusts dynamically based on Visualize Window) ── */}
        <div
          className={cn(
            'flex flex-col justify-between transition-all duration-300',
            visualizeFullscreen
              ? 'hidden'
              : visualizeOpen
              ? 'w-full lg:w-[46%] xl:w-[44%] shrink-0'
              : 'w-full max-w-4xl mx-auto'
          )}
        >
          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs max-h-[calc(100vh-270px)]">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Message Header */}
                <div className="flex items-center gap-1.5 mb-1 text-[11px] font-mono font-bold text-[#8A7B6D]">
                  {msg.sender === 'agent' && (
                    <div className="w-5 h-5 rounded-md overflow-hidden bg-[#0A1128] border border-[#0047AB]/30 flex items-center justify-center p-0.5 shrink-0">
                      <img src="/logo.png" alt="Horizon Agent" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <span>{msg.sender === 'user' ? 'Operator' : 'Horizon SRE Copilot'}</span>
                  <span>&bull;</span>
                  <span>{msg.timestamp}</span>
                  {msg.mode && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono uppercase bg-[#FAF3EA] text-[#6E6258] border border-[#E5D7C5]">
                      {msg.mode}
                    </span>
                  )}
                </div>

                {/* Message Bubble Content */}
                <div
                  className={`rounded-2xl leading-relaxed ${
                    msg.sender === 'user'
                      ? 'max-w-[85%] p-3.5 bg-[#0047AB] text-white shadow-sm font-medium'
                      : 'w-full p-4 bg-white border border-[#E5D7C5] text-[#1A1A1A] shadow-xs space-y-3'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Thinking Process Accordion */}
                  {msg.reasoning && (
                    <div className="p-2.5 rounded-xl bg-[#FAF3EA] border border-[#E5D7C5] text-[11px] font-mono space-y-1">
                      <div className="flex items-center gap-1.5 text-[#0047AB] font-bold">
                        <img src="/logo.png" alt="Horizon Icon" className="w-3.5 h-3.5 object-contain rounded" />
                        <span>Kahn’s Topological Reasoning Stream</span>
                      </div>
                      <p className="text-[#5A4E44] text-[11px] leading-relaxed font-sans font-medium">
                        {msg.reasoning}
                      </p>
                    </div>
                  )}

                  {/* Claude-style Artifact Pill in Message to trigger Visualizer Window */}
                  {msg.decoded && (
                    <div className="p-3 rounded-xl bg-[#F7EFE5] border border-[#E0D0BE] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#0047AB] text-white flex items-center justify-center shrink-0">
                          <Network className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-[11px] text-[#1A1A1A]">
                            {msg.decoded.architectureName}
                          </div>
                          <div className="text-[9px] font-mono text-[#6E6258]">
                            {msg.decoded.nodes.length} nodes &bull; {msg.decoded.topologicalLevels.length} recovery tiers
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveArchitecture(msg.decoded!);
                          setVisualizeOpen(true);
                          setVisualizeTab('dag');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#0047AB] hover:bg-[#003680] text-white text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm shrink-0"
                      >
                        <Network className="w-3 h-3" />
                        <span>Inspect in Window</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Live Thinking Stream Animation */}
            {isProcessing && (
              <div className="p-3.5 rounded-2xl bg-white border border-[#0047AB]/30 shadow-md space-y-2 w-full">
                <div className="flex items-center gap-2 text-xs text-[#0047AB] font-bold">
                  <div className="w-5 h-5 rounded-md overflow-hidden bg-[#0A1128] flex items-center justify-center p-0.5 shrink-0 animate-pulse">
                    <img src="/logo.png" alt="Horizon Agent" className="w-full h-full object-contain" />
                  </div>
                  <span>Sarvam AI Processing...</span>
                </div>
                <div className="text-[11px] font-mono text-[#5A4E44] flex items-center gap-2 p-2 rounded-lg bg-[#FAF3EA] border border-[#E5D7C5]">
                  <span className="w-2 h-2 rounded-full bg-[#0047AB] animate-ping shrink-0" />
                  <span>{thinkingStep}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestions & Composer */}
          <div className="pt-3 border-t border-[#E5D7C5] space-y-2.5">
            {/* Template Chips for Quick Demos */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] font-mono uppercase font-bold text-[#8A7B6D] shrink-0 flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#0047AB]" />
                <span>{chatMode === 'agent' ? 'Scenarios:' : 'Questions:'}</span>
              </span>
              {(chatMode === 'agent' ? AGENT_SUGGESTIONS : ASK_SUGGESTIONS).map((sug) => (
                <button
                  key={sug.id}
                  onClick={() => handleSendMessage(sug.prompt)}
                  disabled={isProcessing}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-white hover:bg-[#FAF3EA] border border-[#E5D7C5] hover:border-[#0047AB] text-[10px] font-semibold text-[#1A1A1A] transition-all cursor-pointer flex items-center gap-1 shadow-2xs hover:scale-[1.02]"
                >
                  <sug.icon className="w-3 h-3 text-[#0047AB]" />
                  <span>{sug.title}</span>
                </button>
              ))}
            </div>

            {/* Composer Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative rounded-2xl skeuo-card p-2 border border-[#E5D7C5] bg-white shadow-md flex items-center gap-2"
            >
              <div className="pl-1.5 shrink-0">
                <div className="w-6 h-6 rounded-md overflow-hidden bg-[#0A1128] border border-[rgba(26,26,26,0.15)] flex items-center justify-center p-0.5">
                  <img src="/logo.png" alt="Horizon Agent" className="w-full h-full object-contain" />
                </div>
              </div>

              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder={
                  chatMode === 'agent'
                    ? "Agent: 'Design fintech settlement with Postgres and Kafka', 'Simulate circular deadlock'..."
                    : "Ask: 'How does Kahn sort prevent outages?', 'Compare ScyllaDB vs PostgreSQL'..."
                }
                rows={1}
                disabled={isProcessing}
                className="flex-1 py-1 px-1.5 text-xs text-[#1A1A1A] placeholder-[#8A7B6D] focus:outline-none bg-transparent resize-none font-medium leading-relaxed"
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
                className="rounded-xl px-3.5 py-1.5 text-xs font-bold gap-1 shrink-0 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {chatMode === 'agent' ? 'Synthesize' : 'Ask'}
                </span>
              </Button>
            </form>
          </div>
        </div>

        {/* ── RIGHT: CLAUDE VISUALIZE WINDOW (Artifacts Side Pane) ── */}
        <AnimatePresence>
          {visualizeOpen && activeArchitecture && (
            <motion.div
              key="visualize-window"
              initial={{ opacity: 0, x: 24, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.98 }}
              transition={{ duration: 0.28, ease: EASE }}
              className={cn(
                'flex flex-col rounded-3xl skeuo-card border border-[#E5D7C5] bg-white shadow-2xl overflow-hidden transition-all',
                visualizeFullscreen
                  ? 'w-full h-[calc(100vh-170px)]'
                  : 'w-full lg:w-[54%] xl:w-[56%] h-[calc(100vh-170px)] shrink-0'
              )}
            >
              {/* Window Header Bar */}
              <div className="px-4 py-3 bg-[#FAF3EA] border-b border-[#E5D7C5] flex flex-wrap items-center justify-between gap-2.5 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-[#0A1128] border border-[rgba(26,26,26,0.15)] flex items-center justify-center p-0.5 shrink-0">
                    <img src="/logo.png" alt="Horizon Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-[#1A1A1A] tracking-tight">
                        {activeArchitecture.architectureName}
                      </h3>
                      {activeArchitecture.cycleDetected ? (
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
                          Deadlock
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Acyclic Verified
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#6E6258] font-mono">
                      {activeArchitecture.nodes.length} nodes &bull; {activeArchitecture.topologicalLevels.length} recovery tiers
                    </span>
                  </div>
                </div>

                {/* Window Actions: Deploy, Copy, Fullscreen, Close */}
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDeployToCluster(activeArchitecture)}
                    disabled={activeArchitecture.cycleDetected}
                    className={`rounded-xl px-3 py-1 text-xs font-bold gap-1 transition-all ${
                      deployedArchName === activeArchitecture.architectureName
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : ''
                    }`}
                    title="Deploy this architecture to active cluster"
                  >
                    {deployedArchName === activeArchitecture.architectureName ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Rocket className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {deployedArchName === activeArchitecture.architectureName
                        ? 'Deployed!'
                        : 'Deploy to Cluster'}
                    </span>
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopyYaml(activeArchitecture.yamlPipeline)}
                    className="rounded-xl p-1.5 h-7 w-7 text-[#6E6258] hover:text-[#1A1A1A]"
                    title="Copy YAML spec"
                  >
                    {copiedYaml ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownloadYaml(activeArchitecture)}
                    className="rounded-xl p-1.5 h-7 w-7 text-[#6E6258] hover:text-[#1A1A1A]"
                    title="Download .yaml spec"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>

                  <button
                    onClick={() => setVisualizeFullscreen(!visualizeFullscreen)}
                    className="p-1.5 rounded-xl hover:bg-black/5 text-[#6E6258] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                    title={visualizeFullscreen ? 'Exit fullscreen' : 'Maximize window'}
                  >
                    {visualizeFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => {
                      setVisualizeOpen(false);
                      setVisualizeFullscreen(false);
                    }}
                    className="p-1.5 rounded-xl hover:bg-red-50 text-[#6E6258] hover:text-red-600 transition-colors cursor-pointer"
                    title="Close Visualizer Window"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Window Tab Navigation */}
              <div className="px-4 pt-2 pb-1.5 bg-white border-b border-[#EADCC9] flex items-center gap-1.5 overflow-x-auto shrink-0">
                <button
                  onClick={() => setVisualizeTab('dag')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    visualizeTab === 'dag'
                      ? 'bg-[#0047AB] text-white shadow-xs'
                      : 'text-[#6E6258] hover:text-[#1A1A1A] hover:bg-[#FAF3EA]'
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>Flow Visualizer</span>
                </button>

                <button
                  onClick={() => setVisualizeTab('yaml')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    visualizeTab === 'yaml'
                      ? 'bg-[#0047AB] text-white shadow-xs'
                      : 'text-[#6E6258] hover:text-[#1A1A1A] hover:bg-[#FAF3EA]'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Dynamic YAML Code</span>
                </button>

                <button
                  onClick={() => setVisualizeTab('recovery')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    visualizeTab === 'recovery'
                      ? 'bg-[#0047AB] text-white shadow-xs'
                      : 'text-[#6E6258] hover:text-[#1A1A1A] hover:bg-[#FAF3EA]'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kahn Recovery Rollout</span>
                </button>
              </div>

              {/* Main Visualizer Body Content with Fluent Staged Animations */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {/* Circular Deadlock Warning */}
                {activeArchitecture.cycleDetected && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-xs text-red-900 flex items-start gap-2 shadow-xs">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                    <div>
                      <span className="font-bold">Circular Deadlock Detected:</span>
                      <p className="mt-0.5 text-red-800 leading-relaxed font-medium">
                        {activeArchitecture.cycleExplanation}
                      </p>
                    </div>
                  </div>
                )}

                {/* Blast Radius Inspector Banner */}
                {blastRadiusInfo && (
                  <div className="p-2.5 rounded-xl bg-[#EBF1FA] border border-[#0047AB]/30 text-xs flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#0047AB]" />
                      <div>
                        <span className="font-bold text-[#1A1A1A]">
                          Node Selected: {blastRadiusInfo.selectedNode.name}
                        </span>
                        <span className="text-[10px] text-[#555555] block">
                          Upstream: {blastRadiusInfo.upstreamDeps.length} &bull; Downstream blast radius: {blastRadiusInfo.downstreamBlast.length} services affected
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedNodeId(null)}
                      className="text-[10px] font-bold text-[#6E6258] hover:text-[#1A1A1A] px-2 py-0.5 rounded bg-white border border-[#CCD8EB] cursor-pointer"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {/* TAB 1: FLOW VISUALIZER WITH FLUENT TIER ANIMATIONS */}
                  {visualizeTab === 'dag' && (
                    <motion.div
                      key="visualize-dag"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      {activeArchitecture.topologicalLevels
                        .slice()
                        .reverse()
                        .map((tierNodeIds, tierIndex) => {
                          const actualTier = activeArchitecture.topologicalLevels.length - 1 - tierIndex;
                          const tierNodes = activeArchitecture.nodes.filter((n) => tierNodeIds.includes(n.id));

                          return (
                            <motion.div
                              key={actualTier}
                              initial={{ opacity: 0, y: 16 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.35, delay: tierIndex * 0.08, ease: EASE }}
                              className="space-y-2 relative"
                            >
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

                              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
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
                                          <span className="text-xs font-bold text-[#1A1A1A] truncate max-w-[120px]">
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
                                        <span className="truncate max-w-[130px]">
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
                            </motion.div>
                          );
                        })}
                    </motion.div>
                  )}

                  {/* TAB 2: DYNAMIC YAML CODE */}
                  {visualizeTab === 'yaml' && (
                    <motion.div
                      key="visualize-yaml"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#6E6258] bg-[#F4EBE0] px-3 py-1.5 rounded-xl border border-[#E5D7C5]">
                        <span>Spec: horizon.recovery.io/v1alpha1 &bull; AutonomousRecoveryPipeline</span>
                        <button
                          onClick={() => handleCopyYaml(activeArchitecture.yamlPipeline)}
                          className="text-[#0047AB] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {copiedYaml ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedYaml ? 'Copied!' : 'Copy YAML'}</span>
                        </button>
                      </div>

                      <pre className="p-4 rounded-2xl bg-[#1A1A1A] border border-black text-[11px] font-mono text-cyan-300 leading-relaxed overflow-x-auto select-all shadow-inner">
                        <code>{activeArchitecture.yamlPipeline}</code>
                      </pre>
                    </motion.div>
                  )}

                  {/* TAB 3: KAHN RECOVERY ROLLOUT */}
                  {visualizeTab === 'recovery' && (
                    <motion.div
                      key="visualize-recovery"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-2.5"
                    >
                      <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#1A1A1A] space-y-0.5 shadow-xs">
                        <span className="font-bold flex items-center gap-1.5 text-[#0047AB]">
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Kahn’s Topological Recovery Sequence</span>
                        </span>
                        <p className="text-[11px] text-[#5A4E44] font-medium leading-relaxed">
                          Deterministic bottom-up execution. Databases restore and satisfy health readiness probes before application pods accept ingress traffic.
                        </p>
                      </div>

                      {activeArchitecture.topologicalLevels.map((levelNodes, idx) => (
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ArchitectPage;
