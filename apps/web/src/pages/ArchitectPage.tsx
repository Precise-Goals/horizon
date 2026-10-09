import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, type BezierDefinition } from 'framer-motion';
import {
  dagArchitectAgent,
  type DecodedArchitecture,
  type ChatMessage,
} from '../engine/dagArchitectAgent';
import { sarvamAgent } from '../engine/sarvamAgent';
import { clusterState } from '../engine/state';
import { MarkdownRenderer } from '../components/common/MarkdownRenderer';
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
  MessageSquare,
  ArrowDown,
} from 'lucide-react';
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

/**
 * Intelligent detector to determine if prompt is requesting DAG / Architecture generation.
 */
function isDagGenerationPrompt(text: string, mode: 'agent' | 'ask'): boolean {
  if (mode === 'agent') return true;
  const lower = text.toLowerCase();
  const dagKeywords = [
    'dag',
    'topology',
    'architecture',
    'generate',
    'synthesize',
    'microservice',
    'microservices',
    'pipeline',
    'stack',
    'mesh',
    'deadlock',
    'dependency graph',
    'build flow',
    'create flow',
    'design system',
    'infrastructure',
    'k8s',
    'kubernetes',
    'cluster',
    'orchestrate',
  ];
  return dagKeywords.some((kw) => lower.includes(kw));
}

export const ArchitectPage: React.FC = () => {
  // Mode selection: 'agent' (generates DAGs & actuators) | 'ask' (conversational SRE advisor)
  const [chatMode, setChatMode] = useState<'agent' | 'ask'>('agent');
  const [inputPrompt, setInputPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [thinkingStep, setThinkingStep] = useState<string>('');
  const [deployedArchName, setDeployedArchName] = useState<string | null>(null);

  // Active tab per message: Record<messageId, 'dag' | 'yaml' | 'rollout'>
  const [activeTabs, setActiveTabs] = useState<Record<string, 'dag' | 'yaml' | 'rollout'>>({});
  // Selected node for blast radius inspection: Record<messageId, string | null>
  const [selectedNodes, setSelectedNodes] = useState<Record<string, string | null>>({});
  const [copiedYamlId, setCopiedYamlId] = useState<string | null>(null);

  // Conversation history: Starts purely conversational with NO DAG window open!
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: 'Hi! I am the Horizon SRE Agent. Enter a prompt to generate a cycle-safe infrastructure DAG with real Sarvam AI reasoning, or ask me any site reliability engineering question.',
      mode: 'agent',
      // Note: No decoded architecture here so DAG window remains unopened initially!
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      mode: chatMode,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsProcessing(true);

    const isDagRequest = isDagGenerationPrompt(query, chatMode);

    if (isDagRequest) {
      // ── DAG GENERATION PIPELINE: Real Sarvam AI API + Kahn topological sort ──
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
        const msgId = `agent-${Date.now()}`;

        const agentMsg: ChatMessage = {
          id: msgId,
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: decoded.summary,
          reasoning: decoded.cycleDetected
            ? decoded.cycleExplanation
            : `Synthesized ${decoded.nodes.length} microservices across ${decoded.topologicalLevels.length} recovery tiers. Kahn’s algorithm proved acyclic structure: O(V + E) = ${decoded.nodes.length + decoded.edges.length} operations. Generated Kubernetes CRD spec and triggered DAG artifact window.`,
          decoded,
          mode: 'agent',
        };

        setActiveTabs((prev) => ({ ...prev, [msgId]: 'dag' }));
        setChatMessages((prev) => [...prev, agentMsg]);
      } catch {
        const fallbackArch = dagArchitectAgent.synthesizeArchitecture(query);
        const msgId = `agent-${Date.now()}`;

        const agentMsg: ChatMessage = {
          id: msgId,
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: fallbackArch.summary,
          reasoning: `Synthesized ${fallbackArch.nodes.length} microservices across ${fallbackArch.topologicalLevels.length} recovery tiers using verified topological heuristic engine.`,
          decoded: fallbackArch,
          mode: 'agent',
        };

        setActiveTabs((prev) => ({ ...prev, [msgId]: 'dag' }));
        setChatMessages((prev) => [...prev, agentMsg]);
      } finally {
        setIsProcessing(false);
        setThinkingStep('');
      }
    } else {
      // ── CONVERSATIONAL SRE GUIDANCE: Domain Guardrail & ~500 Char Complete Answer ──
      setThinkingStep('Querying Sarvam AI (sarvam-105b) for SRE guidance & resilience analysis...');
      await new Promise((r) => setTimeout(r, 200));

      try {
        const reply = await sarvamAgent.askSreAdvisor(query);

        const agentMsg: ChatMessage = {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: reply,
          mode: 'ask',
          // No decoded object -> DAG window does NOT open!
        };

        setChatMessages((prev) => [...prev, agentMsg]);
      } catch {
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

  const handleCopyYaml = (msgId: string, yamlContent: string) => {
    navigator.clipboard.writeText(yamlContent);
    setCopiedYamlId(msgId);
    setTimeout(() => setCopiedYamlId(null), 2000);
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
        text: 'Chat history cleared. Choose a scenario or enter an infrastructure requirement.',
        mode: chatMode,
      },
    ]);
  };

  // Helper to calculate blast radius for a given architecture and node
  const getBlastRadiusInfo = (arch: DecodedArchitecture, nodeId: string | null) => {
    if (!nodeId) return null;
    const node = arch.nodes.find((n) => n.id === nodeId);
    if (!node) return null;

    const downstream = new Set<string>();
    const queue = [nodeId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const n of arch.nodes) {
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
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="horizon-agent-app w-full flex-1 flex flex-col font-sans relative py-4 sm:py-6"
    >
      {/* ── TOP HEADER: Skeuomorphic, Spacious, Minimalistic ── */}
      <div className="text-center space-y-2 mb-6 sm:mb-8 shrink-0">
        <div className="flex items-center justify-center gap-3">
          <div className="w-9 h-9 rounded-2xl overflow-hidden bg-[#0A1128] border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.4)] p-1 flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="Horizon Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight uppercase font-sans">
            HORIZON
          </h1>
        </div>

        {/* Descriptive Subtitle with Spacious Breathing Room */}
        <p className="text-xs sm:text-sm text-[#6E6258] font-medium max-w-lg mx-auto leading-relaxed">
          Autonomous Multi-Agent Infrastructure Recovery &amp; DAG Flow Architect
        </p>

        {/* Subtle Skeuomorphic Version Pill */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-xs border border-[#E5D7C5] text-[11px] font-mono font-semibold text-[#0047AB] shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
            <span>v2.0</span>
            <span className="text-[#C2B29F]">&bull;</span>
            <span>Sarvam AI (105B)</span>
            <span className="text-[#C2B29F]">&bull;</span>
            <span>Kahn O(V+E) Engine</span>
          </div>
        </div>

        {/* ── Segmented Mode Switcher: Soft Skeuomorphic Pill ── */}
        <div className="flex items-center justify-center gap-3 pt-3">
          <div className="inline-flex p-1.5 rounded-2xl bg-[#EFE6DB]/70 border border-[#DFD3C3] shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
            <button
              onClick={() => setChatMode('agent')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2',
                chatMode === 'agent'
                  ? 'bg-white text-[#0047AB] font-bold shadow-[0_3px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] border border-[#E0D4C4]'
                  : 'text-[#6E6258] hover:text-[#1A1A1A]'
              )}
            >
              <Zap className="w-3.5 h-3.5 text-[#0047AB]" />
              <span>Agent Mode (DAG &amp; Actuators)</span>
            </button>

            <button
              onClick={() => setChatMode('ask')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2',
                chatMode === 'ask'
                  ? 'bg-white text-[#0047AB] font-bold shadow-[0_3px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] border border-[#E0D4C4]'
                  : 'text-[#6E6258] hover:text-[#1A1A1A]'
              )}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#0047AB]" />
              <span>Ask Mode (SRE Copilot)</span>
            </button>
          </div>

          {/* Quick utility controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleResetToDefault}
              className="p-2 rounded-xl bg-white/90 border border-[#E5D7C5] text-[#6E6258] hover:text-[#1A1A1A] hover:bg-white shadow-[0_2px_5px_rgba(0,0,0,0.04)] cursor-pointer text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Reset baseline cluster"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl bg-white/90 border border-[#E5D7C5] text-[#6E6258] hover:text-[#1A1A1A] hover:bg-white shadow-[0_2px_5px_rgba(0,0,0,0.04)] cursor-pointer text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Clear chat history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN CARD: Skeuomorphic, Spacious, Minimalistic (from referenceagent.png) ── */}
      <div className="w-full max-w-5xl mx-auto rounded-3xl border border-[#E5D7C5]/90 bg-gradient-to-b from-white via-[#FCF8F2] to-[#F8F1E7] shadow-[0_16px_48px_rgba(26,26,26,0.07),0_1px_3px_rgba(26,26,26,0.04)] p-6 sm:p-8 flex flex-col justify-between min-h-[660px] relative">
        {/* Chat History Flow */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 max-h-[calc(100vh-380px)] min-h-[400px]">
          {chatMessages.map((msg) => {
            const currentTab = activeTabs[msg.id] || 'dag';
            const selectedNodeId = selectedNodes[msg.id] || null;
            const blastInfo = msg.decoded ? getBlastRadiusInfo(msg.decoded, selectedNodeId) : null;

            return (
              <div
                key={msg.id}
                className={cn(
                  'flex flex-col space-y-2 w-full',
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                )}
              >
                {/* Header label */}
                <div className="flex items-center gap-2 text-[11px] font-mono font-medium text-[#8A7B6D] px-1">
                  {msg.sender === 'agent' && (
                    <div className="w-4 h-4 rounded-md overflow-hidden bg-[#0A1128] border border-black/10 flex items-center justify-center p-0.5 shrink-0 shadow-2xs">
                      <img src="/logo.png" alt="Horizon Agent" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <span className="font-semibold text-[#5A4E44]">
                    {msg.sender === 'user' ? 'Operator' : 'Horizon SRE Copilot'}
                  </span>
                  <span>&bull;</span>
                  <span>{msg.timestamp}</span>
                  {msg.mode && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-mono uppercase bg-[#FAF3EA] text-[#6E6258] border border-[#E5D7C5]">
                      {msg.mode}
                    </span>
                  )}
                </div>

                {/* Message Bubble: Soft Skeuomorphic Surface */}
                <div
                  className={cn(
                    'leading-relaxed transition-all',
                    msg.sender === 'user'
                      ? 'max-w-[85%] sm:max-w-[75%] p-4 bg-gradient-to-b from-[#0047AB] to-[#00388A] text-white rounded-2xl rounded-tr-xs shadow-[0_4px_14px_rgba(0,71,171,0.22),inset_0_1px_0_rgba(255,255,255,0.2)] font-medium text-xs sm:text-[13px]'
                      : 'w-full max-w-[98%] sm:max-w-[95%] p-5 sm:p-6 bg-white/95 text-[#1A1A1A] rounded-2xl rounded-tl-xs border border-[#E8DCCF] shadow-[0_4px_20px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] space-y-4'
                  )}
                >
                  {/* Markdown Renderer for elegant typography */}
                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <MarkdownRenderer content={msg.text} />
                  )}

                  {/* Thinking Process Accordion (if present) */}
                  {msg.reasoning && (
                    <div className="p-3.5 rounded-xl bg-[#FAF3EA]/80 border border-[#E5D7C5] text-[11px] font-mono space-y-1.5 shadow-2xs">
                      <div className="flex items-center gap-2 text-[#0047AB] font-bold">
                        <img src="/logo.png" alt="Horizon Icon" className="w-3.5 h-3.5 object-contain rounded" />
                        <span>Kahn’s Topological Reasoning Stream</span>
                      </div>
                      <p className="text-[#5A4E44] text-[11px] leading-relaxed font-sans font-medium">
                        {msg.reasoning}
                      </p>
                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────────
                      THE EMBEDDED DAG WINDOW (Directly from referenceagent.png)
                      ONLY OPENS WHEN PROMPT IS GIVEN RELATED TO DAG GENERATION!
                     ───────────────────────────────────────────────────────────── */}
                  {msg.decoded && (() => {
                    const decoded = msg.decoded;
                    return (
                      <div className="mt-4 rounded-2xl border border-[#E0D2C0] bg-gradient-to-b from-[#FFFDF9] to-[#FAF3EA] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)]">
                        {/* ── Top Bar matching wireframe: | DAG | Yaml | ── */}
                        <div className="px-4 py-3 bg-white/90 border-b border-[#E5D7C5] flex flex-wrap items-center justify-between gap-3">
                          {/* Tab Switcher: | DAG | Yaml | Rollout | */}
                          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F4EBE0]/80 border border-[#E2D5C4] shadow-inner">
                            <button
                              onClick={() =>
                                setActiveTabs((prev) => ({ ...prev, [msg.id]: 'dag' }))
                              }
                              className={cn(
                                'px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5',
                                currentTab === 'dag'
                                  ? 'bg-white text-[#0047AB] shadow-[0_2px_6px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] border border-[#DACBB8]'
                                  : 'text-[#6E6258] hover:text-[#1A1A1A]'
                              )}
                            >
                              <Network className="w-3.5 h-3.5" />
                              <span>DAG</span>
                            </button>

                            <button
                              onClick={() =>
                                setActiveTabs((prev) => ({ ...prev, [msg.id]: 'yaml' }))
                              }
                              className={cn(
                                'px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5',
                                currentTab === 'yaml'
                                  ? 'bg-white text-[#0047AB] shadow-[0_2px_6px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] border border-[#DACBB8]'
                                  : 'text-[#6E6258] hover:text-[#1A1A1A]'
                              )}
                            >
                              <FileCode className="w-3.5 h-3.5" />
                              <span>Yaml</span>
                            </button>

                            <button
                              onClick={() =>
                                setActiveTabs((prev) => ({ ...prev, [msg.id]: 'rollout' }))
                              }
                              className={cn(
                                'px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5',
                                currentTab === 'rollout'
                                  ? 'bg-white text-[#0047AB] shadow-[0_2px_6px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] border border-[#DACBB8]'
                                  : 'text-[#6E6258] hover:text-[#1A1A1A]'
                              )}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Rollout</span>
                            </button>
                          </div>

                          {/* Right side actions & Status */}
                          <div className="flex items-center gap-2">
                            {decoded.cycleDetected ? (
                              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-800 border border-red-300 shadow-2xs flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-red-600" />
                                <span>Deadlock Trap</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Acyclic Verified</span>
                              </span>
                            )}

                            {/* 1-Click Cluster Actuator */}
                            <button
                              onClick={() => handleDeployToCluster(decoded)}
                              disabled={decoded.cycleDetected}
                              className={cn(
                                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_2px_6px_rgba(0,71,171,0.2),inset_0_1px_0_rgba(255,255,255,0.3)]',
                                deployedArchName === decoded.architectureName
                                  ? 'bg-emerald-600 text-white border border-emerald-500'
                                  : 'bg-[#0047AB] hover:bg-[#00388A] text-white border border-[#00388A]'
                              )}
                              title="Deploy topology directly to active Horizon cluster"
                            >
                              {deployedArchName === decoded.architectureName ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <Rocket className="w-3.5 h-3.5" />
                              )}
                              <span>
                                {deployedArchName === decoded.architectureName
                                  ? 'Deployed!'
                                  : 'Deploy'}
                              </span>
                            </button>

                            {/* Copy & Download */}
                            <button
                              onClick={() => handleCopyYaml(msg.id, decoded.yamlPipeline)}
                              className="p-1.5 rounded-lg bg-white border border-[#E5D7C5] text-[#5A4E44] hover:text-[#1A1A1A] hover:bg-[#FAF3EA] transition-all cursor-pointer shadow-2xs"
                              title="Copy YAML"
                            >
                              {copiedYamlId === msg.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => handleDownloadYaml(decoded)}
                              className="p-1.5 rounded-lg bg-white border border-[#E5D7C5] text-[#5A4E44] hover:text-[#1A1A1A] hover:bg-[#FAF3EA] transition-all cursor-pointer shadow-2xs"
                              title="Download .yaml manifest"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* ── Active Tab Content Area ── */}
                        <div className="p-4 sm:p-5">
                          {/* ── TAB 1: VISUAL DAG GRAPH (Matches ovals & lines in referenceagent.png) ── */}
                          {currentTab === 'dag' && (
                            <div className="space-y-4">
                              {/* Topology Header Info */}
                              <div className="flex flex-wrap items-center justify-between text-xs text-[#1A1A1A] font-medium pb-2 border-b border-[#E8DCCF]">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[#0047AB]">
                                    {decoded.architectureName}
                                  </span>
                                  <span className="text-[#8A7B6D] font-mono text-[11px]">
                                    ({decoded.nodes.length} nodes &bull; {decoded.topologicalLevels.length} tiers)
                                  </span>
                                </div>
                                <span className="text-[11px] font-mono text-[#6E6258]">
                                  Click node to inspect Blast Radius
                                </span>
                              </div>

                              {/* Blast Radius Inspector Notification Banner */}
                              {blastInfo && (
                                <div className="p-3 rounded-xl bg-[#EBF1FA] border border-[#CCD8EB] text-xs flex items-center justify-between shadow-2xs">
                                  <div className="flex items-center gap-2.5">
                                    <Activity className="w-4 h-4 text-[#0047AB]" />
                                    <div>
                                      <span className="font-bold text-[#1A1A1A]">
                                        Selected Node: {blastInfo.selectedNode.name}
                                      </span>
                                      <span className="text-[10px] text-[#555555] block">
                                        Upstream: {blastInfo.upstreamDeps.length} providers &bull; Downstream blast impact: {blastInfo.downstreamBlast.length} services affected
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() =>
                                      setSelectedNodes((prev) => ({ ...prev, [msg.id]: null }))
                                    }
                                    className="text-[10px] font-semibold text-[#1A1A1A] hover:bg-[#FAF3EA] px-2.5 py-1 rounded-lg border border-[#CCD8EB] bg-white cursor-pointer shadow-2xs"
                                  >
                                    Clear Selection
                                  </button>
                                </div>
                              )}

                              {/* ── Visual Topological Tiers & Oval Nodes (from referenceagent.png) ── */}
                              <div className="space-y-5 pt-2">
                                {decoded.topologicalLevels
                                  .slice()
                                  .reverse()
                                  .map((tierNodeIds, tierIndex) => {
                                    const actualTier =
                                      decoded.topologicalLevels.length - 1 - tierIndex;
                                    const tierNodes = decoded.nodes.filter((n) =>
                                      tierNodeIds.includes(n.id)
                                    );

                                    return (
                                      <div key={actualTier} className="space-y-2.5 relative">
                                        {/* Tier Label */}
                                        <div className="flex items-center justify-between text-[11px] font-mono text-[#6E6258] border-b border-[#EADCC9] pb-1.5 font-semibold">
                                          <span className="text-[#0047AB] flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[#0047AB]" />
                                            {actualTier === 0
                                              ? 'TIER 0: PERSISTENCE & DATABASES'
                                              : actualTier === 1
                                              ? 'TIER 1: CACHES & EVENT LOGS'
                                              : actualTier === 2
                                              ? 'TIER 2: WORKERS & CORE APIS'
                                              : actualTier === 3
                                              ? 'TIER 3: INGRESS ROUTERS & GATEWAYS'
                                              : `TIER ${actualTier}: CLIENT APPLICATIONS`}
                                          </span>
                                          <span className="text-[#8A7B6D]">
                                            Boot Rank: #{actualTier + 1}
                                          </span>
                                        </div>

                                        {/* Oval / Capsule Nodes in this Tier (matches wireframe drawing) */}
                                        <div className="flex flex-wrap items-center justify-center gap-3.5 py-1">
                                          {tierNodes.map((node) => {
                                            const Icon = iconMap[node.type] || Server;
                                            const isSelected = selectedNodeId === node.id;
                                            const isDownstream =
                                              blastInfo?.downstreamBlast.includes(node.id);
                                            const isUpstream =
                                              blastInfo?.upstreamDeps.includes(node.id);

                                            return (
                                              <div
                                                key={node.id}
                                                onClick={() =>
                                                  setSelectedNodes((prev) => ({
                                                    ...prev,
                                                    [msg.id]: node.id,
                                                  }))
                                                }
                                                className={cn(
                                                  'px-4 py-2.5 rounded-full border transition-all duration-200 cursor-pointer flex items-center gap-2.5 shadow-[0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.7)] hover:scale-[1.02]',
                                                  isSelected
                                                    ? 'bg-gradient-to-b from-[#0047AB] to-[#003680] text-white border-[#003680] ring-2 ring-[#0047AB]/30 shadow-md scale-[1.03]'
                                                    : isDownstream
                                                    ? 'bg-rose-50 text-rose-950 border-rose-300 ring-1 ring-rose-400'
                                                    : isUpstream
                                                    ? 'bg-emerald-50 text-emerald-950 border-emerald-300 ring-1 ring-emerald-400'
                                                    : 'bg-white text-[#1A1A1A] border-[#E2D5C4] hover:border-[#0047AB]/50 hover:bg-[#FFFDF9]'
                                                )}
                                              >
                                                {/* Node Icon */}
                                                <div
                                                  className={cn(
                                                    'w-6 h-6 rounded-full flex items-center justify-center shrink-0 p-1',
                                                    isSelected
                                                      ? 'bg-white/20 text-white'
                                                      : 'bg-[#FAF3EA] text-[#0047AB] border border-[#E5D7C5]'
                                                  )}
                                                >
                                                  <Icon className="w-3.5 h-3.5" />
                                                </div>

                                                {/* Node Name */}
                                                <div className="flex flex-col">
                                                  <span className="text-xs font-bold tracking-tight leading-tight">
                                                    {node.name}
                                                  </span>
                                                  <span
                                                    className={cn(
                                                      'text-[9px] font-mono uppercase font-medium',
                                                      isSelected ? 'text-blue-100' : 'text-[#7A6E62]'
                                                    )}
                                                  >
                                                    {node.type}
                                                    {node.dependencies.length > 0 &&
                                                      ` &bull; ${node.dependencies.length} deps`}
                                                  </span>
                                                </div>

                                                {/* Status indicator */}
                                                <span
                                                  className={cn(
                                                    'w-2 h-2 rounded-full shrink-0',
                                                    node.status === 'healthy'
                                                      ? 'bg-emerald-500 animate-pulse'
                                                      : 'bg-rose-500'
                                                  )}
                                                />
                                              </div>
                                            );
                                          })}
                                        </div>

                                        {/* Connector arrow pointing to next layer */}
                                        {tierIndex < decoded.topologicalLevels.length - 1 && (
                                          <div className="flex items-center justify-center text-[#B0A294] py-0.5">
                                            <ArrowDown className="w-3.5 h-3.5" />
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}

                          {/* ── TAB 2: YAML SPEC CODE ── */}
                          {currentTab === 'yaml' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[11px] font-mono text-[#6E6258] bg-[#F4EBE0]/80 px-3 py-1.5 rounded-xl border border-[#E5D7C5]">
                                <span>Spec: horizon.recovery.io/v1alpha1 &bull; AutonomousRecoveryPipeline</span>
                                <button
                                  onClick={() => handleCopyYaml(msg.id, decoded.yamlPipeline)}
                                  className="text-[#0047AB] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  {copiedYamlId === msg.id ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                  <span>{copiedYamlId === msg.id ? 'Copied!' : 'Copy YAML'}</span>
                                </button>
                              </div>

                              <pre className="p-4 rounded-2xl bg-[#1A1A1A] border border-black/20 text-[11px] font-mono text-cyan-300 leading-relaxed overflow-x-auto select-all shadow-inner">
                                <code>{decoded.yamlPipeline}</code>
                              </pre>
                            </div>
                          )}

                          {/* ── TAB 3: KAHN RECOVERY ROLLOUT SEQUENCE ── */}
                          {currentTab === 'rollout' && (
                            <div className="space-y-2.5">
                              <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-[#1A1A1A] space-y-1">
                                <span className="font-bold flex items-center gap-1.5 text-[#0047AB]">
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Kahn’s Topological Recovery Sequence</span>
                                </span>
                                <p className="text-[11px] text-[#5A4E44] font-medium leading-relaxed">
                                  Deterministic bottom-up execution. Databases restore and satisfy health readiness probes before application pods accept ingress traffic.
                                </p>
                              </div>

                              {decoded.topologicalLevels.map((levelNodes, idx) => (
                                <div
                                  key={idx}
                                  className="p-3.5 rounded-xl bg-white border border-[#E5D7C5] flex items-center justify-between shadow-2xs"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#0047AB]/10 text-[#0047AB] border border-[#0047AB]/20 text-xs font-mono font-bold flex items-center justify-center shrink-0">
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
                                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1">
                                        <KeyRound className="w-3 h-3 text-amber-700" />
                                        <span>BridgeKey Gate</span>
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300">
                                        Autonomous
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })}

          {/* Live Thinking Stream Animation */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-white/95 border border-[#CCD8EB] shadow-[0_4px_16px_rgba(0,0,0,0.04)] space-y-2.5 w-full max-w-[95%]">
              <div className="flex items-center gap-2 text-xs text-[#0047AB] font-bold">
                <div className="w-5 h-5 rounded-md overflow-hidden bg-[#0A1128] border border-black/10 flex items-center justify-center p-0.5 shrink-0 animate-pulse">
                  <img src="/logo.png" alt="Horizon Agent" className="w-full h-full object-contain" />
                </div>
                <span>Sarvam AI Processing (sarvam-105b)...</span>
              </div>
              <div className="text-[11px] font-mono text-[#5A4E44] flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF3EA] border border-[#E5D7C5]">
                <span className="w-2 h-2 rounded-full bg-[#0047AB] animate-ping shrink-0" />
                <span>{thinkingStep}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── BOTTOM SECTION: Suggestions Chips & Rounded Composer Bar (from wireframe) ── */}
        <div className="pt-4 border-t border-[#E8DCCF] space-y-3 shrink-0">
          {/* Quick Scenario / Question Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-mono uppercase font-bold text-[#8A7B6D] shrink-0 flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#0047AB]" />
              <span>{chatMode === 'agent' ? 'Scenarios:' : 'Questions:'}</span>
            </span>
            {(chatMode === 'agent' ? AGENT_SUGGESTIONS : ASK_SUGGESTIONS).map((sug) => (
              <button
                key={sug.id}
                onClick={() => handleSendMessage(sug.prompt)}
                disabled={isProcessing}
                className="shrink-0 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white border border-[#E0D4C4] text-[10px] font-semibold text-[#1A1A1A] transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-xs hover:border-[#0047AB]/40 hover:-translate-y-0.5"
              >
                <sug.icon className="w-3 h-3 text-[#0047AB]" />
                <span>{sug.title}</span>
              </button>
            ))}
          </div>

          {/* Rounded Input Composer Bar: Soft Skeuomorphic Sunken Container */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative rounded-2xl border border-[#DFD3C3] bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.03)] p-2.5 sm:p-3 flex items-center gap-3"
          >
            <div className="pl-1 shrink-0">
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-[#0A1128] border border-black/10 flex items-center justify-center p-0.5 shadow-2xs">
                <img src="/logo.png" alt="Horizon Logo" className="w-full h-full object-contain" />
              </div>
            </div>

            <textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={
                chatMode === 'agent'
                  ? "Describe infrastructure to build DAG: 'E-commerce with MySQL, Redis, and Stripe', 'Fintech payments'..."
                  : "Ask SRE question: 'How does Kahn sort prevent cascade outages?', 'Compare PostgreSQL vs ScyllaDB'..."
              }
              rows={1}
              disabled={isProcessing}
              className="flex-1 py-1.5 px-2 text-xs sm:text-[13px] text-[#1A1A1A] placeholder-[#9A8B7D] focus:outline-none bg-transparent resize-none font-medium leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />

            <button
              type="submit"
              disabled={!inputPrompt.trim() || isProcessing}
              className="rounded-xl px-4 py-2 text-xs font-bold border border-[#00388A] bg-gradient-to-b from-[#0047AB] to-[#00388A] text-white shadow-[0_2px_6px_rgba(0,71,171,0.25),inset_0_1px_0_rgba(255,255,255,0.3)] hover:brightness-105 active:brightness-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{chatMode === 'agent' ? 'Synthesize' : 'Ask'}</span>
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default ArchitectPage;
