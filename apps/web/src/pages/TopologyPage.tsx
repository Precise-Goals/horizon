import React from 'react';
import { motion, type BezierDefinition } from 'framer-motion';
import { Link } from 'react-router';
import { TopologyGraph } from '../components/topology/TopologyGraph';
import { Card } from '../components/common/Card';
import {
  Network,
  ShieldCheck,
  Server,
  Layers,
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

export const TopologyPage: React.FC = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 sm:space-y-8 font-sans w-full"
    >
      {/* Return Navigation */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#6E6258] hover:text-[#1A1A1A] transition-colors"
        >
          <span>&larr; Return to Home</span>
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1A1A1A]">
            Dependency DAG Topology
          </h1>
          <p className="text-xs sm:text-sm text-[#5A4E44] mt-1.5 max-w-3xl leading-relaxed font-medium">
            Dynamic Directed Acyclic Graph (DAG) visualizing parent-child service relationships, reverse dependency traversal, and failure blast radius.
          </p>
        </div>

        <Link to="/recovery">
          <button className="skeuo-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer">
            <span>Orchestrate Recovery</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </motion.div>

      {/* Bento Metric Summary Strip */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 space-y-1 skeuo-card border-[#E5D7C5]">
          <div className="flex items-center justify-between text-xs text-[#6E6258] font-medium">
            <span>Monitored Nodes</span>
            <Server className="w-4 h-4 text-[#0047AB]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#1A1A1A]">7 Nodes</div>
          <div className="text-[11px] text-emerald-800 font-mono font-bold">Microservices & Pods</div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-1 skeuo-card border-[#E5D7C5]">
          <div className="flex items-center justify-between text-xs text-[#6E6258] font-medium">
            <span>Graph Health</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700">0 Cycles</div>
          <div className="text-[11px] text-[#6E6258] font-mono font-medium">Cycle Deadlock Free</div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-1 skeuo-card border-[#E5D7C5]">
          <div className="flex items-center justify-between text-xs text-[#6E6258] font-medium">
            <span>Topological Depth</span>
            <Layers className="w-4 h-4 text-[#0047AB]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#1A1A1A]">4 Tiers</div>
          <div className="text-[11px] text-[#6E6258] font-mono font-medium">Database to Gateway</div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-1 skeuo-card border-[#E5D7C5]">
          <div className="flex items-center justify-between text-xs text-[#6E6258] font-medium">
            <span>Algorithm Complexity</span>
            <Network className="w-4 h-4 text-[#0047AB]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#0047AB]">O(V + E)</div>
          <div className="text-[11px] text-[#6E6258] font-mono font-medium">Kahn's Sort Verified</div>
        </Card>
      </motion.div>

      {/* Interactive Topology Graph Component */}
      <motion.div variants={itemVariants}>
        <TopologyGraph />
      </motion.div>
    </motion.div>
  );
};
