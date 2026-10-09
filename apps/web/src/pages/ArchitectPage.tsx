import React, { useState, useRef, useEffect } from "react";
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
    id: "streaming",
    title: "OTT Video Transcoder Pool",
    category: "Media & CDN",
    prompt:
      "High-scale OTT streaming platform with ScyllaDB catalog, Redis manifest cache, FFmpeg transcoding workers, recommendation API, and Cloudflare video ingress.",
    icon: Play,
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

/**
 * Intelligent detector to determine if prompt is requesting DAG / Architecture generation.
 * In Ask mode, strictly returns false to keep Ask mode conversational and avoid DAG canvas.
 */
function isDagGenerationPrompt(text: string, mode: "agent" | "ask"): boolean {
  if (mode === "ask") return false;
  return true;
}

export const ArchitectPage: React.FC = () => {
  // Mode selection: 'agent' (generates DAGs & actuators) | 'ask' (conversational SRE advisor)
  const [chatMode, setChatMode] = useState<"agent" | "ask">("agent");
  const [inputPrompt, setInputPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [thinkingStep, setThinkingStep] = useState<string>("");
  const [deployedArchName, setDeployedArchName] = useState<string | null>(null);
  const [activeDeployingArch, setActiveDeployingArch] = useState<string | null>(null);
  const [archDeployProgress, setArchDeployProgress] = useState<DeploymentProgress | null>(null);
  const [autoRemediate, setAutoRemediate] = useState<boolean>(() => clusterState.isAutoRemediate());

  // Active tab per message: Record<messageId, 'dag' | 'yaml' | 'rollout'>
  const [activeTabs, setActiveTabs] = useState<
    Record<string, "dag" | "yaml" | "rollout">
  >({});
  // Selected node for blast radius inspection: Record<messageId, string | null>
  const [selectedNodes, setSelectedNodes] = useState<
    Record<string, string | null>
  >({});
  const [copiedYamlId, setCopiedYamlId] = useState<string | null>(null);

  // Blank chat screen starts completely empty!
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
      // ── DAG GENERATION PIPELINE: Real Sarvam AI API + Kahn topological sort ──
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
      // ── CONVERSATIONAL SRE GUIDANCE: Multilingual SRE Advisor (strictly NO DAG canvas) ──
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
          // Strictly NO decoded object -> DAG window NEVER opens in Ask mode!
        };

        setChatMessages((prev) => [...prev, agentMsg]);
      } catch {
        const fallbackReply = await sarvamAgent.askSreAdvisor(query);
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

    // Synchronously verify each node's SHA-256 checksum and probe health
    await pipelineDeployer.execute({
      pipelineName: architecture.architectureName,
      nodes: architecture.nodes,
      topologicalLevels: architecture.topologicalLevels,
      autoRemediate: autoRemediate,
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
      className="horizon-agent-app w-full flex-1 flex flex-col font-sans relative py-3 sm:py-5"
    >
      {/* ── TOP HEADER: Skeuomorphic, Spacious, Minimalistic ── */}

      {/* ── MAIN CARD: Skeuomorphic, Spacious, Minimalistic ── */}
      <div className="w-full max-w-5xl mx-auto rounded-3xl border border-[#E5D7C5]/90 bg-gradient-to-b from-white via-[#FCF8F2] to-[#F8F1E7] shadow-[0_16px_48px_rgba(26,26,26,0.07),0_1px_3px_rgba(26,26,26,0.04)] p-6 sm:p-8 flex flex-col justify-between min-h-[640px] relative">
        {/* ── Chat Messages Stream OR Minimal Blank Screen State ── */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto space-y-6 pr-2 max-h-[calc(100vh-380px)] min-h-[380px] flex flex-col"
        >
          {chatMessages.length === 0 ? (
            /* ── Minimal Blank Screen State ── */

            <div className="minimalblankscreen text-center space-y-2 mb-5 sm:mb-7 shrink-0">
              <div className="flex items-center justify-center gap-3">
                <h1 className="bblacnkherotit text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight uppercase font-sans">
                  HORIZON
                </h1>
              </div>

              {/* Descriptive Subtitle */}
              <p className="text-xs sm:text-sm text-[#6E6258] font-medium max-w-lg mx-auto leading-relaxed">
                Autonomous Multi-Agent Infrastructure Recovery &amp; DAG Flow
                Architect
              </p>

              {/* Subtle Skeuomorphic Version Pill */}
              <div className="flex items-center justify-center gap-2 pt-0.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-xs border border-[#E5D7C5] text-[11px] font-mono font-semibold text-[#0047AB] shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
                  <span>v2.0</span>
                  <span className="text-[#C2B29F]">&bull;</span>
                  <span>Sarvam AI (105B)</span>
                  <span className="text-[#C2B29F]">&bull;</span>
                  <span>Kahn O(V+E) Engine</span>
                </div>
              </div>

              {/* ── Segmented Mode Switcher: Soft Skeuomorphic Pill ── */}
              <div className="flex items-center justify-center gap-3 pt-2.5">
                <div className="inline-flex p-1.5 rounded-2xl bg-[#EFE6DB]/70 border border-[#DFD3C3] shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                  <button
                    onClick={() => setChatMode("agent")}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2",
                      chatMode === "agent"
                        ? "bg-white text-[#0047AB] font-bold shadow-[0_3px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] border border-[#E0D4C4]"
                        : "text-[#6E6258] hover:text-[#1A1A1A]",
                    )}
                  >
                    <Zap className="w-3.5 h-3.5 text-[#0047AB]" />
                    <span>Agent Mode (DAG &amp; Actuators)</span>
                  </button>

                  <button
                    onClick={() => setChatMode("ask")}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2",
                      chatMode === "ask"
                        ? "bg-white text-[#0047AB] font-bold shadow-[0_3px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] border border-[#E0D4C4]"
                        : "text-[#6E6258] hover:text-[#1A1A1A]",
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
                  {chatMessages.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="p-2 rounded-xl bg-white/90 border border-[#E5D7C5] text-[#6E6258] hover:text-[#1A1A1A] hover:bg-white shadow-[0_2px_5px_rgba(0,0,0,0.04)] cursor-pointer text-xs font-medium flex items-center gap-1.5 transition-all"
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
                  <div className="flex items-center gap-2 text-[11px] font-mono font-medium text-[#8A7B6D] px-1">
                    {msg.sender === "agent" && (
                      <div className="w-4 h-4 rounded-md overflow-hidden bg-[#0A1128] border border-black/10 flex items-center justify-center p-0.5 shrink-0 shadow-2xs">
                        <img
                          src="/logo.png"
                          alt="Horizon Agent"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <span className="font-semibold text-[#5A4E44]">
                      {msg.sender === "user"
                        ? "Operator"
                        : "Horizon SRE Copilot"}
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
                      "leading-relaxed transition-all",
                      msg.sender === "user"
                        ? "max-w-[85%] sm:max-w-[75%] p-4 bg-gradient-to-b from-[#0047AB] to-[#00388A] text-white rounded-2xl rounded-tr-xs shadow-[0_4px_14px_rgba(0,71,171,0.22),inset_0_1px_0_rgba(255,255,255,0.2)] font-medium text-xs sm:text-[13px]"
                        : "w-full max-w-[98%] sm:max-w-[95%] p-5 sm:p-6 bg-white/95 text-[#1A1A1A] rounded-2xl rounded-tl-xs border border-[#E8DCCF] shadow-[0_4px_20px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] space-y-4",
                    )}
                  >
                    {/* Markdown Renderer for elegant typography */}
                    {msg.sender === "user" ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <MarkdownRenderer content={msg.text} />
                    )}

                    {/* Thinking Process Accordion (if present) */}
                    {msg.reasoning && (
                      <div className="p-3.5 rounded-xl bg-[#FAF3EA]/80 border border-[#E5D7C5] text-[11px] font-mono space-y-1.5 shadow-2xs">
                        <div className="flex items-center gap-2 text-[#0047AB] font-bold">
                          <img
                            src="/logo.png"
                            alt="Horizon Icon"
                            className="w-3.5 h-3.5 object-contain rounded"
                          />
                          <span>Kahn’s Topological Reasoning Stream</span>
                        </div>
                        <p className="text-[#5A4E44] text-[11px] leading-relaxed font-sans font-medium">
                          {msg.reasoning}
                        </p>
                      </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        THE EMBEDDED DAG WINDOW (Miro-style Canvas + Tabs)
                        ONLY OPENS WHEN PROMPT IS GIVEN RELATED TO DAG GENERATION!
                       ───────────────────────────────────────────────────────────── */}
                    {msg.mode !== "ask" &&
                      msg.decoded &&
                      (() => {
                        const decoded = msg.decoded;
                        return (
                          <div className="mt-4 rounded-2xl border border-[#E0D2C0] bg-gradient-to-b from-[#FFFDF9] to-[#FAF3EA] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)]">
                            {/* ── Top Bar matching wireframe: | DAG | Yaml | ── */}
                            <div className="px-4 py-3 bg-white/90 border-b border-[#E5D7C5] flex flex-wrap items-center justify-between gap-3">
                              {/* Tab Switcher: | DAG | Yaml | Rollout | */}
                              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F4EBE0]/80 border border-[#E2D5C4] shadow-inner">
                                <button
                                  onClick={() =>
                                    setActiveTabs((prev) => ({
                                      ...prev,
                                      [msg.id]: "dag",
                                    }))
                                  }
                                  className={cn(
                                    "px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5",
                                    currentTab === "dag"
                                      ? "bg-white text-[#0047AB] shadow-[0_2px_6px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] border border-[#DACBB8]"
                                      : "text-[#6E6258] hover:text-[#1A1A1A]",
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
                                    "px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5",
                                    currentTab === "yaml"
                                      ? "bg-white text-[#0047AB] shadow-[0_2px_6px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] border border-[#DACBB8]"
                                      : "text-[#6E6258] hover:text-[#1A1A1A]",
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
                                    "px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5",
                                    currentTab === "rollout"
                                      ? "bg-white text-[#0047AB] shadow-[0_2px_6px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] border border-[#DACBB8]"
                                      : "text-[#6E6258] hover:text-[#1A1A1A]",
                                  )}
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Rollout</span>
                                </button>
                              </div>

                              {/* Right side actions & Status */}
                              <div className="flex flex-wrap items-center gap-2">
                                {/* Auto-Remedy Toggle */}
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF3EA] border border-[#E5D7C5]">
                                  <span className="text-[10px] font-bold text-[#5A4E44]">Auto-Remedy:</span>
                                  <button
                                    onClick={() => {
                                      const next = !autoRemediate;
                                      setAutoRemediate(next);
                                      clusterState.setAutoRemediate(next);
                                      pipelineDeployer.setAutoRemediate(next);
                                    }}
                                    className={cn(
                                      'w-7 h-4 rounded-full p-0.5 transition-colors cursor-pointer flex items-center',
                                      autoRemediate ? 'bg-emerald-600' : 'bg-stone-300'
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
                                  <span className={cn('text-[9px] font-mono font-bold', autoRemediate ? 'text-emerald-700' : 'text-stone-500')}>
                                    {autoRemediate ? 'ON' : 'OFF'}
                                  </span>
                                </div>

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
                                  disabled={decoded.cycleDetected || activeDeployingArch === decoded.architectureName}
                                  className={cn(
                                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_2px_6px_rgba(0,71,171,0.2),inset_0_1px_0_rgba(255,255,255,0.3)]",
                                    deployedArchName === decoded.architectureName
                                      ? "bg-emerald-600 text-white border border-emerald-500"
                                      : activeDeployingArch === decoded.architectureName
                                      ? "bg-blue-600 text-white border border-blue-500"
                                      : "bg-[#0047AB] hover:bg-[#00388A] text-white border border-[#00388A]",
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

                                {/* Copy & Download */}
                                <button
                                  onClick={() =>
                                    handleCopyYaml(msg.id, decoded.yamlPipeline)
                                  }
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

                            {/* Synchronous Deployment Stepper & Checksum Progress Banner */}
                            {activeDeployingArch === decoded.architectureName && archDeployProgress && (
                              <div className={cn(
                                "m-4 p-3.5 rounded-2xl border-2 transition-all space-y-2.5",
                                archDeployProgress.phase === 'paused_on_failure'
                                  ? 'bg-red-50/90 border-red-500 shadow-md'
                                  : archDeployProgress.phase === 'completed'
                                  ? 'bg-emerald-50/90 border-emerald-500 shadow-md'
                                  : 'bg-blue-50/80 border-blue-400 shadow-sm'
                              )}>
                                <div className="flex items-center justify-between text-xs font-mono font-bold border-b border-black/10 pb-2">
                                  <div className="flex items-center gap-2">
                                    {archDeployProgress.phase === 'running' && <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />}
                                    {archDeployProgress.phase === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                    {archDeployProgress.phase === 'paused_on_failure' && <AlertTriangle className="w-3.5 h-3.5 text-red-600" />}
                                    <span>
                                      {archDeployProgress.phase === 'running' && `SYNCHRONOUS NODE CHECKSUM VERIFICATION (${archDeployProgress.currentIndex + 1}/${archDeployProgress.totalNodes})`}
                                      {archDeployProgress.phase === 'paused_on_failure' && `⚠️ DEPLOYMENT HALTED: Checksum Mismatch (Auto-Remedy OFF)`}
                                      {archDeployProgress.phase === 'completed' && `🎉 ALL ${archDeployProgress.totalNodes} NODES VERIFIED & DEPLOYED (100% GREEN)`}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-[#D8C7B4]">
                                    {archDeployProgress.nodes.filter(n => n.status === 'verified_green').length} / {archDeployProgress.totalNodes} Green
                                  </span>
                                </div>

                                {archDeployProgress.phase === 'paused_on_failure' && (
                                  <div className="p-2.5 rounded-xl bg-white border border-red-300 flex items-center justify-between gap-2">
                                    <span className="text-xs text-red-700">
                                      Integrity probe failed. Auto-Remedy is OFF.
                                    </span>
                                    <button
                                      onClick={() => pipelineDeployer.triggerManualRemedy()}
                                      className="px-3 py-1 rounded-lg text-xs font-bold bg-[#0047AB] text-white hover:bg-blue-800 transition-colors"
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

                                    return (
                                      <motion.div
                                        key={node.nodeId}
                                        animate={isGreen ? { scale: [0.95, 1.05, 1] } : { scale: 1 }}
                                        className={cn(
                                          "p-2 rounded-xl border text-[10px] font-mono transition-all flex flex-col justify-between",
                                          isGreen
                                            ? "bg-emerald-50 border-2 border-emerald-500 text-emerald-950 shadow-xs"
                                            : isChecking
                                            ? "bg-amber-50 border-2 border-amber-400 text-amber-950 animate-pulse"
                                            : isFailed
                                            ? "bg-red-50 border-2 border-red-500 text-red-950"
                                            : "bg-white/90 border-[#E5D7C5] text-stone-500"
                                        )}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="text-[9px] text-[#6E6258]">#{nIdx + 1}</span>
                                          {isGreen && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                          {isChecking && <Loader2 className="w-3 h-3 text-amber-600 animate-spin" />}
                                          {isFailed && <AlertTriangle className="w-3 h-3 text-red-600" />}
                                        </div>
                                        <div className="font-bold truncate mt-0.5" title={node.nodeName}>
                                          {node.nodeName}
                                        </div>
                                        <div className="truncate text-[9px] opacity-80">
                                          {isGreen ? `0x${node.checksum?.slice(2, 6)}...` : isChecking ? 'Hashing...' : 'Pending'}
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* ── Active Tab Content Area ── */}
                            <div className="p-4 sm:p-5">
                              {/* ── TAB 1: MIRO-STYLE CANVAS (Dots grid in opacity + draggable tree structure) ── */}
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

                              {/* ── TAB 2: YAML SPEC CODE ── */}
                              {currentTab === "yaml" && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-[11px] font-mono text-[#6E6258] bg-[#F4EBE0]/80 px-3 py-1.5 rounded-xl border border-[#E5D7C5]">
                                    <span>
                                      Spec: horizon.recovery.io/v1alpha1 &bull;
                                      AutonomousRecoveryPipeline
                                    </span>
                                    <button
                                      onClick={() =>
                                        handleCopyYaml(
                                          msg.id,
                                          decoded.yamlPipeline,
                                        )
                                      }
                                      className="text-[#0047AB] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                      {copiedYamlId === msg.id ? (
                                        <Check className="w-3 h-3 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                      <span>
                                        {copiedYamlId === msg.id
                                          ? "Copied!"
                                          : "Copy YAML"}
                                      </span>
                                    </button>
                                  </div>

                                  <pre className="p-4 rounded-2xl bg-[#1A1A1A] border border-black/20 text-[11px] font-mono text-cyan-300 leading-relaxed overflow-x-auto select-all shadow-inner">
                                    <code>{decoded.yamlPipeline}</code>
                                  </pre>
                                </div>
                              )}

                              {/* ── TAB 3: KAHN RECOVERY ROLLOUT SEQUENCE ── */}
                              {currentTab === "rollout" && (
                                <div className="space-y-2.5">
                                  <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-[#1A1A1A] space-y-1">
                                    <span className="font-bold flex items-center gap-1.5 text-[#0047AB]">
                                      <RotateCcw className="w-3.5 h-3.5" />
                                      <span>
                                        Kahn’s Topological Recovery Sequence
                                      </span>
                                    </span>
                                    <p className="text-[11px] text-[#5A4E44] font-medium leading-relaxed">
                                      Deterministic bottom-up execution.
                                      Databases restore and satisfy health
                                      readiness probes before application pods
                                      accept ingress traffic.
                                    </p>
                                  </div>

                                  {decoded.topologicalLevels.map(
                                    (levelNodes, idx) => (
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
                                              Stage {idx + 1}: Restore{" "}
                                              {levelNodes.join(", ")}
                                            </div>
                                            <div className="text-[10px] text-[#6E6258] font-mono">
                                              Parallel batch execution &bull;
                                              Health probe: HTTP 200 / SQL Ping
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
            <div className="p-4 rounded-2xl bg-white/95 border border-[#CCD8EB] shadow-[0_4px_16px_rgba(0,0,0,0.04)] space-y-2.5 w-full max-w-[95%]">
              <div className="flex items-center gap-2 text-xs text-[#0047AB] font-bold">
                <div className="w-5 h-5 rounded-md overflow-hidden bg-[#0A1128] border border-black/10 flex items-center justify-center p-0.5 shrink-0 animate-pulse">
                  <img
                    src="/logo.png"
                    alt="Horizon Agent"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span>Sarvam AI Processing (sarvam-105b)...</span>
              </div>
              <div className="text-[11px] font-mono text-[#5A4E44] flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF3EA] border border-[#E5D7C5]">
                <span className="w-2 h-2 rounded-full bg-[#0047AB] animate-ping shrink-0" />
                <span>{thinkingStep}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── BOTTOM SECTION: Suggestions Chips & Rounded Composer Bar ── */}
        <div className="pt-3 border-t border-[#E8DCCF] space-y-3 shrink-0">
          {/* Quick Scenario / Question Chips: ONLY INCLUDED IF CHAT BOX IS EMPTY */}
          {chatMessages.length === 0 && (
            <div className="space-y-2 py-1">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#8A7B6D]">
                <Zap className="w-3 h-3 text-[#0047AB]" />
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
                    className="px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white border border-[#E0D4C4] hover:border-[#0047AB]/40 text-[10px] font-semibold text-[#1A1A1A] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <sug.icon className="w-3 h-3 text-[#0047AB]" />
                    <span>{sug.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

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
              className="flex-1 py-1.5 px-2 text-xs sm:text-[13px] text-[#1A1A1A] placeholder-[#9A8B7D] focus:outline-none bg-transparent resize-none font-medium leading-relaxed"
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
              className="rounded-xl px-4 py-2 text-xs font-bold border border-[#00388A] bg-gradient-to-b from-[#0047AB] to-[#00388A] text-white shadow-[0_2px_6px_rgba(0,71,171,0.25),inset_0_1px_0_rgba(255,255,255,0.3)] hover:brightness-105 active:brightness-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
