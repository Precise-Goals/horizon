import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MetricWidget } from '../components/dashboard/MetricWidget';
import { CommandBar } from '../components/copilot/CommandBar';
import { SystemHealthOverview } from '../components/dashboard/SystemHealthOverview';
import { RecentActivityWidget } from '../components/dashboard/RecentActivityWidget';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { fetchNodes, fetchHealth } from '../lib/api';
import { mstBlockchain, MST_CONFIG } from '../engine/mstBlockchain';
import type { SystemNode } from '../types';
import {
  Clock,
  Activity,
  Server,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  RefreshCw,
  Cpu,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router';

export const DashboardPage: React.FC = () => {
  const [nodes, setNodes] = useState<SystemNode[]>([]);
  const [healthStatus, setHealthStatus] = useState<string>('UP');
  const [loading, setLoading] = useState<boolean>(true);
  const [blockHeight, setBlockHeight] = useState<number>(1042891);
  const [lastCheckTime, setLastCheckTime] = useState<string>('');

  const loadData = async () => {
    try {
      const [n, h] = await Promise.all([fetchNodes(), fetchHealth()]);
      setNodes(n);
      setHealthStatus(h.status);
      setLastCheckTime(new Date().toLocaleTimeString());

      // Read live block height
      const hBlock = await mstBlockchain.getBlockHeight();
      setBlockHeight(hBlock);
    } catch {
      setHealthStatus('DEGRADED');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalNodes = nodes.length || 7;
  const downCount = nodes.filter((n) => n.status === 'down' || n.status === 'degraded').length;
  const healthyCount = nodes.filter((n) => n.status === 'healthy').length;
  const availabilityPct = totalNodes > 0 ? ((healthyCount / totalNodes) * 100).toFixed(1) : '99.9';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 sm:space-y-7 font-sans"
    >
      {/* Top Breadcrumb & Live Status Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#94A3B8] hover:text-[#FFF8F0] transition-colors"
        >
          <span>&larr; Return to Homepage</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-emerald-300 font-semibold">Live Telemetry Active</span>
        </div>
      </div>

      {/* SRE Command Center Bento Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#FFF8F0]">
              Resilience Command Center
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SRE AUTONOMOUS v1.0
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1.5 max-w-3xl leading-relaxed">
            Real-time directed acyclic graph telemetry, AI triage copilot, and MST on-chain audit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/architect">
            <Button
              variant="secondary"
              size="md"
              className="gap-2 text-xs sm:text-sm font-semibold rounded-xl border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 shadow-sm"
              title="Launch Agentic Flow Architect to synthesize custom topologies"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>AI Flow Architect</span>
            </Button>
          </Link>

          <Button
            variant="secondary"
            size="md"
            onClick={loadData}
            className="gap-2 text-xs sm:text-sm font-semibold rounded-xl"
            title="Poll endpoints immediately"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Poll Cluster</span>
          </Button>

          <Link to="/recovery">
            <Button variant="primary" size="md" className="gap-2 text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25">
              <RotateCcw className="w-4 h-4" />
              <span>Orchestrate Recovery</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Sarvam AI SRE Copilot Command Bar */}
      <CommandBar />

      {/* KPI Metric Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricWidget
          title="Mean Time To Recovery"
          value="3.8m"
          trend="-18% vs 24h avg"
          isPositive={true}
          icon={<Clock className="w-5 h-5" />}
          subtitle="Target SLA: < 5.0m"
          sparkline={[5.2, 4.8, 4.6, 4.3, 4.0, 3.8]}
        />
        <MetricWidget
          title="Cluster Availability"
          value={`${availabilityPct}%`}
          trend={downCount === 0 ? "100% Operational" : `${downCount} Nodes Degraded`}
          isPositive={downCount === 0}
          icon={<Activity className="w-5 h-5" />}
          subtitle="99.95% Monthly SLA"
          sparkline={[99.8, 99.9, 99.8, 99.9, parseFloat(availabilityPct)]}
        />
        <MetricWidget
          title="Monitored Services"
          value={totalNodes}
          badge="K8s & DB"
          icon={<Server className="w-5 h-5" />}
          subtitle="PostgreSQL, Redis, Gateways"
          sparkline={[7, 7, 7, 7, 7, 7]}
        />
        <MetricWidget
          title="Active Outages"
          value={downCount}
          trend={downCount === 0 ? "0 Systemic Outages" : "Recovery Sequence Ready"}
          isPositive={downCount === 0}
          icon={<AlertTriangle className="w-5 h-5" />}
          subtitle="Continuous Health Probes"
          sparkline={[0, 0, 1, 0, downCount]}
        />
      </div>

      {/* Main Bento Grid: Services Health Matrix & Incident Triage Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-7">
        <SystemHealthOverview />
        <RecentActivityWidget />
      </div>

      {/* Bottom Observability & Edge Telemetry Bento Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Edge Serverless Status Bento */}
        <Card className="p-5 flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#1E6BFF]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[#FFF8F0] text-sm sm:text-base flex items-center gap-2">
                <span>Vercel Edge Serverless</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold">
                  {healthStatus}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
                /api/v1/health • Bun & Hono
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-[#8E9DB8]">
            {lastCheckTime || 'Synced'}
          </span>
        </Card>

        {/* MST Blockchain Network Status Bento */}
        <Card className="p-5 flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[#FFF8F0] text-sm sm:text-base flex items-center gap-2">
                <span>MST Blockchain Testnet</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 font-semibold">
                  ID: 91562037
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
                Block #{blockHeight} • BridgeKey Active
              </p>
            </div>
          </div>
          <a
            href={MST_CONFIG.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 transition-colors p-1.5"
            title="Inspect Explorer"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </Card>

        {/* Quick DAG Navigation Bento */}
        <Card className="p-5 flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[#FFF8F0] text-sm sm:text-base">
                Zero-Downtime Topological DAG
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Inspect dependency blast radius & ordering.
              </p>
            </div>
          </div>
          <Link
            to="/topology"
            className="inline-flex items-center gap-1.5 font-bold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>View DAG</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>
      </div>
    </motion.div>
  );
};
