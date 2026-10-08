import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { RecoveryTimeline } from '../components/recovery/RecoveryTimeline';
import { Card } from '../components/common/Card';
import {
  RotateCcw,
  Clock,
  ShieldCheck,
  KeyRound,
  ArrowRight,
} from 'lucide-react';

export const RecoveryPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 sm:space-y-7 font-sans"
    >
      {/* Return Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#94A3B8] hover:text-[#FFF8F0] transition-colors"
        >
          <span>&larr; Return to Homepage</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-emerald-300 font-semibold">Self-Healing Engine Armed</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#FFF8F0]">
              Autonomous Recovery Orchestrator
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              PLAYBOOK SEQUENCER
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1.5 max-w-3xl leading-relaxed">
            Deterministic execution of recovery playbooks in strict topological dependency order with mandatory human approval gates for critical infrastructure.
          </p>
        </div>

        <Link to="/audit">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs sm:text-sm font-bold text-purple-300 hover:bg-purple-500/25 transition-all shadow-lg shadow-purple-500/10 cursor-pointer">
            <span>Verify Audit Ledger</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>

      {/* Bento Metric Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8E9DB8]">
            <span>Mean Recovery Time</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">3.8m</div>
          <div className="text-[11px] text-[#8E9DB8] font-mono">Target SLA: &lt; 5.0m</div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8E9DB8]">
            <span>Orchestration Mode</span>
            <RotateCcw className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#FFF8F0]">Topological</div>
          <div className="text-[11px] text-blue-400 font-mono">Zero Cyclic Deadlocks</div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8E9DB8]">
            <span>Approval Gate</span>
            <KeyRound className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">BridgeKey</div>
          <div className="text-[11px] text-[#8E9DB8] font-mono">EIP-712 Commander Multi-Sig</div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8E9DB8]">
            <span>Audit Anchoring</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-purple-300">MST Testnet</div>
          <div className="text-[11px] text-[#8E9DB8] font-mono">Chain ID: 91562037</div>
        </Card>
      </div>

      {/* Recovery Timeline & Steps */}
      <RecoveryTimeline />
    </motion.div>
  );
};
