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
    <Card className="p-4 bg-[#0A0E18]/80 border-blue-500/30 shadow-xl shadow-blue-500/10 backdrop-blur-2xl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-[#1E6BFF] border border-blue-500/30 shadow-sm shadow-blue-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-[#FFF8F0] tracking-tight flex items-center gap-2">
              <span>Sarvam AI Autonomous SRE Copilot</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                sarvam-105b
              </span>
            </h3>
            <p className="text-[11px] text-[#A3ADC2]">
              Continuous natural language prompts orchestrating autonomous agents across infrastructure.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 hidden sm:flex">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ACTIVE MULTI-AGENT
        </span>
      </div>

      {/* Input bar */}
      <form onSubmit={handleExecute} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Terminal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
          <input
            type="text"
            placeholder="Type SRE command (e.g., 'simulate postgres outage', 'diagnose cluster')..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-[#FFF8F0] placeholder-[#6E7A94] focus:outline-none focus:border-blue-400 focus:bg-black/70 transition-all font-mono"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={loading || !prompt.trim()}
          className="gap-1.5 text-xs px-4 py-2.5 font-semibold"
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
      <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2 border-t border-white/[0.04]">
        <span className="text-[10px] font-mono text-[#6E7A94] uppercase">Quick Prompts:</span>
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setPrompt(qp);
            }}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-[#A3ADC2] hover:text-[#FFF8F0] transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>{qp}</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-60" />
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
            <div className="mt-3.5 p-3.5 rounded-xl bg-blue-500/[0.08] border border-blue-500/25 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-300 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" />
                  Sarvam AI Agent Reasoning
                </span>
                <span className="font-mono text-[10px] text-[#A3ADC2] uppercase px-2 py-0.5 rounded bg-white/[0.04]">
                  Action: {result.actionType}
                </span>
              </div>

              <p className="text-[#E2D7CB] leading-relaxed font-sans">{result.assistantReply}</p>

              {result.reasoning && (
                <div className="pt-2 border-t border-white/[0.06] text-[11px] font-mono text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
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
