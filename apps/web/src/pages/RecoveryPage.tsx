import React from 'react';
import { motion, type BezierDefinition } from 'framer-motion';
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

export const RecoveryPage: React.FC = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 sm:space-y-8 font-sans w-full"
    >
      {/* Return Navigation & Status Pill */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#6E6258] hover:text-[#1A1A1A] transition-colors"
        >
          <span>&larr; Return to Home</span>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono text-emerald-800 font-bold">Self-Healing Engine Armed</span>
        </div>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1A1A1A]">
              Autonomous Recovery Orchestrator
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#0047AB]/10 text-[#0047AB] border border-[#0047AB]/20 shadow-xs">
              <RotateCcw className="w-3.5 h-3.5 text-[#0047AB]" />
              PLAYBOOK SEQUENCER
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5A4E44] mt-1.5 max-w-3xl leading-relaxed font-medium">
            Deterministic execution of recovery playbooks in strict topological dependency order with mandatory human approval gates for critical infrastructure.
          </p>
        </div>

        <Link to="/audit">
          <button className="skeuo-btn-secondary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#1A1A1A] cursor-pointer">
            <span>Verify Audit Ledger</span>
            <ArrowRight className="w-4 h-4 text-[#0047AB]" />
          </button>
        </Link>
      </motion.div>

      {/* Bento Metric Summary Strip */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 space-y-1 skeuo-card border-[#E5D7C5]">
          <div className="flex items-center justify-between text-xs text-[#6E6258] font-medium">
            <span>Mean Recovery Time</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700">3.8m</div>
          <div className="text-[11px] text-[#6E6258] font-mono font-medium">Target SLA: &lt; 5.0m</div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-1 skeuo-card border-[#E5D7C5]">
          <div className="flex items-center justify-between text-xs text-[#6E6258] font-medium">
            <span>Orchestration Mode</span>
            <RotateCcw className="w-4 h-4 text-[#0047AB]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#1A1A1A]">Topological</div>
          <div className="text-[11px] text-[#0047AB] font-mono font-bold">Zero Cyclic Deadlocks</div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-1 skeuo-card border-[#E5D7C5]">
          <div className="flex items-center justify-between text-xs text-[#6E6258] font-medium">
            <span>Approval Gate</span>
            <KeyRound className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-700">BridgeKey</div>
          <div className="text-[11px] text-[#6E6258] font-mono font-medium">EIP-712 Commander Multi-Sig</div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-1 skeuo-card border-[#E5D7C5]">
          <div className="flex items-center justify-between text-xs text-[#6E6258] font-medium">
            <span>Audit Anchoring</span>
            <ShieldCheck className="w-4 h-4 text-[#0047AB]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#0047AB]">MST Testnet</div>
          <div className="text-[11px] text-[#6E6258] font-mono font-medium">Chain ID: 91562037</div>
        </Card>
      </motion.div>

      {/* Recovery Timeline & Steps */}
      <motion.div variants={itemVariants}>
        <RecoveryTimeline />
      </motion.div>
    </motion.div>
  );
};
