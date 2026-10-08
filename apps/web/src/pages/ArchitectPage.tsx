import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  dagArchitectAgent,
  type DecodedArchitecture,
  type ChatMessage,
} from '../engine/dagArchitectAgent';
import { clusterState } from '../engine/state';
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
} from 'lucide-react';
import { Link } from 'react-router';

const iconMap: Record<string, React.ElementType> = {
  database: Database,
  cache: Server,
  gateway: Globe,
  application: Layers,
};

export const ArchitectPage: React.FC = () => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dag' | 'yaml' | 'recovery'>('dag');
  const [copied, setCopied] = useState(false);
  const [deployed, setDeployed] = useState(false);

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
        text: 'Welcome to the Horizon Agentic Flow Architect. Describe any cloud architecture, service dependencies, or failure recovery requirements in natural language. I will synthesize the DAG topology, verify cycle safety, and compile the declarative YAML recovery pipeline.',
        decoded: initialDecoded,
      },
    ];
  });

  const [currentArchitecture, setCurrentArchitecture] = useState<DecodedArchitecture>(() => {
    return dagArchitectAgent.synthesizeArchitecture(
      'E-commerce system with PostgreSQL, Redis cache, Auth worker, Stripe payment service, API gateway, and Horizon Web UI.'
    );
  });

  const promptChips = [
    { label: '🛒 E-Commerce Microservices', prompt: 'E-commerce platform with MySQL master, Redis cache, Auth worker, Stripe payment service, Order API, Envoy Gateway, and Next.js frontend.' },
    { label: '💳 FinTech Core Banking', prompt: 'FinTech core banking with PostgreSQL immutable ledger, Kafka event bus, real-time fraud detection engine, core accounts API, and PCI-DSS edge gateway.' },
    { label: '🤖 GenAI Vector RAG Stack', prompt: 'GenAI stack with PostgreSQL pgvector, Milvus vector store, Redis semantic cache, embedding chunking worker, and vLLM inference server behind LiteLLM gateway.' },
    { label: '🎬 Streaming OTT Video', prompt: 'High-scale OTT streaming platform with ScyllaDB catalog, Redis manifest cache, FFmpeg transcoding workers, recommendation API, and Cloudflare video ingress.' },
    { label: '⚠️ Circular Deadlock Trap', prompt: 'Show a circular dependency deadlock loop between order service and inventory service calling each other in a circle.' },
  ];

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
          : `Synthesized ${decoded.nodes.length} nodes across ${decoded.topologicalLevels.length} topological tiers. Cycle check: $O(V+E)$ Kahn's sort PASSED.`,
        decoded,
      };

      setChatMessages((prev) => [...prev, agentMsg]);
    } finally {
      setIsProcessing(false);
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 sm:space-y-7 font-sans"
    >
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#94A3B8] hover:text-[#FFF8F0] transition-colors"
        >
          <span>&larr; Return to Dashboard</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetToDefault}
            className="text-xs text-[#A3ADC2] hover:text-[#FFF8F0] gap-1.5"
            title="Reset active cluster to default 7-node baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </Button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/25">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            AGENTIC SYNTHESIZER
          </span>
        </div>
      </div>

      {/* Main Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#FFF8F0]">
          AI Flow Architect & YAML Synthesizer
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-1.5 max-w-3xl leading-relaxed">
          Describe arbitrary distributed architectures in plain English. The agent decodes dependency hierarchies,
          verifies cycle safety, visualizes the DAG, and outputs declarative recovery pipelines.
        </p>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-mono font-bold text-[#6E7A94] uppercase shrink-0">
          Templates:
        </span>
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip.prompt)}
            disabled={isProcessing}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-blue-500/30 text-[#A3ADC2] hover:text-[#FFF8F0] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>{chip.label}</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-60" />
          </button>
        ))}
      </div>

      {/* Split Workspace: Chatbot on Left, Interactive Visualizer / YAML on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT: AGENTIC CHAT INTERFACE (5 cols) ================= */}
        <Card className="lg:col-span-5 p-5 flex flex-col h-[700px] justify-between border-white/[0.08] bg-[#07090E]/90 backdrop-blur-xl">
          {/* Chat Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#1E6BFF]">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#FFF8F0]">Sarvam Autonomous Architect</h3>
                <p className="text-[10px] text-[#A3ADC2] font-mono">Model: sarvam-105b &bull; Status: Online</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] text-[#6E7A94] font-mono">
                  <span>{msg.sender === 'user' ? 'Commander' : 'AI Architect'}</span>
                  <span>&bull;</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl max-w-[92%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600/20 border border-blue-500/30 text-[#FFF8F0]'
                      : 'bg-white/[0.03] border border-white/[0.08] text-[#E2D7CB]'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Expandable Reasoning / Cycle Analysis */}
                  {msg.reasoning && (
                    <div className="mt-2.5 pt-2 border-t border-white/[0.06] text-[11px] font-mono text-emerald-400/90 space-y-1">
                      <span className="font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Analysis:
                      </span>
                      <p className="text-[#A3ADC2] text-[10px] leading-normal">{msg.reasoning}</p>
                    </div>
                  )}

                  {/* Quick Action when Agent finishes decoding */}
                  {msg.decoded && !msg.decoded.cycleDetected && (
                    <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCurrentArchitecture(msg.decoded!);
                          handleDeployToCluster();
                        }}
                        className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Rocket className="w-3 h-3" />
                        <span>Deploy this DAG to Live Cluster</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2 text-xs text-blue-400 font-mono py-2 animate-pulse">
                <Bot className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing DAG topology and validating cycle constraints...</span>
              </div>
            )}
          </div>

          {/* Chat Input Form */}
          <div className="pt-3 border-t border-white/[0.08]">
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
                placeholder="Describe your microservices stack, database dependencies, or failure expectations..."
                rows={3}
                disabled={isProcessing}
                className="w-full rounded-2xl bg-black/50 border border-white/[0.1] px-3.5 py-2.5 text-xs text-[#FFF8F0] placeholder-[#6E7A94] focus:outline-none focus:border-blue-500/50 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />

              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] font-mono text-[#6E7A94]">Shift + Enter for new line</span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!inputPrompt.trim() || isProcessing}
                  className="rounded-xl px-4 py-1.5 text-xs font-semibold gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>Synthesize</span>
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* ================= RIGHT: VISUALIZER, PIPELINE YAML & RECOVERY PLAN (7 cols) ================= */}
        <Card className="lg:col-span-7 p-6 flex flex-col h-[700px] justify-between border-white/[0.08] bg-[#07090E]/90 backdrop-blur-xl">
          <div>
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/[0.08] gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-[#FFF8F0] tracking-tight">
                    {currentArchitecture.architectureName}
                  </h3>
                  {currentArchitecture.cycleDetected ? (
                    <Badge status="critical">Cycle Detected</Badge>
                  ) : (
                    <Badge status="healthy">Acyclic Verified</Badge>
                  )}
                </div>
                <p className="text-xs text-[#A3ADC2] mt-0.5">
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
                  title="Make this architecture the active cluster for live simulation and dashboard telemetry"
                >
                  {deployed ? <Check className="w-3.5 h-3.5" /> : <Rocket className="w-3.5 h-3.5" />}
                  <span>{deployed ? 'Active in Cluster!' : 'Deploy to Live Cluster'}</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyYaml}
                  className="rounded-xl p-2 h-8 w-8 text-[#A3ADC2] hover:text-[#FFF8F0]"
                  title="Copy YAML to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownloadYaml}
                  className="rounded-xl p-2 h-8 w-8 text-[#A3ADC2] hover:text-[#FFF8F0]"
                  title="Download .yaml file"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mb-4 border-b border-white/[0.06] pb-2">
              <button
                onClick={() => setActiveTab('dag')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'dag'
                    ? 'bg-blue-500/20 text-[#FFF8F0] border border-blue-500/40'
                    : 'text-[#A3ADC2] hover:text-[#FFF8F0]'
                }`}
              >
                <Network className="w-3.5 h-3.5 text-blue-400" />
                <span>Interactive DAG Flow</span>
              </button>

              <button
                onClick={() => setActiveTab('yaml')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'yaml'
                    ? 'bg-blue-500/20 text-[#FFF8F0] border border-blue-500/40'
                    : 'text-[#A3ADC2] hover:text-[#FFF8F0]'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                <span>Declarative YAML Spec</span>
              </button>

              <button
                onClick={() => setActiveTab('recovery')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'recovery'
                    ? 'bg-blue-500/20 text-[#FFF8F0] border border-blue-500/40'
                    : 'text-[#A3ADC2] hover:text-[#FFF8F0]'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Topological Recovery Plan</span>
              </button>
            </div>

            {/* Cycle Warning Banner if detected */}
            {currentArchitecture.cycleDetected && (
              <div className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <div>
                  <span className="font-bold">Circular Deadlock Detected:</span>
                  <p className="mt-0.5 text-red-200/80 leading-relaxed">
                    {currentArchitecture.cycleExplanation}
                  </p>
                </div>
              </div>
            )}

            {/* Sub-Panel Contents */}
            <div className="overflow-y-auto max-h-[490px] pr-1">
              <AnimatePresence mode="wait">
                {activeTab === 'dag' && (
                  <motion.div
                    key="tab-dag"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Render Tiers from top to bottom (Client Edge down to Data Foundations) */}
                    {currentArchitecture.topologicalLevels
                      .slice()
                      .reverse()
                      .map((tierNodeIds, tierIndex) => {
                        const actualTier = currentArchitecture.topologicalLevels.length - 1 - tierIndex;
                        const tierNodes = currentArchitecture.nodes.filter((n) => tierNodeIds.includes(n.id));

                        return (
                          <div key={actualTier} className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-mono text-[#6E7A94] border-b border-white/[0.04] pb-1">
                              <span className="font-bold text-blue-400">
                                {actualTier === 0
                                  ? 'TIER 0: FOUNDATIONAL PERSISTENCE'
                                  : actualTier === 1
                                  ? 'TIER 1: CACHES & EVENT BROKERS'
                                  : actualTier === 2
                                  ? 'TIER 2: CORE MICROSERVICES'
                                  : actualTier === 3
                                  ? 'TIER 3: INGRESS GATEWAYS'
                                  : `TIER ${actualTier}: CLIENT PRESENTATION`}
                              </span>
                              <span>Recover Order: #{actualTier + 1}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                              {tierNodes.map((node) => {
                                const Icon = iconMap[node.type] || Server;
                                return (
                                  <div
                                    key={node.id}
                                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-blue-500/30 transition-all space-y-1.5"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                          <Icon className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-xs font-bold text-[#FFF8F0] truncate max-w-[140px]">
                                          {node.name}
                                        </span>
                                      </div>
                                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.04] text-[#A3ADC2]">
                                        {node.type}
                                      </span>
                                    </div>

                                    {node.dependencies.length > 0 && (
                                      <div className="text-[10px] text-[#A3ADC2] font-mono truncate">
                                        Depends on: {node.dependencies.join(', ')}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </motion.div>
                )}

                {activeTab === 'yaml' && (
                  <motion.div
                    key="tab-yaml"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative"
                  >
                    <pre className="p-4 rounded-2xl bg-[#030508] border border-white/[0.08] text-[11px] font-mono text-cyan-300 leading-relaxed overflow-x-auto select-all">
                      <code>{currentArchitecture.yamlPipeline}</code>
                    </pre>
                  </motion.div>
                )}

                {activeTab === 'recovery' && (
                  <motion.div
                    key="tab-recovery"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-[#FFF8F0] space-y-1">
                      <span className="font-bold flex items-center gap-1.5 text-blue-300">
                        <RotateCcw className="w-3.5 h-3.5" />
                        Topological Kahn's Bottom-Up Execution Plan
                      </span>
                      <p className="text-[11px] text-[#A3ADC2]">
                        When this cluster suffers a cascading blackout, Horizon activates the exact sequence below.
                        Foundational databases restore first. High-risk actions trigger a BridgeKey cryptographic prompt.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {currentArchitecture.topologicalLevels.map((levelNodes, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-mono font-bold flex items-center justify-center">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#FFF8F0]">
                                Stage {idx + 1}: Restore {levelNodes.join(', ')}
                              </div>
                              <div className="text-[10px] text-[#A3ADC2] font-mono">
                                Strategy: {idx === 0 ? 'Storage Master Promotion / VIP repoint' : idx === 1 ? 'Cache Flush & Cache Warmup' : 'Zero-Downtime Rolling Ingress Restart'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {idx === 0 ? (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                BridgeKey EIP-712 Gate
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Autonomous Auto-Run
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
          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#6E7A94]">
            <span>Spec: horizon.recovery.io/v1alpha1</span>
            <span>Target Governance: MST Testnet 91562037</span>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};
export default ArchitectPage;
