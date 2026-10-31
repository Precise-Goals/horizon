import React from 'react';
import { motion, type BezierDefinition } from 'framer-motion';
import { Link } from 'react-router';
import { RecoveryTimeline } from '../components/recovery/RecoveryTimeline';
import { Card } from '../components/common/Card';
import { Globe } from '../components/common/Globe';
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
    transition: { staggerChildren: 0.06, duration: 0.25 },
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

export const RecoveryPage: React.FC = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 font-sans w-full text-[#0A0A0A] relative"
    >
      {/* Return Navigation & Status Pill */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors bg-white px-3.5 py-1.5 rounded-full border border-[#E5E5E5] shadow-xs"
        >
          <span>&larr; Return to Overview</span>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5E5E5] text-[11px] font-mono text-[#0A0A0A] shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse" />
          <span className="font-semibold">Self-Healing Engine Armed</span>
        </div>
      </motion.div>

      {/* Signature Two-Line Header */}
      <motion.div variants={itemVariants} className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-[10px] font-mono font-medium text-[#0A0A0A] border border-[#E5E5E5]">
            <RotateCcw className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>PLAYBOOK SEQUENCER & HUMAN GATES</span>
          </div>

          <h1 className="tracking-tight leading-[1.02]">
            <span className="block font-['Instrument_Serif',serif] font-normal text-[#A3A3A3] text-4xl sm:text-5xl lg:text-6xl">
              Deterministic Recovery,
            </span>
            <span className="block font-['Instrument_Serif',serif] italic font-normal text-[#0A0A0A] text-4xl sm:text-5xl lg:text-6xl">
              orchestrated playbooks.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-[#6B6B6B] max-w-xl leading-relaxed">
            Deterministic execution of recovery playbooks in strict topological dependency order with mandatory BridgeKey approval gates for mission-critical infrastructure.
          </p>
        </div>

        <Link to="/audit" className="z-10">
          <button className="h-11 px-6 rounded-full bg-[#0A0A0A] text-white hover:bg-neutral-800 text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm">
            <span>Verify Audit Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Link>

        {/* Faint Stipple Globe Side-Peek Motif */}
        <div className="absolute right-0 top-0 pointer-events-none opacity-20 hidden lg:block -mr-16 -mt-8">
          <Globe size="200px" crop="side-peek" />
        </div>
      </motion.div>

      {/* Metric Summary Strip */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 space-y-1 bg-white border border-[#E5E5E5] rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-xs text-[#6B6B6B] font-mono uppercase tracking-wider">
            <span>Mean Recovery Time</span>
            <Clock className="w-4 h-4 text-[#2DD4BF]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0A0A0A]">3.8s</div>
          <div className="text-[11px] text-[#6B6B6B] font-mono">Target SLA: &lt; 5.0s</div>
        </Card>

        <Card className="p-5 space-y-1 bg-white border border-[#E5E5E5] rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-xs text-[#6B6B6B] font-mono uppercase tracking-wider">
            <span>Orchestration Mode</span>
            <RotateCcw className="w-4 h-4 text-[#0A0A0A]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0A0A0A]">Topological</div>
          <div className="text-[11px] text-[#2DD4BF] font-mono">Zero Cyclic Deadlocks</div>
        </Card>

        <Card className="p-5 space-y-1 bg-white border border-[#E5E5E5] rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-xs text-[#6B6B6B] font-mono uppercase tracking-wider">
            <span>Approval Gate</span>
            <KeyRound className="w-4 h-4 text-[#0A0A0A]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0A0A0A]">BridgeKey</div>
          <div className="text-[11px] text-[#6B6B6B] font-mono">EIP-712 Multi-Sig Gate</div>
        </Card>

        <Card className="p-5 space-y-1 bg-white border border-[#E5E5E5] rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-xs text-[#6B6B6B] font-mono uppercase tracking-wider">
            <span>Audit Anchoring</span>
            <ShieldCheck className="w-4 h-4 text-[#2DD4BF]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0A0A0A]">MST Testnet</div>
          <div className="text-[11px] text-[#6B6B6B] font-mono">Chain ID: 91562037</div>
        </Card>
      </motion.div>

      {/* Recovery Timeline & Steps */}
      <motion.div variants={itemVariants}>
        <RecoveryTimeline />
      </motion.div>
    </motion.div>
  );
};
export default RecoveryPage;
