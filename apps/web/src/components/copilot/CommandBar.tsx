import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { sarvamAgent, type SarvamCommandResult } from '../../engine/sarvamAgent';
import { clusterState } from '../../engine/state';
import {
  Sparkles,
  Terminal,
  Send,
  Loader2,
  Bot,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const CommandBar: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SarvamCommandResult | null>(null);

  const handleExecute = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      const nodes = clusterState.getNodes();
      const res = await sarvamAgent.interpretCommand(prompt, nodes);
      setResult(res);

      // Execute cluster mutations directly if prompted
      if (res.actionType === 'SIMULATE_FAILURE' && res.targetNodeId) {
        clusterState.setNodeStatus(res.targetNodeId, 'down');
        clusterState.addAuditLog({
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          actor: 'LLM_AGENT',
          action: `AI Chaos Trigger: ${res.targetNodeId}`,
          details: `Sarvam AI orchestrated failure simulation based on operator prompt.`,
          severity: 'warning',
        });
      } else if (res.actionType === 'TRIGGER_RECOVERY') {
        clusterState.startRecovery('db-primary');
        clusterState.addAuditLog({
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          actor: 'LLM_AGENT',
          action: 'Autonomous Recovery Initiated',
          details: `Sarvam AI initiated topological recovery sequence.`,
          severity: 'info',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Simulate outage on PostgreSQL Primary',
    'Diagnose cluster health and blast radius',
    'Execute bottom-up recovery playbook',
    'Check MST testnet signer status',
  ];

  return (
    <Card className="p-5 skeuo-card border-[#E5D7C5]">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EADCC9]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0047AB]/10 text-[#0047AB] border border-[#0047AB]/25 flex items-center justify-center shadow-inner">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#1A1A1A] tracking-tight flex items-center gap-2">
              <span>Sarvam AI Autonomous SRE Copilot</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0047AB]/10 text-[#0047AB] border border-[#0047AB]/20 font-bold">
                sarvam-105b
              </span>
            </h3>
            <p className="text-[11px] text-[#6E6258] font-medium">
              Continuous natural language prompts orchestrating autonomous agents across infrastructure.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full items-center gap-1.5 hidden sm:flex shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          ACTIVE MULTI-AGENT
        </span>
      </div>

      {/* Input bar in debossed recessed well */}
      <form onSubmit={handleExecute} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Terminal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0047AB]" />
          <input
            type="text"
            placeholder="Type SRE command (e.g., 'simulate postgres outage', 'diagnose cluster')..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl skeuo-well text-xs text-[#1A1A1A] placeholder-[#8A7B6D] focus:outline-none focus:ring-2 focus:ring-[#0047AB]/30 transition-all font-mono font-medium"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={loading || !prompt.trim()}
          className="gap-1.5 text-xs px-5 py-2.5 font-bold shrink-0 shadow-sm"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Execute</span>
        </Button>
      </form>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-[#EADCC9]">
        <span className="text-[10px] font-mono font-bold text-[#8A7B6D] uppercase">Quick Prompts:</span>
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setPrompt(qp);
            }}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-[#FAF3EA] hover:bg-[#F4EBE0] border border-[#E5D7C5] text-[#403830] hover:text-[#1A1A1A] font-medium transition-all cursor-pointer flex items-center gap-1 shadow-xs hover:shadow-inner"
          >
            <span>{qp}</span>
            <ArrowRight className="w-2.5 h-2.5 text-[#0047AB] opacity-70" />
          </button>
        ))}
      </div>

      {/* AI Reasoning Response Panel */}
      <AnimatePresence>
        {result && (
          <motion.div
            key="sarvam-result-box"
            initial={{ opacity: 0, y: 8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 8, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mt-3.5 p-4 rounded-xl skeuo-well border-[#D9C8B5] text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0047AB] flex items-center gap-1.5">
                  <Bot className="w-4 h-4" />
                  Sarvam AI Agent Reasoning
                </span>
                <span className="font-mono text-[10px] font-bold text-[#403830] uppercase px-2 py-0.5 rounded bg-white/80 border border-[#D9C8B5]">
                  Action: {result.actionType}
                </span>
              </div>

              <p className="text-[#2C241E] leading-relaxed font-sans font-medium">{result.assistantReply}</p>

              {result.reasoning && (
                <div className="pt-2 border-t border-[#E5D7C5] text-[11px] font-mono text-emerald-800 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{result.reasoning}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
