import React, { useState, useEffect, useCallback } from 'react';
import { motion, type BezierDefinition } from 'framer-motion';
import { MetricWidget } from '../components/dashboard/MetricWidget';
import { CommandBar } from '../components/copilot/CommandBar';
import { SystemHealthOverview } from '../components/dashboard/SystemHealthOverview';
import { RecentActivityWidget } from '../components/dashboard/RecentActivityWidget';
import { WarRoomWidget } from '../components/dashboard/WarRoomWidget';
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
  CheckCircle2,
  TrendingDown,
} from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '../lib/utils';
import { Globe } from '../components/common/Globe';

const EASE: BezierDefinition = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, duration: 0.25 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE } },
};

/**
 * DashboardPage — Horizon Autonomous Resilience Operations
 * Signature two-line headline, pure white instrument cards, hairline borders.
 */
export const DashboardPage: React.FC = () => {
  const [nodes,          setNodes]          = useState<SystemNode[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [blockHeight,    setBlockHeight]    = useState<number>(0);
  const [lastCheckTime,  setLastCheckTime]  = useState('—');
  const [sreView,        setSreView]        = useState(false);
  const [watchdogMetrics, setWatchdogMetrics] = useState<WatchdogMetrics>(() => autonomousWatchdog.getMetrics());
  const [dockerStatus,   setDockerStatus]   = useState<DockerBridgeStatus>(() => dockerBridge.getStatus());

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
      const h = await mstBlockchain.getBlockHeight();
      if (h) setBlockHeight(h);
    } catch {
      /* in-memory fallback */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 5_000);
    return () => clearInterval(id);
  }, [loadData]);

  const totalNodes   = nodes.length || 7;
  const downCount    = nodes.filter((n) => n.status === 'down' || n.status === 'degraded').length;
  const healthyCount = nodes.filter((n) => n.status === 'healthy').length;
  const availPct     = totalNodes > 0 ? ((healthyCount / totalNodes) * 100).toFixed(1) : '99.9';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 text-[#0A0A0A] w-full relative"
    >
      {/* ── Signature Two-Line Header & Controls ── */}
      <motion.div variants={itemVariants} className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5E5E5] text-[11px] font-mono text-[#0A0A0A] shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse" />
            <span>MST TESTNET BLOCKCHAIN &bull; SARVAM-105B ACTIVE</span>
          </div>

          <h1 className="tracking-tight leading-[1.02]">
            <span className="block font-['Instrument_Serif',serif] font-normal text-[#A3A3A3] text-4xl sm:text-5xl lg:text-6xl">
              Autonomous Resilience,
            </span>
            <span className="block font-['Instrument_Serif',serif] italic font-normal text-[#0A0A0A] text-4xl sm:text-5xl lg:text-6xl">
              operations command.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-[#6B6B6B] max-w-xl leading-relaxed">
            Real-time DAG telemetry, cryptographic approval gates, and autonomous self-healing — polled{' '}
            <span className="font-mono text-[#0A0A0A] font-semibold">{lastCheckTime}</span>.
          </p>
        </div>

        {/* Action Strip */}
        <div className="flex flex-wrap items-center gap-2 z-10">
          {/* SRE Power View toggle */}
          <button
            onClick={() => setSreView((v) => !v)}
            className={cn(
              'h-10 px-4 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border',
              sreView
                ? 'bg-[#0A0A0A] text-white border-black'
                : 'bg-white text-[#0A0A0A] border-[#E5E5E5] hover:bg-neutral-50'
            )}
            aria-pressed={sreView}
          >
            <Terminal className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>{sreView ? 'SRE View: On' : 'SRE Power View'}</span>
          </button>

          <button
            onClick={() => autonomousWatchdog.toggleSentinel()}
            className={cn(
              'h-10 px-4 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border',
              watchdogMetrics.isSentinelActive
                ? 'bg-amber-500 text-white border-amber-600'
                : 'bg-white text-[#0A0A0A] border-[#E5E5E5] hover:bg-neutral-50'
            )}
            title="Toggle chaos injection for live evaluator demo"
          >
            <Zap className={cn('w-3.5 h-3.5', watchdogMetrics.isSentinelActive ? 'text-white' : 'text-amber-500')} />
            <span>{watchdogMetrics.isSentinelActive ? 'Sentinel Armed' : 'Chaos Sentinel'}</span>
          </button>

          <Link to="/observability">
            <button className="h-10 px-4 rounded-full bg-white hover:bg-neutral-50 text-[#0A0A0A] border border-[#E5E5E5] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs">
              <Activity className="w-3.5 h-3.5 text-red-500" />
              <span>Observability</span>
            </button>
          </Link>

          <button
            onClick={loadData}
            className="h-10 px-4 rounded-full bg-white hover:bg-neutral-50 text-[#0A0A0A] border border-[#E5E5E5] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Poll endpoints immediately"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
            <span>Refresh</span>
          </button>

          <Link to="/recovery">
            <button className="h-10 px-5 rounded-full bg-[#0A0A0A] hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Orchestrate</span>
            </button>
          </Link>
        </div>

        {/* Faint Stipple Globe Corner Motif */}
        <div className="absolute right-0 top-0 pointer-events-none opacity-20 hidden lg:block -mr-12 -mt-10">
          <Globe size="180px" crop="corner" />
        </div>
      </motion.div>

      {/* ── Status Bar / Precision Instrument Strip ── */}
      <motion.div variants={itemVariants}>
        <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-[#E5E5E5] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-4">
          {/* Nodes healthy */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-[#0A0A0A]">{healthyCount}</span>
              <span className="text-xs font-mono text-[#A3A3A3]">/{totalNodes}</span>
            </div>
            <div className="text-[11px] font-mono text-[#6B6B6B] flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-[#2DD4BF]" />
              <span>Nodes Healthy</span>
            </div>
          </div>

          <div className="hidden sm:block w-px h-8 bg-[#E5E5E5]" />

          {/* MTTR */}
          <div className="flex flex-col">
            <div className="text-2xl font-bold font-mono text-[#0A0A0A]">
              {watchdogMetrics.rollingMttrSeconds.toFixed(1)}s
            </div>
            <div className="text-[11px] font-mono text-[#6B6B6B] flex items-center gap-1 mt-0.5">
              <TrendingDown className="w-3 h-3 text-[#2DD4BF]" />
              <span>Rolling MTTR</span>
            </div>
          </div>

          <div className="hidden sm:block w-px h-8 bg-[#E5E5E5]" />

          {/* Active Incidents */}
          <div className="flex flex-col">
            <div
              className="text-2xl font-bold font-mono"
              style={{ color: downCount > 0 ? '#EF4444' : '#0A0A0A' }}
            >
              {downCount}
            </div>
            <div className="text-[11px] font-mono text-[#6B6B6B] flex items-center gap-1 mt-0.5">
              <AlertTriangle className={cn('w-3 h-3', downCount > 0 ? 'text-red-500' : 'text-[#A3A3A3]')} />
              <span>Active Incidents</span>
            </div>
          </div>

          <div className="hidden sm:block w-px h-8 bg-[#E5E5E5]" />

          {/* Gates Pending */}
          <div className="flex flex-col">
            <div className="text-2xl font-bold font-mono text-[#0A0A0A]">
              {watchdogMetrics.isSentinelActive ? '1' : '0'}
            </div>
            <div className="text-[11px] font-mono text-[#6B6B6B] flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-[#0A0A0A]" />
              <span>Gates Pending</span>
            </div>
          </div>

          <div className="hidden sm:block w-px h-8 bg-[#E5E5E5]" />

          {/* Block height */}
          <div className="flex flex-col">
            <div className="text-2xl font-bold font-mono text-[#0A0A0A]">
              {blockHeight ? `#${blockHeight.toLocaleString()}` : '—'}
            </div>
            <div className="text-[11px] font-mono text-[#6B6B6B] mt-0.5">
              <span>MST Block Height</span>
            </div>
          </div>

          <div className="hidden sm:block w-px h-8 bg-[#E5E5E5]" />

          {/* SLA Availability */}
          <div className="flex flex-col items-end">
            <div
              className="text-2xl font-bold font-mono"
              style={{ color: parseFloat(availPct) > 99 ? '#0A0A0A' : '#D97706' }}
            >
              {availPct}%
            </div>
            <div className="text-[11px] font-mono text-[#6B6B6B] mt-0.5">
              <span>SLA Availability</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Sarvam AI Copilot ── */}
      <motion.div variants={itemVariants}>
        <CommandBar />
      </motion.div>

      {/* ── Precision Metric Instruments ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricWidget
          title="Mean Time To Recovery"
          value={`${watchdogMetrics.rollingMttrSeconds.toFixed(1)}s`}
          trend={watchdogMetrics.activeStopwatchSeconds > 0 ? `Active: ${watchdogMetrics.activeStopwatchSeconds}s` : 'Optimal SLA'}
          isPositive
          icon={<Clock className="w-4 h-4 text-[#0A0A0A]" />}
          subtitle={`${watchdogMetrics.totalIncidentsDiscovered} incidents resolved`}
          sparkline={[22.4, 20.1, 19.5, 18.2, 16.8, watchdogMetrics.rollingMttrSeconds]}
        />
        <MetricWidget
          title="Cluster Availability"
          value={`${availPct}%`}
          trend={downCount === 0 ? 'All Operational' : `${downCount} Degraded`}
          isPositive={downCount === 0}
          icon={<Activity className="w-4 h-4 text-[#0A0A0A]" />}
          subtitle="99.95% Monthly SLA"
          sparkline={[99.8, 99.9, 99.8, 99.9, parseFloat(availPct)]}
        />
        <MetricWidget
          title="Monitored Services"
          value={totalNodes}
          badge="K8s & DB"
          icon={<Server className="w-4 h-4 text-[#0A0A0A]" />}
          subtitle="PostgreSQL · Redis · Gateways"
          sparkline={[7, 7, 7, 7, 7, 7]}
        />
        <MetricWidget
          title="Active Outages"
          value={downCount}
          trend={downCount === 0 ? 'No Outages' : 'Recovery Ready'}
          isPositive={downCount === 0}
          icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
          subtitle="Continuous health probes"
          sparkline={[0, 0, 1, 0, downCount]}
        />
      </motion.div>

      {/* ── Health Matrix + Activity Stream ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SystemHealthOverview />
        </div>
        <div className="xl:col-span-1">
          <RecentActivityWidget />
        </div>
      </motion.div>

      {/* ── Incident War Room ── */}
      <motion.div variants={itemVariants}>
        <WarRoomWidget />
      </motion.div>

      {/* ── Infrastructure Integration Strip ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Docker Agent */}
        <div className="bg-white p-5 rounded-[20px] border border-[#E5E5E5] flex items-center gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div
            className={cn(
              'p-2.5 rounded-xl border flex-shrink-0',
              dockerStatus.connected
                ? 'bg-neutral-100 border-[#E5E5E5] text-[#0A0A0A]'
                : 'bg-neutral-50 border-[#E5E5E5] text-[#A3A3A3]'
            )}
          >
            <Cpu className="w-5 h-5 text-[#2DD4BF]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold text-[#0A0A0A] truncate">
                {dockerStatus.connected ? 'Docker Agent' : 'Simulation Engine'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 border border-[#E5E5E5] text-[#0A0A0A]">
                {dockerStatus.connected ? 'LIVE' : 'SIM'}
              </span>
            </div>
            <p className="text-[11px] text-[#6B6B6B] font-mono">
              {dockerStatus.connected ? '5 containers on :5174' : 'Deterministic sandbox'}
            </p>
          </div>
        </div>

        {/* MST Blockchain Panel */}
        <div className="bg-white p-5 rounded-[20px] border border-[#E5E5E5] flex items-center justify-between gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-neutral-100 border border-[#E5E5E5] text-[#0A0A0A] flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#2DD4BF]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold text-[#0A0A0A] truncate">MST Blockchain</span>
                {sreView && (
                  <span className="text-[10px] font-mono bg-neutral-100 text-[#0A0A0A] px-2 py-0.5 rounded-full border border-[#E5E5E5]">
                    {blockHeight ? `#${blockHeight.toLocaleString()}` : 'Chain 91562037'}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-[#6B6B6B] truncate">
                BridgeKey Active &bull; Testnet Verified
              </p>
            </div>
          </div>
          <a
            href={MST_CONFIG.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full border border-[#E5E5E5] text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-neutral-50 transition-colors"
            title="Open MST Explorer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Dependency DAG */}
        <div className="bg-white p-5 rounded-[20px] border border-[#E5E5E5] flex items-center justify-between gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-neutral-100 border border-[#E5E5E5] text-[#0A0A0A] flex-shrink-0">
              <Network className="w-5 h-5 text-[#2DD4BF]" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#0A0A0A] mb-0.5 truncate">Dependency DAG</div>
              <p className="text-[11px] text-[#6B6B6B] truncate">Blast radius & recovery order</p>
            </div>
          </div>
          <Link
            to="/topology"
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0A0A0A] text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
          >
            <span>View</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </motion.div>

      {/* ── SRE Power View: Hashes & Technical Parameters ── */}
      {sreView && (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-6 rounded-[20px] border border-[#E5E5E5] space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#2DD4BF]" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#0A0A0A]">
              SRE Power View — Technical Graph Detail
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            {[
              { lbl: 'DAG Algorithm',      val: "Kahn's BFS Topo Sort" },
              { lbl: 'Complexity',         val: 'O(V + E)' },
              { lbl: 'MST Chain ID',       val: '91562037' },
              { lbl: 'Block Height',       val: blockHeight ? `#${blockHeight.toLocaleString()}` : '—' },
              { lbl: 'Subscription NFT',   val: '0x3EDa…BB7' },
              { lbl: 'Audit Vault',        val: '0x8192…4756' },
              { lbl: 'Watchdog Cycles',    val: watchdogMetrics.totalIncidentsDiscovered.toString() },
              { lbl: 'Sentinel Mode',      val: watchdogMetrics.isSentinelActive ? 'ARMED' : 'DISARMED' },
            ].map(({ lbl, val }) => (
              <div key={lbl} className="p-3 rounded-xl bg-[#FAFAF9] border border-[#E5E5E5] space-y-1">
                <div className="text-[10px] text-[#6B6B6B] uppercase tracking-wider">{lbl}</div>
                <div className="text-xs font-semibold text-[#0A0A0A] truncate">{val}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E5]">
            <Link
              to="/architect"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A0A0A] hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>Open AI Flow Architect</span>
            </Link>
            <Link
              to="/docs"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6B6B] hover:text-[#0A0A0A]"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>MCP & API Docs</span>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
