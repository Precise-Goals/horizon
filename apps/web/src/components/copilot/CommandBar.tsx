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
    <Card className="p-6 sm:p-8">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0A0A0A] text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-[#2DD4BF]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0A0A0A] tracking-tight flex items-center gap-2">
              <span>Sarvam AI Autonomous SRE Copilot</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-[#0A0A0A] border border-[#E5E5E5]">
                sarvam-105b
              </span>
            </h3>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              Continuous natural language prompts orchestrating autonomous recovery across connected infrastructure.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5E5E5] text-[10px] font-mono font-medium text-[#0A0A0A] hidden sm:flex">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse" />
          <span>MULTI-AGENT COPILOT</span>
        </div>
      </div>

      {/* Input bar */}
      <form onSubmit={handleExecute} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Terminal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
          <input
            type="text"
            placeholder="Type SRE command (e.g., 'simulate postgres outage', 'diagnose cluster')..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full pl-10 pr-4 h-12 rounded-[12px] bg-white border border-[#E5E5E5] text-xs sm:text-sm text-[#0A0A0A] placeholder-[#A3A3A3] focus:outline-none focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#2DD4BF]/20 transition-all font-mono"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={loading || !prompt.trim()}
          className="gap-2 text-xs shrink-0"
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
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-[#E5E5E5]">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#A3A3A3] mr-1">Prompts:</span>
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPrompt(qp)}
            className="text-[11px] px-3 py-1 rounded-full bg-white hover:bg-neutral-50 border border-[#E5E5E5] text-[#6B6B6B] hover:text-[#0A0A0A] hover:border-[#D4D4D4] font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <span>{qp}</span>
            <ArrowRight className="w-2.5 h-2.5 text-[#2DD4BF]" />
          </button>
        ))}
      </div>

      {/* AI Reasoning Response Panel */}
      <AnimatePresence>
        {result && (
          <motion.div
            key="sarvam-result-box"
            initial={{ opacity: 0, y: 6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 6, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-4 rounded-[16px] bg-neutral-50 border border-[#E5E5E5] text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#0A0A0A] flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-[#2DD4BF]" />
                  Sarvam AI Agent Reasoning
                </span>
                <span className="font-mono text-[10px] text-[#0A0A0A] uppercase px-2 py-0.5 rounded-full bg-white border border-[#E5E5E5]">
                  Action: {result.actionType}
                </span>
              </div>

              <p className="text-[#0A0A0A] leading-relaxed font-sans">{result.assistantReply}</p>

              {result.reasoning && (
                <div className="pt-2 border-t border-[#E5E5E5] text-[11px] font-mono text-emerald-800 font-medium flex items-center gap-1.5">
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

export default CommandBar;
