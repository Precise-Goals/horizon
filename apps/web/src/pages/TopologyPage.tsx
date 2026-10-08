import React from 'react';
import { motion } from 'framer-motion';
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

export const TopologyPage: React.FC = () => {
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
          <span className="text-xs font-mono text-emerald-300 font-semibold">O(V + E) Acyclic DAG Active</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#FFF8F0]">
              Dependency DAG Topology
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/25">
              <Network className="w-3.5 h-3.5 text-blue-400" />
              TOPOLOGICAL RESOLVER
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1.5 max-w-3xl leading-relaxed">
            Dynamic Directed Acyclic Graph (DAG) visualizing parent-child service relationships, reverse dependency traversal, and failure blast radius.
          </p>
        </div>

        <Link to="/recovery">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-xs sm:text-sm font-bold text-blue-300 hover:bg-blue-500/25 transition-all shadow-lg shadow-blue-500/10 cursor-pointer">
            <span>Orchestrate Recovery</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>

      {/* Bento Metric Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8E9DB8]">
            <span>Monitored Nodes</span>
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#FFF8F0]">7 Nodes</div>
          <div className="text-[11px] text-emerald-400 font-mono">Microservices & Pods</div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8E9DB8]">
            <span>Graph Health</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">0 Cycles</div>
          <div className="text-[11px] text-[#8E9DB8] font-mono">Cycle Deadlock Free</div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8E9DB8]">
            <span>Topological Depth</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#FFF8F0]">4 Tiers</div>
          <div className="text-[11px] text-[#8E9DB8] font-mono">Database to Gateway</div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8E9DB8]">
            <span>Algorithm Complexity</span>
            <Network className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">O(V + E)</div>
          <div className="text-[11px] text-[#8E9DB8] font-mono">Kahn's Sort Verified</div>
        </Card>
      </div>

      {/* Interactive Topology Graph Component */}
      <TopologyGraph />
    </motion.div>
  );
};
