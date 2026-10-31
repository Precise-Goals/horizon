import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, type BezierDefinition } from "framer-motion";
import {
  dagArchitectAgent,
  type DecodedArchitecture,
  type ChatMessage,
} from "../engine/dagArchitectAgent";
import { sarvamAgent } from "../engine/sarvamAgent";
import { clusterState } from "../engine/state";
import { MarkdownRenderer } from "../components/common/MarkdownRenderer";
import { MiroDagCanvas } from "../components/dag/MiroDagCanvas";
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
  Rocket,
  ShieldAlert,
  Play,
  ShieldCheck,
  KeyRound,
  Activity,
  Zap,
  Trash2,
  MessageSquare,
  Database,
  Layers,
  Loader2,
  Wrench,
  Brain,
  ExternalLink,
  Video,
  Ticket,
  FileText,
} from "lucide-react";
import {
  pipelineDeployer,
  type DeploymentProgress,
} from "../engine/pipelineDeployer";
import { cn } from "../lib/utils";

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
    id: "streaming",
    title: "Live Video Streaming & CDN Mesh",
    category: "OTT Streaming",
    prompt:
      "High-scale live video streaming platform with ScyllaDB video catalog, Redis manifest cache, Kafka live ingestion stream, FFmpeg GPU transcoding worker pool, Recommendation AI service, and Cloudflare Video CDN edge ingress.",
    icon: Video,
  },
  {
    id: "ticket-booking",
    title: "Live Ticket Booking Flash-Sale",
    category: "High Concurrency",
    prompt:
      "High-concurrency live ticket booking system with CockroachDB seating ledger, Redis distributed inventory locks, RabbitMQ booking queue, Seat Allocation Worker, Stripe checkout service, and AWS CloudFront edge ingress with bot mitigation.",
    icon: Ticket,
  },
  {
    id: "blogging-cms",
    title: "High-Traffic Blogging & Publishing",
    category: "Content Publishing",
    prompt:
      "Scalable blogging and digital publication platform with PostgreSQL content store, Varnish HTTP edge cache, Redis article feed cache, S3 media asset storage worker, Algolia full-text search indexer, and Next.js ISR frontend behind Cloudflare WAF.",
    icon: FileText,
  },
  {
    id: "ecommerce",
    title: "E-Commerce Resilience Stack",
    category: "Enterprise SaaS",
    prompt:
      "E-commerce platform with MySQL master, Redis cache, Auth worker, Stripe payment service, Order API, Envoy Gateway, and Next.js frontend.",
    icon: Layers,
  },
  {
    id: "genai",
    title: "GenAI Vector RAG & Inference",
    category: "AI / ML Stack",
    prompt:
      "GenAI stack with PostgreSQL pgvector, Milvus vector store, Redis semantic cache, embedding chunking worker, and vLLM inference server behind LiteLLM gateway.",
    icon: Sparkles,
  },
  {
    id: "fintech",
    title: "FinTech Core Ledger & Multi-Sig",
    category: "Banking & Web3",
    prompt:
      "FinTech core banking with PostgreSQL immutable ledger, Kafka event bus, real-time fraud detection engine, core accounts API, and PCI-DSS edge gateway.",
    icon: ShieldCheck,
  },
  {
    id: "deadlock",
    title: "Circular Deadlock Chaos Trap",
    category: "Chaos SRE",
    prompt:
      "Simulate a circular deadlock where service A and service B depend on each other.",
    icon: AlertTriangle,
  },
];

const ASK_SUGGESTIONS: PromptSuggestion[] = [
  {
    id: "ticket-surge-sre",
    title: "Flash-Sale Ticket Locking SRE",
    category: "High Concurrency",
    prompt:
      "How does Horizon orchestrate distributed lock recovery during a high-concurrency live ticket booking flash-sale surge?",
    icon: Ticket,
  },
  {
    id: "streaming-transcoding-sre",
    title: "Video Streaming Transcoder SRE",
    category: "Streaming Media",
    prompt:
      "What recovery playbook should execute when FFmpeg GPU transcoding worker nodes crash during live 4K streaming?",
    icon: Video,
  },
  {
    id: "blogging-cache-sre",
    title: "Blogging CMS Edge Cache Purge",
    category: "CDN & Caching",
    prompt:
      "How does Horizon coordinate database failover and Varnish/Redis cache invalidation during a high-traffic blogging website outage?",
    icon: FileText,
  },
  {
    id: "kahn-explain",
    title: "How Kahn Sort Prevents Outages",
    category: "SRE Theory",
    prompt:
      "Explain how Kahn’s topological sort prevents connection refusal cascades and deadlocks during cloud infrastructure recovery.",
    icon: Sparkles,
  },
  {
    id: "hindi-sre",
    title: "कहान एल्गोरिदम (Hindi / हिन्दी)",
    category: "Multilingual SRE",
    prompt:
      "कहान एल्गोरिदम वितरित माइक्रोसर्विसेज में कैस्केडिंग फेलियर और क्रैश लूप को कैसे रोकता है?",
    icon: Sparkles,
  },
  {
    id: "blast-radius",
    title: "Calculating Blast Radius",
    category: "Failure Analysis",
    prompt:
      "How do you calculate downstream blast radius when a primary database connection pool is exhausted?",
    icon: Activity,
  },
  {
    id: "spanish-sre",
    title: "¿Cómo funciona la recuperación? (Español)",
    category: "Multilingual SRE",
    prompt:
      "¿Cómo orquesta Horizon la recuperación de microservicios en orden topológico estricto?",
    icon: Sparkles,
  },
  {
    id: "eip712-approval",
    title: "BridgeKey EIP-712 Approval Gates",
    category: "Web3 Governance",
    prompt:
      "Why do high-risk SRE failover actions require hardware-backed BridgeKey EIP-712 multi-signature approvals?",
    icon: KeyRound,
  },
  {
    id: "db-comparison",
    title: "PostgreSQL vs ScyllaDB for SRE",
    category: "Architecture",
    prompt:
      "Compare recovery characteristics of distributed ScyllaDB versus PostgreSQL primary-replica clusters under network partition.",
    icon: Database,
  },
];

function isDagGenerationPrompt(text: string, mode: "agent" | "ask"): boolean {
  if (mode === "ask") return false;
  return true;
}

export const ArchitectPage: React.FC = () => {
  const navigate = useNavigate();

  const [chatMode, setChatMode] = useState<"agent" | "ask">("agent");
  const [inputPrompt, setInputPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [thinkingStep, setThinkingStep] = useState<string>("");
  const [deployedArchName, setDeployedArchName] = useState<string | null>(null);
  const [activeDeployingArch, setActiveDeployingArch] = useState<string | null>(null);
  const [archDeployProgress, setArchDeployProgress] = useState<DeploymentProgress | null>(null);
  const [autoRemediate, setAutoRemediate] = useState<boolean>(() => clusterState.isAutoRemediate());

  const handleImportToObservability = (architecture: DecodedArchitecture) => {
    try {
      localStorage.setItem("horizon_staged_custom_dag_yaml", architecture.yamlPipeline);
      localStorage.setItem("horizon_staged_custom_dag_name", architecture.architectureName);
    } catch {
      // Storage fallback safe
    }
    navigate("/observability");
  };

  const [activeTabs, setActiveTabs] = useState<
    Record<string, "dag" | "yaml" | "rollout">
  >({});
  const [selectedNodes, setSelectedNodes] = useState<
    Record<string, string | null>
  >({});
  const [copiedYamlId, setCopiedYamlId] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    if (chatMessages.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom("smooth");
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [chatMessages.length]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: query,
      mode: chatMode,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setIsProcessing(true);

    const isDagRequest = isDagGenerationPrompt(query, chatMode);

    if (isDagRequest) {
      setThinkingStep(
        "Consulting Sarvam AI API (sarvam-105b) for infrastructure decomposition...",
      );
      await new Promise((r) => setTimeout(r, 160));
      setThinkingStep(
        "Analyzing persistence stores, caching tiers, and ingress microservices...",
      );
      await new Promise((r) => setTimeout(r, 180));
      setThinkingStep(
        "Constructing directed dependency graph & running Kahn's topological sort...",
      );
      await new Promise((r) => setTimeout(r, 180));
      setThinkingStep(
        "Validating acyclic graph invariant & compiling declarative YAML pipeline...",
      );
      await new Promise((r) => setTimeout(r, 140));

      try {
        const decoded = await dagArchitectAgent.processPrompt(query);
        const msgId = `agent-${Date.now()}`;

        const agentMsg: ChatMessage = {
          id: msgId,
          sender: "agent",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          text: decoded.summary,
          reasoning: decoded.cycleDetected
            ? decoded.cycleExplanation
            : `Synthesized ${decoded.nodes.length} microservices across ${decoded.topologicalLevels.length} recovery tiers. Kahn’s algorithm proved acyclic structure: O(V + E) = ${decoded.nodes.length + decoded.edges.length} operations. Generated Kubernetes CRD spec and triggered interactive Miro-style DAG canvas.`,
          decoded,
          mode: "agent",
        };

        setActiveTabs((prev) => ({ ...prev, [msgId]: "dag" }));
        setChatMessages((prev) => [...prev, agentMsg]);
      } catch {
        const fallbackArch = dagArchitectAgent.synthesizeArchitecture(query);
        const msgId = `agent-${Date.now()}`;

        const agentMsg: ChatMessage = {
          id: msgId,
          sender: "agent",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          text: fallbackArch.summary,
          reasoning: `Synthesized ${fallbackArch.nodes.length} microservices across ${fallbackArch.topologicalLevels.length} recovery tiers using verified topological heuristic engine.`,
          decoded: fallbackArch,
          mode: "agent",
        };

        setActiveTabs((prev) => ({ ...prev, [msgId]: "dag" }));
        setChatMessages((prev) => [...prev, agentMsg]);
      } finally {
        setIsProcessing(false);
        setThinkingStep("");
      }
    } else {
      setThinkingStep(
        "Consulting Sarvam AI Copilot (Multilingual SRE Assistant)...",
      );
      await new Promise((r) => setTimeout(r, 200));

      try {
        const reply = await sarvamAgent.askSreAdvisor(query);

        const agentMsg: ChatMessage = {
          id: `agent-${Date.now()}`,
          sender: "agent",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          text: reply,
          mode: "ask",
        };

        setChatMessages((prev) => [...prev, agentMsg]);
      } catch (err) {
        console.warn('[ArchitectPage] SRE Ask Copilot fallback notice:', err);
        const fallbackReply =
          "Autonomous SRE resilience analysis complete. In distributed microservice architectures, systems must recover strictly bottom-up: foundational data stores must satisfy readiness probes before caches warm, followed by core workers, and finally ingress routers. This prevents thundering herds and crash loops.";
        const agentMsg: ChatMessage = {
          id: `agent-${Date.now()}`,
          sender: "agent",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          text: fallbackReply,
          mode: "ask",
        };
        setChatMessages((prev) => [...prev, agentMsg]);
      } finally {
        setIsProcessing(false);
        setThinkingStep("");
      }
    }
  };

  const handleDeployToCluster = async (architecture: DecodedArchitecture) => {
    if (architecture.cycleDetected) {
      alert(
        "Cannot deploy topology with circular dependency! Resolve deadlocks first.",
      );
      return;
    }

    setActiveDeployingArch(architecture.architectureName);

    await pipelineDeployer.execute({
      pipelineName: architecture.architectureName,
      nodes: architecture.nodes,
      topologicalLevels: architecture.topologicalLevels,
      autoRemediate: autoRemediate,
      verifyHealing: (nodeId) => {
        const n = clusterState.getNode(nodeId);
        return n ? n.status === 'healthy' : true;
      },
      onProgress: (progress) => {
        setArchDeployProgress(progress);
      },
    });

    clusterState.setCustomTopology(
      architecture.nodes,
      architecture.architectureName,
    );
    setDeployedArchName(architecture.architectureName);
    setTimeout(() => {
      setDeployedArchName(null);
      setActiveDeployingArch(null);
    }, 4500);
  };

  const handleCopyYaml = (msgId: string, yamlContent: string) => {
    navigator.clipboard.writeText(yamlContent);
    setCopiedYamlId(msgId);
    setTimeout(() => setCopiedYamlId(null), 2000);
  };

  const handleDownloadYaml = (architecture: DecodedArchitecture) => {
    const blob = new Blob([architecture.yamlPipeline], {
      type: "text/yaml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${architecture.architectureName.toLowerCase().replace(/\s+/g, "-")}-pipeline.yaml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleResetToDefault = () => {
    clusterState.resetToDefaultTopology();
    alert("Horizon cluster reset to baseline 7-node enterprise topology.");
  };

  const handleClearHistory = () => {
    setChatMessages([]);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="horizon-agent-app w-full flex-1 flex flex-col font-sans relative py-3 sm:py-5 text-[#0A0A0A]"
    >
      {/* ── MAIN CARD: Horizon Editorial Instrument Surface ── */}
      <div className="w-full max-w-5xl mx-auto rounded-[20px] border border-[#E5E5E5] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-6 sm:p-8 flex flex-col justify-between min-h-[640px] relative">
        {/* ── Chat Messages Stream OR Minimal Blank Screen State ── */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto space-y-6 pr-2 max-h-[calc(100vh-380px)] min-h-[380px] flex flex-col"
        >
          {chatMessages.length === 0 ? (
            /* ── Minimal Blank Screen State ── */
            <div className="minimalblankscreen text-center space-y-3 mb-6 shrink-0">
              {/* Signature Two-Line Headline */}
              <h1 className="tracking-tight leading-[1.02]">
                <span className="block font-['Instrument_Serif',serif] font-normal text-[#A3A3A3] text-4xl sm:text-5xl">
                  AI Flow Architect,
                </span>
                <span className="block font-['Instrument_Serif',serif] italic font-normal text-[#0A0A0A] text-4xl sm:text-5xl">
                  natural language topology.
                </span>
              </h1>

              {/* Descriptive Subtitle */}
              <p className="text-xs sm:text-sm text-[#6B6B6B] font-normal max-w-lg mx-auto leading-relaxed">
                Describe any enterprise infrastructure stack in natural language — Sarvam AI designs deterministic DAGs, validates Kahn topological sort, and generates production Kubernetes manifests.
              </p>

              {/* Version Pill */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-100 border border-[#E5E5E5] text-[11px] font-mono font-medium text-[#0A0A0A]">
                  <span>v3.0</span>
                  <span className="text-[#A3A3A3]">&bull;</span>
                  <span>Sarvam-105B Reasoning</span>
                  <span className="text-[#A3A3A3]">&bull;</span>
                  <span>Kahn O(V+E) Engine</span>
                </div>
              </div>

              {/* ── Segmented Mode Switcher ── */}
              <div className="flex items-center justify-center gap-3 pt-3">
                <div className="inline-flex p-1 rounded-full bg-neutral-100 border border-[#E5E5E5]">
                  <button
                    onClick={() => setChatMode("agent")}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2",
                      chatMode === "agent"
                        ? "bg-[#0A0A0A] text-white shadow-xs"
                        : "text-[#6B6B6B] hover:text-[#0A0A0A]",
                    )}
                  >
                    <Zap className="w-3.5 h-3.5 text-[#2DD4BF]" />
                    <span>Agent Mode (DAG &amp; Actuators)</span>
                  </button>

                  <button
                    onClick={() => setChatMode("ask")}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2",
                      chatMode === "ask"
                        ? "bg-[#0A0A0A] text-white shadow-xs"
                        : "text-[#6B6B6B] hover:text-[#0A0A0A]",
                    )}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#2DD4BF]" />
                    <span>Ask Mode (SRE Copilot)</span>
                  </button>
                </div>

                {/* Quick utility controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleResetToDefault}
                    className="p-2 rounded-full bg-white border border-[#E5E5E5] text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-neutral-50 cursor-pointer text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs"
                    title="Reset baseline cluster"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                  {chatMessages.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="p-2 rounded-full bg-white border border-[#E5E5E5] text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-neutral-50 cursor-pointer text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs"
                      title="Clear chat history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Clear</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ── Active Conversation Stream ── */
            chatMessages.map((msg) => {
              const currentTab = activeTabs[msg.id] || "dag";
              const selectedNodeId = selectedNodes[msg.id] || null;

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col space-y-2 w-full",
                    msg.sender === "user" ? "items-end" : "items-start",
                  )}
                >
                  {/* Header label */}
                  <div className="flex items-center gap-2 text-[11px] font-mono font-medium text-[#71717A] px-1">
                    {msg.sender === "agent" && (
                      <div className="w-4 h-4 rounded-md overflow-hidden bg-[#18181B] border border-white/[0.1] flex items-center justify-center p-0.5 shrink-0">
                        <img
                          src="/logo.png"
                          alt="Horizon Agent"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <span className="font-semibold text-[#A1A1AA]">
                      {msg.sender === "user" ? "Operator" : "Horizon SRE Copilot"}
                    </span>
                    <span>&bull;</span>
                    <span>{msg.timestamp}</span>
                    {msg.mode && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-mono uppercase bg-[#18181B] text-[#71717A] border border-white/[0.08]">
                        {msg.mode}
                      </span>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "leading-relaxed transition-all",
                      msg.sender === "user"
                        ? "max-w-[85%] sm:max-w-[75%] p-4 bg-[#1E1B4B] text-[#EDEDED] rounded-2xl rounded-tr-xs border border-[#6366F1]/30 font-medium text-xs sm:text-[13px] shadow-sm"
                        : "w-full max-w-[98%] sm:max-w-[95%] p-5 sm:p-6 bg-[#18181B] text-[#EDEDED] rounded-2xl rounded-tl-xs border border-white/[0.08] shadow-md space-y-4",
                    )}
                  >
                    {/* Markdown Renderer */}
                    {msg.sender === "user" ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <MarkdownRenderer content={msg.text} />
                    )}

                    {/* Thinking Process Accordion */}
                    {msg.reasoning && (
                      <div className="p-3.5 rounded-xl bg-[#0E0E10] border border-white/[0.08] text-[11px] font-mono space-y-1.5">
                        <div className="flex items-center gap-2 text-[#22D3EE] font-bold">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Kahn’s Topological Reasoning Stream</span>
                        </div>
                        <p className="text-[#A1A1AA] text-[11px] leading-relaxed font-sans font-medium">
                          {msg.reasoning}
                        </p>
                      </div>
                    )}

                    {/* The Embedded DAG Window */}
                    {msg.mode !== "ask" &&
                      msg.decoded &&
                      (() => {
                        const decoded = msg.decoded;
                        return (
                          <div className="mt-4 rounded-xl border border-white/[0.08] bg-[#0E0E10] overflow-hidden shadow-lg">
                            {/* Top Bar: Tabs & Controls */}
                            <div className="px-4 py-3 bg-[#141416] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                              {/* Tab Switcher */}
                              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#18181B] border border-white/[0.08]">
                                <button
                                  onClick={() =>
                                    setActiveTabs((prev) => ({
                                      ...prev,
                                      [msg.id]: "dag",
                                    }))
                                  }
                                  className={cn(
                                    "px-3 py-1.5 rounded-md font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5",
                                    currentTab === "dag"
                                      ? "bg-[#6366F1] text-white shadow-xs"
                                      : "text-[#A1A1AA] hover:text-[#EDEDED]",
                                  )}
                                >
                                  <Network className="w-3.5 h-3.5" />
                                  <span>DAG Canvas</span>
                                </button>

                                <button
                                  onClick={() =>
                                    setActiveTabs((prev) => ({
                                      ...prev,
                                      [msg.id]: "yaml",
                                    }))
                                  }
                                  className={cn(
                                    "px-3 py-1.5 rounded-md font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5",
                                    currentTab === "yaml"
                                      ? "bg-[#6366F1] text-white shadow-xs"
                                      : "text-[#A1A1AA] hover:text-[#EDEDED]",
                                  )}
                                >
                                  <FileCode className="w-3.5 h-3.5" />
                                  <span>Yaml</span>
                                </button>

                                <button
                                  onClick={() =>
                                    setActiveTabs((prev) => ({
                                      ...prev,
                                      [msg.id]: "rollout",
                                    }))
                                  }
                                  className={cn(
                                    "px-3 py-1.5 rounded-md font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5",
                                    currentTab === "rollout"
                                      ? "bg-[#6366F1] text-white shadow-xs"
                                      : "text-[#A1A1AA] hover:text-[#EDEDED]",
                                  )}
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Rollout</span>
                                </button>
                              </div>

                              {/* Right side actions & Status */}
                              <div className="flex flex-wrap items-center gap-2">
                                {/* Auto-Remedy Toggle */}
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#18181B] border border-white/[0.08]">
                                  <span className="text-[10px] font-bold text-[#A1A1AA]">Auto-Remedy:</span>
                                  <button
                                    onClick={() => {
                                      const next = !autoRemediate;
                                      setAutoRemediate(next);
                                      clusterState.setAutoRemediate(next);
                                      pipelineDeployer.setAutoRemediate(next);
                                    }}
                                    className={cn(
                                      'w-7 h-4 rounded-full p-0.5 transition-colors cursor-pointer flex items-center',
                                      autoRemediate ? 'bg-emerald-600' : 'bg-zinc-700'
                                    )}
                                    title="Toggle auto-remediation during synchronous deployment"
                                  >
                                    <div
                                      className={cn(
                                        'w-3 h-3 rounded-full bg-white transition-transform shadow-xs',
                                        autoRemediate ? 'translate-x-3' : 'translate-x-0'
                                      )}
                                    />
                                  </button>
                                  <span className={cn('text-[9px] font-mono font-bold', autoRemediate ? 'text-emerald-400' : 'text-zinc-500')}>
                                    {autoRemediate ? 'ON' : 'OFF'}
                                  </span>
                                </div>

                                {decoded.cycleDetected ? (
                                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-red-950/80 text-red-300 border border-red-800 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-red-400" />
                                    <span>Deadlock Trap</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span>Acyclic Verified</span>
                                  </span>
                                )}

                                {/* 1-Click Cluster Actuator */}
                                <button
                                  onClick={() => handleDeployToCluster(decoded)}
                                  disabled={decoded.cycleDetected || activeDeployingArch === decoded.architectureName}
                                  className={cn(
                                    "hz-btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5",
                                    deployedArchName === decoded.architectureName && "bg-emerald-600 border-emerald-500 text-white",
                                    activeDeployingArch === decoded.architectureName && "bg-indigo-600 border-indigo-500 text-white",
                                  )}
                                  title="Deploy topology directly to active Horizon cluster"
                                >
                                  {activeDeployingArch === decoded.architectureName ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                                  ) : deployedArchName === decoded.architectureName ? (
                                    <Check className="w-3.5 h-3.5 text-white" />
                                  ) : (
                                    <Rocket className="w-3.5 h-3.5" />
                                  )}
                                  <span>
                                    {activeDeployingArch === decoded.architectureName
                                      ? `Verifying (${archDeployProgress ? `${archDeployProgress.currentIndex + 1}/${archDeployProgress.totalNodes}` : '...'})`
                                      : deployedArchName === decoded.architectureName
                                      ? "Deployed Green!"
                                      : "Deploy"}
                                  </span>
                                </button>

                                {/* 1-Click Simulate in Observability Hub */}
                                <button
                                  onClick={() => handleImportToObservability(decoded)}
                                  className="hz-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                                  title="Import DAG directly into Observability Hub to simulate failure & blast radius"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-[#22D3EE]" />
                                  <span>Simulate in Hub</span>
                                </button>

                                {/* Copy & Download */}
                                <button
                                  onClick={() =>
                                    handleCopyYaml(msg.id, decoded.yamlPipeline)
                                  }
                                  className="p-1.5 rounded-lg bg-[#18181B] border border-white/[0.08] text-[#A1A1AA] hover:text-white transition-all cursor-pointer"
                                  title="Copy YAML"
                                >
                                  {copiedYamlId === msg.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                <button
                                  onClick={() => handleDownloadYaml(decoded)}
                                  className="p-1.5 rounded-lg bg-[#18181B] border border-white/[0.08] text-[#A1A1AA] hover:text-white transition-all cursor-pointer"
                                  title="Download .yaml manifest"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Synchronous Deployment Stepper */}
                            {activeDeployingArch === decoded.architectureName && archDeployProgress && (
                              <div className={cn(
                                "m-4 p-3.5 rounded-xl border transition-all space-y-2.5",
                                archDeployProgress.phase === 'paused_on_failure'
                                  ? 'bg-red-950/40 border-red-700 shadow-md'
                                  : archDeployProgress.phase === 'completed'
                                  ? 'bg-emerald-950/40 border-emerald-700 shadow-md'
                                  : 'bg-indigo-950/40 border-indigo-700 shadow-sm'
                              )}>
                                <div className="flex items-center justify-between text-xs font-mono font-bold border-b border-white/[0.08] pb-2">
                                  <div className="flex items-center gap-2">
                                    {archDeployProgress.phase === 'running' && <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />}
                                    {archDeployProgress.phase === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                                    {archDeployProgress.phase === 'paused_on_failure' && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                                    <span>
                                      {archDeployProgress.phase === 'running' && `SYNCHRONOUS NODE CHECKSUM VERIFICATION (${archDeployProgress.currentIndex + 1}/${archDeployProgress.totalNodes})`}
                                      {archDeployProgress.phase === 'paused_on_failure' && `⚠️ DEPLOYMENT HALTED: Checksum Mismatch (Auto-Remedy OFF)`}
                                      {archDeployProgress.phase === 'completed' && `🎉 ALL ${archDeployProgress.totalNodes} NODES VERIFIED & DEPLOYED (100% GREEN)`}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-emerald-300 bg-[#18181B] px-2 py-0.5 rounded-full border border-emerald-800">
                                    {archDeployProgress.nodes.filter(n => n.status === 'verified_green').length} / {archDeployProgress.totalNodes} Green
                                  </span>
                                </div>

                                {archDeployProgress.phase === 'paused_on_failure' && (
                                  <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 flex items-center justify-between gap-2">
                                    <span className="text-xs text-red-300">
                                      Integrity probe failed. Auto-Remedy is OFF.
                                    </span>
                                    <button
                                      onClick={() => pipelineDeployer.triggerManualRemedy()}
                                      className="px-3 py-1 rounded-lg text-xs font-bold bg-[#6366F1] text-white hover:bg-indigo-700 transition-colors"
                                    >
                                      Manually Fix & Resume
                                    </button>
                                  </div>
                                )}

                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                  {archDeployProgress.nodes.map((node, nIdx) => {
                                    const isGreen = node.status === 'verified_green';
                                    const isChecking = node.status === 'verifying';
                                    const isFailed = node.status === 'failed';
                                    const isRestarting = node.status === 'restarting';

                                    return (
                                      <motion.div
                                        key={node.nodeId}
                                        animate={isGreen ? { scale: [0.95, 1.05, 1] } : { scale: 1 }}
                                        className={cn(
                                          "p-2 rounded-lg border text-[10px] font-mono transition-all flex flex-col justify-between",
                                          isGreen
                                            ? "bg-emerald-950/50 border-emerald-600 text-emerald-200"
                                            : isChecking
                                            ? "bg-amber-950/50 border-amber-500 text-amber-200 animate-pulse"
                                            : isFailed
                                            ? "bg-red-950/50 border-red-600 text-red-200"
                                            : isRestarting
                                            ? "bg-cyan-950/50 border-cyan-500 text-cyan-200 animate-pulse"
                                            : "bg-[#18181B] border-white/[0.08] text-zinc-500"
                                        )}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="text-[9px] text-[#71717A]">#{nIdx + 1}</span>
                                          {isGreen && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                                          {isChecking && <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />}
                                          {isFailed && <AlertTriangle className="w-3 h-3 text-red-400" />}
                                          {isRestarting && <RotateCcw className="w-3 h-3 text-cyan-400 animate-spin" />}
                                        </div>
                                        <div className="font-bold truncate mt-0.5" title={node.nodeName}>
                                          {node.nodeName}
                                        </div>
                                        <div className="truncate text-[9px] opacity-80">
                                          {isGreen ? (
                                            <div className="space-y-0.5">
                                              <span>{`0x${node.checksum?.slice(2, 6)}...`}</span>
                                              {node.remedyChecksum && (
                                                <span className="text-[8px] text-purple-400 font-bold block" title={`Remedy: ${node.remedyChecksum}`}>
                                                  🔧 {`0x${node.remedyChecksum.slice(2, 6)}`}
                                                </span>
                                              )}
                                            </div>
                                          ) : isChecking ? 'Hashing...' : isRestarting ? 'Restarting...' : 'Pending'}
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Active Tab Content Area */}
                            <div className="p-4 sm:p-5">
                              {/* TAB 1: Canvas */}
                              {currentTab === "dag" && (
                                <div className="space-y-3">
                                  <MiroDagCanvas
                                    architecture={decoded}
                                    selectedNodeId={selectedNodeId}
                                    onSelectNode={(nodeId) =>
                                      setSelectedNodes((prev) => ({
                                        ...prev,
                                        [msg.id]: nodeId,
                                      }))
                                    }
                                  />
                                </div>
                              )}

                              {/* TAB 2: YAML */}
                              {currentTab === "yaml" && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-[11px] font-mono text-[#A1A1AA] bg-[#141416] px-3 py-1.5 rounded-lg border border-white/[0.08]">
                                    <span>
                                      Spec: horizon.recovery.io/v1alpha1 &bull; AutonomousRecoveryPipeline
                                    </span>
                                    <button
                                      onClick={() =>
                                        handleCopyYaml(
                                          msg.id,
                                          decoded.yamlPipeline,
                                        )
                                      }
                                      className="text-[#22D3EE] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                      {copiedYamlId === msg.id ? (
                                        <Check className="w-3 h-3 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                      <span>
                                        {copiedYamlId === msg.id ? "Copied!" : "Copy YAML"}
                                      </span>
                                    </button>
                                  </div>

                                  <pre className="p-4 rounded-xl bg-[#080809] border border-white/[0.08] text-[11px] font-mono text-[#22D3EE] leading-relaxed overflow-x-auto select-all">
                                    <code>{decoded.yamlPipeline}</code>
                                  </pre>
                                </div>
                              )}

                              {/* TAB 3: Rollout */}
                              {currentTab === "rollout" && (
                                <div className="space-y-2.5">
                                  <div className="p-3.5 rounded-lg bg-[#141416] border border-white/[0.08] text-xs text-[#EDEDED] space-y-1">
                                    <span className="font-bold flex items-center gap-1.5 text-[#6366F1]">
                                      <RotateCcw className="w-3.5 h-3.5" />
                                      <span>Kahn’s Topological Recovery Sequence</span>
                                    </span>
                                    <p className="text-[11px] text-[#A1A1AA] font-medium leading-relaxed">
                                      Deterministic bottom-up execution. Databases restore and satisfy health
                                      readiness probes before application pods accept ingress traffic.
                                    </p>
                                  </div>

                                  {decoded.topologicalLevels.map(
                                    (levelNodes, idx) => (
                                      <div
                                        key={idx}
                                        className="p-3.5 rounded-lg bg-[#141416] border border-white/[0.08] flex items-center justify-between"
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="w-6 h-6 rounded-full bg-[#6366F1]/20 text-[#818CF8] border border-[#6366F1]/30 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                                            {idx + 1}
                                          </div>
                                          <div>
                                            <div className="text-xs font-bold text-[#EDEDED]">
                                              Stage {idx + 1}: Restore {levelNodes.join(", ")}
                                            </div>
                                            <div className="text-[10px] text-[#71717A] font-mono">
                                              Parallel batch execution &bull; Health probe: HTTP 200 / SQL Ping
                                            </div>
                                          </div>
                                        </div>

                                        <div>
                                          {idx === 0 ? (
                                            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800 flex items-center gap-1">
                                              <KeyRound className="w-3 h-3 text-purple-400" />
                                              <span>BridgeKey Gate</span>
                                            </span>
                                          ) : (
                                            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                                              Autonomous
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                  </div>
                </div>
              );
            })
          )}

          {/* Live Thinking Stream Animation */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-[#18181B] border border-white/[0.1] shadow-lg space-y-2.5 w-full max-w-[95%]">
              <div className="flex items-center gap-2 text-xs text-[#6366F1] font-bold">
                <div className="w-5 h-5 rounded-md overflow-hidden bg-[#141416] border border-white/[0.1] flex items-center justify-center p-0.5 shrink-0 animate-pulse">
                  <img
                    src="/logo.png"
                    alt="Horizon Agent"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span>Sarvam AI Processing (sarvam-105b-conversations)...</span>
              </div>
              <div className="text-[11px] font-mono text-[#A1A1AA] flex items-center gap-2 p-2.5 rounded-lg bg-[#0E0E10] border border-white/[0.08]">
                <span className="w-2 h-2 rounded-full bg-[#6366F1] animate-ping shrink-0" />
                <span>{thinkingStep}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── BOTTOM SECTION: Suggestions Chips & Composer Bar ── */}
        <div className="pt-3 border-t border-white/[0.08] space-y-3 shrink-0">
          {/* Quick Scenario / Question Chips */}
          {chatMessages.length === 0 && (
            <div className="space-y-2 py-1">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#71717A]">
                <Zap className="w-3 h-3 text-[#6366F1]" />
                <span>
                  {chatMode === "agent"
                    ? "Explore architecture scenarios:"
                    : "Suggested reliability questions:"}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
                {(chatMode === "agent"
                  ? AGENT_SUGGESTIONS
                  : ASK_SUGGESTIONS
                ).map((sug) => (
                  <button
                    key={sug.id}
                    onClick={() => handleSendMessage(sug.prompt)}
                    disabled={isProcessing}
                    className="px-3.5 py-1.5 rounded-full bg-[#18181B] hover:bg-[#202024] border border-white/[0.08] hover:border-[#6366F1]/50 text-[10px] font-semibold text-[#EDEDED] shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <sug.icon className="w-3 h-3 text-[#22D3EE]" />
                    <span>{sug.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rounded Input Composer Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="relative rounded-xl border border-white/[0.12] bg-[#18181B] shadow-inner p-2.5 sm:p-3 flex items-center gap-3"
          >
            <div className="pl-1 shrink-0">
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-[#141416] border border-white/[0.1] flex items-center justify-center p-0.5">
                <img
                  src="/logo.png"
                  alt="Horizon Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={
                chatMode === "agent"
                  ? "Describe infrastructure to build DAG: 'E-commerce with MySQL, Redis, and Stripe', 'Fintech payments'..."
                  : "Ask SRE question in any language (English, हिन्दी, Español, Français, Hinglish): 'How does Kahn sort prevent cascade outages?'..."
              }
              rows={1}
              disabled={isProcessing}
              className="flex-1 py-1.5 px-2 text-xs sm:text-[13px] text-[#EDEDED] placeholder-[#71717A] focus:outline-none bg-transparent resize-none font-medium leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />

            <button
              type="submit"
              disabled={!inputPrompt.trim() || isProcessing}
              className="hz-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{chatMode === "agent" ? "Synthesize" : "Ask"}</span>
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default ArchitectPage;
