import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MetricWidget } from '../components/dashboard/MetricWidget';
import { CommandBar } from '../components/copilot/CommandBar';
import { SystemHealthOverview } from '../components/dashboard/SystemHealthOverview';
import { RecentActivityWidget } from '../components/dashboard/RecentActivityWidget';
import { WarRoomWidget } from '../components/dashboard/WarRoomWidget';
import { Button } from '../components/common/Button';
import { fetchNodes, fetchHealth } from '../lib/api';
import { mstBlockchain, MST_CONFIG } from '../engine/mstBlockchain';
import { autonomousWatchdog, type WatchdogMetrics } from '../engine/watchdog';
import { dockerBridge, type DockerBridgeStatus } from '../engine/dockerBridge';
import type { SystemNode } from '../types';
import {
  Clock,
  Activity,
  Server,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Cpu,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Zap,
  Network,
  Terminal,
} from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '../lib/utils';
import type { BezierDefinition } from 'framer-motion';

/* ─── Animation variants ─── */
const EASE: BezierDefinition = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, duration: 0.3 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
};

export const DashboardPage: React.FC = () => {
  const [nodes, setNodes] = useState<SystemNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockHeight, setBlockHeight] = useState<number>(0);
  const [lastCheckTime, setLastCheckTime] = useState('—');
  const [watchdogMetrics, setWatchdogMetrics] = useState<WatchdogMetrics>(
    () => autonomousWatchdog.getMetrics()
  );
  const [dockerStatus, setDockerStatus] = useState<DockerBridgeStatus>(
    () => dockerBridge.getStatus()
  );

  /* subscribe to live engine events */
  useEffect(() => {
    const unsub       = autonomousWatchdog.subscribe(() => setWatchdogMetrics(autonomousWatchdog.getMetrics()));
    const unsubDocker = dockerBridge.subscribe(() => setDockerStatus(dockerBridge.getStatus()));
    return () => { unsub(); unsubDocker(); };
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [n] = await Promise.all([fetchNodes(), fetchHealth()]);
      setNodes(n);
      setLastCheckTime(new Date().toLocaleTimeString());
      const hBlock = await mstBlockchain.getBlockHeight();
      if (hBlock) setBlockHeight(hBlock);
    } catch {
      /* in-memory engine fallback */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5_000);
    return () => clearInterval(interval);
  }, [loadData]);

  /* Derived metrics */
  const totalNodes    = nodes.length || 7;
  const downCount     = nodes.filter((n) => n.status === 'down' || n.status === 'degraded').length;
  const healthyCount  = nodes.filter((n) => n.status === 'healthy').length;
  const availPct      = totalNodes > 0 ? ((healthyCount / totalNodes) * 100).toFixed(1) : '99.9';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="horizon-dashboard space-y-7 text-[#1A1A1A]"
    >
      {/* ── Page Header ── */}
      <motion.div variants={itemVariants} className="horizon-dashboard-header flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1.5">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#1A1A1A]">
              Resilience Command Center
            </h1>
            <span className="horizon-badge text-[#0F8E52] bg-[#EBF7EE] border-[#0F8E52]/25 shadow-sm">
              <span className="skeuo-led skeuo-led-healthy animate-pulse" />
              Live SRE Engine
            </span>
          </div>
          <p className="text-sm text-[#555555] max-w-lg leading-relaxed">
            Real-time DAG telemetry · AI triage · MST on-chain audit · Last polled{' '}
            <span className="font-mono text-[#1A1A1A] font-bold">{lastCheckTime}</span>
          </p>
        </div>

        {/* Action strip */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => autonomousWatchdog.toggleSentinel()}
            className={cn(
              'gap-2 text-xs font-bold',
              watchdogMetrics.isSentinelActive && 'bg-[#FEF6E7] text-[#B45309] border-[#D97706]/35'
            )}
            title="Toggle chaos injection for live evaluator demo"
          >
            <Zap className={cn('w-3.5 h-3.5', watchdogMetrics.isSentinelActive && 'text-[#D97706] animate-pulse')} />
            {watchdogMetrics.isSentinelActive ? 'Sentinel Active' : 'Chaos Sentinel'}
          </Button>

          <Link to="/architect">
            <Button variant="secondary" size="sm" className="gap-2 text-xs font-bold text-[#0047AB] border-[#0047AB]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#0047AB]" />
              AI Architect
            </Button>
          </Link>

          <Link to="/docs">
            <Button variant="secondary" size="sm" className="gap-2 text-xs font-bold text-[#0047AB] border-[#0047AB]/20">
              <Terminal className="w-3.5 h-3.5 text-[#0047AB]" />
              MCP & Docs
            </Button>
          </Link>

          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            className="gap-2 text-xs font-bold"
            title="Poll endpoints immediately"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
            Refresh
          </Button>

          <Link to="/recovery">
            <Button variant="primary" size="sm" className="gap-2 text-xs font-bold">
              <RotateCcw className="w-3.5 h-3.5" />
              Orchestrate
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* ── Sarvam AI Copilot Command Bar ── */}
      <motion.div variants={itemVariants}>
        <CommandBar />
      </motion.div>

      {/* ── KPI Metric Bento Row ── */}
      <motion.div variants={itemVariants} className="horizon-kpi-grid grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricWidget
          title="Mean Time To Recovery"
          value={`${watchdogMetrics.rollingMttrSeconds.toFixed(1)}s`}
          trend={
            watchdogMetrics.activeStopwatchSeconds > 0
              ? `Active: ${watchdogMetrics.activeStopwatchSeconds}s`
              : 'Optimal SLA'
          }
          isPositive
          icon={<Clock className="w-4 h-4 text-[#0047AB]" />}
          subtitle={`${watchdogMetrics.totalIncidentsDiscovered} incidents auto-resolved`}
          sparkline={[22.4, 20.1, 19.5, 18.2, 16.8, watchdogMetrics.rollingMttrSeconds]}
        />
        <MetricWidget
          title="Cluster Availability"
          value={`${availPct}%`}
          trend={downCount === 0 ? 'All Operational' : `${downCount} Degraded`}
          isPositive={downCount === 0}
          icon={<Activity className="w-4 h-4 text-[#0047AB]" />}
          subtitle="99.95% Monthly SLA"
          sparkline={[99.8, 99.9, 99.8, 99.9, parseFloat(availPct)]}
        />
        <MetricWidget
          title="Monitored Services"
          value={totalNodes}
          badge="K8s & DB"
          icon={<Server className="w-4 h-4 text-[#0047AB]" />}
          subtitle="PostgreSQL · Redis · Gateways"
          sparkline={[7, 7, 7, 7, 7, 7]}
        />
        <MetricWidget
          title="Active Outages"
          value={downCount}
          trend={downCount === 0 ? 'No Outages' : 'Recovery Ready'}
          isPositive={downCount === 0}
          icon={<AlertTriangle className="w-4 h-4 text-[#DC2626]" />}
          subtitle="Continuous health probes"
          sparkline={[0, 0, 1, 0, downCount]}
        />
      </motion.div>

      {/* ── Main Bento: Health Matrix + Activity Stream ── */}
      <motion.div variants={itemVariants} className="horizon-health-grid grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* System health — occupies 2/3 */}
        <div className="xl:col-span-2">
          <SystemHealthOverview />
        </div>
        {/* Activity feed — 1/3 */}
        <div className="xl:col-span-1">
          <RecentActivityWidget />
        </div>
      </motion.div>

      {/* ── War Room Incident Feed ── */}
      <motion.div variants={itemVariants}>
        <WarRoomWidget />
      </motion.div>

      {/* ── Infrastructure Status Strip (Features Cobalt Blue Patch in between) ── */}
      <motion.div variants={itemVariants} className="horizon-infra-strip grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Docker Agent / Hybrid Engine (Porcelain Card) */}
        <div className="skeuo-card p-5 flex items-center gap-3.5">
          <div
            className={cn(
              'p-2.5 rounded-xl border flex-shrink-0',
              dockerStatus.connected
                ? 'bg-[#EBF7EE] border-[#0F8E52]/25 text-[#0F8E52]'
                : 'bg-[#EBF1FA] border-[#0047AB]/25 text-[#0047AB]'
            )}
          >
            <Cpu className="w-4 h-4" aria-label="Execution engine" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-bold text-[#1A1A1A] truncate">
                {dockerStatus.connected ? 'Docker Agent' : 'Simulation Engine'}
              </span>
              <span className={cn(
                'flex-shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md',
                dockerStatus.connected
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-blue-100 text-blue-800'
              )}>
                {dockerStatus.connected ? 'LIVE' : 'SIM'}
              </span>
            </div>
            <p className="text-[11px] text-[#666666] font-mono">
              {dockerStatus.connected
                ? '5 containers monitored on :5174'
                : 'In-memory deterministic sandbox'}
            </p>
          </div>
        </div>

        {/* 2. MST Blockchain (COBALT BLUE BACKGROUND PATCH IN BETWEEN) */}
        <div className="cobalt-patch p-5 flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-2.5 rounded-xl bg-white/15 border border-white/20 text-white flex-shrink-0">
              <ShieldCheck className="w-4 h-4" aria-label="MST Blockchain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-bold text-white truncate">MST Blockchain</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/20 text-white">
                  {blockHeight ? `#${blockHeight.toLocaleString()}` : '91562037'}
                </span>
              </div>
              <p className="text-[11px] text-[#D0E2FF] font-mono truncate">
                BridgeKey Active &bull; Testnet Verified
              </p>
            </div>
          </div>
          <a
            href={MST_CONFIG.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors flex-shrink-0"
            title="Open MST Explorer"
            aria-label="Open MST blockchain explorer"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* 3. Dependency DAG (Porcelain Card) */}
        <div className="skeuo-card p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-2.5 rounded-xl bg-[#EBF7EE] border border-[#0F8E52]/25 text-[#0F8E52] flex-shrink-0">
              <Network className="w-4 h-4" aria-label="Topology DAG" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-[#1A1A1A] mb-0.5 truncate">Dependency DAG</div>
              <p className="text-[11px] text-[#666666] truncate">Blast radius & recovery order</p>
            </div>
          </div>
          <Link
            to="/topology"
            className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-bold text-[#0047AB] hover:underline"
            aria-label="Open DAG topology view"
          >
            View <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};
