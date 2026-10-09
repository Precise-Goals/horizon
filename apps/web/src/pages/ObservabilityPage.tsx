import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, type BezierDefinition } from 'framer-motion';
import { Link } from 'react-router';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { clusterState } from '../engine/state';
import { notificationHub } from '../engine/notificationHub';
import { autonomousWatchdog } from '../engine/watchdog';
import { askSreAdvisor } from '../engine/sarvamAgent';
import {
  Activity,
  AlertTriangle,
  Radio,
  Zap,
  Server,
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldCheck,
  Bell,
  Clock,
  Layers,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Flame,
  ArrowRight,
  RefreshCw,
  Terminal,
  Cpu,
  Database,
  Network,
} from 'lucide-react';
import { cn } from '../lib/utils';

const EASE: BezierDefinition = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, duration: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE },
  },
};

interface TelemetryPoint {
  time: string;
  latencyMs: number;
  errorRate: number;
  cpuPercent: number;
}

interface ServiceProbe {
  id: string;
  name: string;
  type: string;
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number;
  errorRate: number;
  consecutiveMisses: number;
}

export interface ObservabilityPageProps {
  className?: string;
}

export const ObservabilityPage: React.FC<ObservabilityPageProps> = ({ className }) => {
  // Observability & Telemetry state
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>(() => {
    const points: TelemetryPoint[] = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      points.push({
        time: new Date(now - i * 2000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        latencyMs: 12 + Math.random() * 6,
        errorRate: 0.0,
        cpuPercent: 35 + Math.random() * 10,
      });
    }
    return points;
  });

  const [activeIncident, setActiveIncident] = useState<{
    id: string;
    title: string;
    severity: 'P1' | 'P2' | 'P3';
    source: 'Datadog APM' | 'Dynatrace Davis AI' | 'Prometheus Alertmanager';
    targetNode: string;
    targetName: string;
    status: 'FIRING' | 'ACKNOWLEDGED' | 'RESOLVING' | 'RESOLVED';
    blastRadius: string[];
    consecutiveMisses: number;
    detectedAt: string;
    summary: string;
  } | null>(null);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isAiAgentWorking, setIsAiAgentWorking] = useState(false);
  const [aiLogs, setAiLogs] = useState<string[]>([]);
  const [activeDrill, setActiveDrill] = useState<string>('db-primary');

  // Service probe list synced with cluster state
  const [services, setServices] = useState<ServiceProbe[]>([
    { id: 'db-primary', name: 'PostgreSQL Primary', type: 'database', status: 'healthy', latencyMs: 4.2, errorRate: 0.0, consecutiveMisses: 0 },
    { id: 'redis-cache', name: 'Redis Cache Master', type: 'cache', status: 'healthy', latencyMs: 1.8, errorRate: 0.0, consecutiveMisses: 0 },
    { id: 'kafka-queue', name: 'Kafka Event Bus', type: 'queue', status: 'healthy', latencyMs: 6.5, errorRate: 0.0, consecutiveMisses: 0 },
    { id: 'auth-service', name: 'OAuth2 / JWT Service', type: 'service', status: 'healthy', latencyMs: 14.1, errorRate: 0.0, consecutiveMisses: 0 },
    { id: 'payment-worker', name: 'Payment Worker', type: 'service', status: 'healthy', latencyMs: 18.4, errorRate: 0.0, consecutiveMisses: 0 },
    { id: 'api-gateway', name: 'Envoy API Gateway', type: 'ingress', status: 'healthy', latencyMs: 8.2, errorRate: 0.0, consecutiveMisses: 0 },
    { id: 'web-frontend', name: 'Client Portal', type: 'frontend', status: 'healthy', latencyMs: 22.0, errorRate: 0.0, consecutiveMisses: 0 },
  ]);

  // Audio synthesizer for authentic PagerDuty chime
  const playPagerChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1760, ctx.currentTime + 0.12);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.24);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // AudioContext not allowed before user interaction
    }
  }, [soundEnabled]);

  // Live telemetry ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryHistory((prev) => {
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const hasOutage = activeIncident && activeIncident.status !== 'RESOLVED';
        const newPt: TelemetryPoint = {
          time: nowStr,
          latencyMs: hasOutage ? 650 + Math.random() * 250 : 12 + Math.random() * 6,
          errorRate: hasOutage ? 0.72 + Math.random() * 0.2 : 0.0,
          cpuPercent: hasOutage ? 94 + Math.random() * 5 : 34 + Math.random() * 8,
        };
        const updated = [...prev.slice(1), newPt];
        return updated;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [activeIncident]);

  // Trigger Outage Simulation (Datadog / Dynatrace Monitor Breach)
  const triggerOutageSimulation = (nodeId: string) => {
    playPagerChime();
    const target = services.find((s) => s.id === nodeId) || services[0];

    // Compute blast radius
    const blast =
      nodeId === 'db-primary'
        ? ['redis-cache', 'auth-service', 'payment-worker', 'api-gateway', 'web-frontend']
        : nodeId === 'redis-cache'
        ? ['auth-service', 'api-gateway', 'web-frontend']
        : nodeId === 'kafka-queue'
        ? ['payment-worker', 'api-gateway']
        : ['api-gateway', 'web-frontend'];

    // Update service probes with 3-miss threshold tripped
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === nodeId) {
          return { ...s, status: 'down', latencyMs: 999.0, errorRate: 1.0, consecutiveMisses: 3 };
        }
        if (blast.includes(s.id)) {
          return { ...s, status: 'degraded', latencyMs: 340.0, errorRate: 0.45, consecutiveMisses: 1 };
        }
        return s;
      })
    );

    // Set cluster state in background
    clusterState.setNodeStatus(nodeId, 'down');

    // Declare PagerDuty Alert
    const incidentId = `PD-${Math.floor(1000 + Math.random() * 9000)}`;
    setActiveIncident({
      id: incidentId,
      title: `[CRITICAL] APM SLO Breach: Latency > 500ms & Probe Timeout on ${target.name}`,
      severity: 'P1',
      source: 'Datadog APM',
      targetNode: target.id,
      targetName: target.name,
      status: 'FIRING',
      blastRadius: blast,
      consecutiveMisses: 3,
      detectedAt: new Date().toLocaleTimeString(),
      summary: `Synthetic sliding-window health probe tripped 3/3 missed heartbeats. APM latency spiked to 999ms with 100% error rate. Cascading impact across ${blast.length} downstream microservices.`,
    });

    // Notify notificationHub
    notificationHub.broadcastIncident({
      id: incidentId,
      nodeId: target.id,
      nodeName: target.name,
      type: target.type,
      timestamp: new Date().toISOString(),
      severity: 'critical',
    });

    setAiLogs([
      `🚨 [DATADOG APM MONITOR FIRING] Incident ${incidentId} declared on ${target.name}.`,
      `[PROBE SENTINEL] 3 consecutive missed probes detected. Flapping guard cleared.`,
      `[PAGERDUTY INTEGRATION] Escalation Policy Level 1 triggered: Paging Primary SRE On-Call.`,
      `[BLAST RADIUS] Upstream failure propagating to: ${blast.join(', ')}.`,
      `[ACTION REQUIRED] Click "Tell AI Agent to Remediate" or trigger autonomous playbooks.`,
    ]);
  };

  // "Tell AI Agent To Do That Stuff" — Autonomous AI Remediation Action
  const executeAiAgentRemediation = async () => {
    if (!activeIncident || isAiAgentWorking) return;
    setIsAiAgentWorking(true);

    const appendLog = (msg: string) => {
      setAiLogs((prev) => [...prev, msg]);
    };

    appendLog('🤖 [AI AGENT SENTINEL] Agent activated. Ingesting Datadog APM anomaly stream...');
    await new Promise((r) => setTimeout(r, 700));

    appendLog('🔍 [KAHN TOPOLOGY AUDIT] Calculating dependency graph levels O(V+E)...');
    appendLog(`📍 [ROOT CAUSE IDENTIFIED] Single Point of Failure (SPOF) verified at "${activeIncident.targetNode}".`);
    await new Promise((r) => setTimeout(r, 800));

    appendLog('📋 [PLAYBOOK SYNTHESIS] Formulating bottom-up recovery tiers:');
    appendLog('   Tier 0: Database replica failover & point-in-time recovery');
    appendLog('   Tier 1: Cache warm & Kafka queue consumer rebalance');
    appendLog('   Tier 2: Ingress routing & traffic cutover');
    await new Promise((r) => setTimeout(r, 800));

    appendLog('🔐 [EIP-712 GOVERNANCE GATE] Requesting Commander cryptographic authorization...');
    appendLog('   Smart Contract: 0x3EDad230dCFc6Dd3C357490b9feDa49639646BB7 (MST Chain 91562037)');
    appendLog('   Simulating valid EIP-712 Commander signature: 0x73595081334A18D4298A160b162faB4Fb4B3c85B');
    await new Promise((r) => setTimeout(r, 900));

    appendLog('⚡ [PLAYBOOK EXECUTION] Executing Tier 0 failover. Standby replica promoted to PRIMARY.');
    clusterState.setNodeStatus(activeIncident.targetNode, 'healthy');
    await new Promise((r) => setTimeout(r, 700));

    appendLog('🔄 [CACHE PURGE & WARMING] Redis session store refreshed. Latency normalizing...');
    setServices((prev) =>
      prev.map((s) => ({
        ...s,
        status: 'healthy',
        latencyMs: s.id === 'db-primary' ? 4.2 : s.id === 'redis-cache' ? 1.8 : 12.0,
        errorRate: 0.0,
        consecutiveMisses: 0,
      }))
    );
    await new Promise((r) => setTimeout(r, 800));

    appendLog('📊 [TELEMETRY VERIFICATION] Datadog probes report 100% nominal across all 7 nodes.');
    appendLog('✅ [PAGERDUTY AUTO-RESOLVE] Resolving Incident ' + activeIncident.id + '. MTTR stopwatch: 24.8s.');
    appendLog('📜 [ON-CHAIN AUDIT LOG] Cryptographic Merkle audit proof anchored to MST Blockchain.');

    setActiveIncident((prev) => (prev ? { ...prev, status: 'RESOLVED' } : null));
    setIsAiAgentWorking(false);
  };

  // Reset to Baseline
  const resetToNominal = () => {
    setActiveIncident(null);
    setIsAiAgentWorking(false);
    setServices((prev) =>
      prev.map((s) => ({
        ...s,
        status: 'healthy',
        latencyMs: s.id === 'db-primary' ? 4.2 : s.id === 'redis-cache' ? 1.8 : 12.0,
        errorRate: 0.0,
        consecutiveMisses: 0,
      }))
    );
    setAiLogs([
      '🟢 [SYSTEM NOMINAL] All Datadog APM and Dynatrace probes operating within SLA (<15ms).',
      'Continuous watchdog sliding-window loop active (evaluating 3 consecutive probe thresholds).',
    ]);
  };

  const isFiring = activeIncident && activeIncident.status !== 'RESOLVED';
  const latestTelemetry = telemetryHistory[telemetryHistory.length - 1] || { latencyMs: 12, errorRate: 0, cpuPercent: 35 };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('horizon-observability-page space-y-6 sm:space-y-8 font-sans w-full max-w-7xl mx-auto pb-16', className)}
    >
      {/* Breadcrumb Navigation & Sound Switch */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#EADCC9] pb-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-[#6E6258]">
          <Link to="/" className="hover:text-[#0047AB] transition-colors">
            Horizon
          </Link>
          <span>/</span>
          <span className="text-[#8A7B6D]">Platform</span>
          <span>/</span>
          <span className="text-[#1A1A1A] font-bold">Observability & Detection Hub</span>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FAF3EA] border border-[#E5D7C5] hover:bg-[#F4EBE0] transition-colors text-[#5A4E44] cursor-pointer"
            title="Toggle PagerDuty alert sound chime"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#0047AB]" /> : <VolumeX className="w-3.5 h-3.5 text-stone-400" />}
            <span>Alert Audio: {soundEnabled ? 'ON' : 'MUTED'}</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-emerald-800 font-bold">Datadog & Dynatrace Stream Active</span>
          </div>
        </div>
      </motion.div>

      {/* Hero Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1A1A1A]">
              Telemetry & Failure Detection Hub
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#0047AB]/10 text-[#0047AB] border border-[#0047AB]/20 shadow-xs">
              <Activity className="w-3.5 h-3.5 text-[#0047AB]" />
              APM OBSERVABILITY & PAGERDUTY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5A4E44] mt-1.5 max-w-3xl leading-relaxed font-medium">
            Real-time infrastructure monitoring inspired by Datadog APM and Dynatrace Davis AI.
            Evaluates 3-consecutive-miss sliding window health probes to prevent alert flapping, fires live PagerDuty P1 incident alerts, and triggers autonomous AI SRE self-healing.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => triggerOutageSimulation(activeDrill)}
            className="skeuo-btn-danger inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md cursor-pointer"
          >
            <Flame className="w-4 h-4 text-white animate-bounce" />
            <span>Simulate Failure Breach</span>
          </button>

          <button
            onClick={resetToNominal}
            className="skeuo-btn-secondary inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[#5A4E44] hover:text-[#1A1A1A] cursor-pointer"
            title="Reset telemetry to baseline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </motion.div>

      {/* PagerDuty Live Emergency Alert Banner (Shown when incident firing) */}
      <AnimatePresence>
        {isFiring && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="p-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-xl border-2 border-red-700 relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-red-700 font-mono font-black text-xs animate-pulse">
                    PAGERDUTY P1 CRITICAL
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-black/30 font-mono text-xs font-bold">
                    Incident #{activeIncident?.id}
                  </span>
                  <span className="text-xs text-white/90 font-mono font-semibold">
                    Source: {activeIncident?.source}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-tight">{activeIncident?.title}</h3>
                <p className="text-xs text-white/90 leading-relaxed font-medium max-w-3xl">
                  {activeIncident?.summary}
                </p>
                <div className="text-[11px] font-mono text-white/80 pt-1">
                  <strong>Blast Radius Impact:</strong> {activeIncident?.blastRadius.join(' → ')}
                </div>
              </div>

              {/* The "Tell AI Agent To Do That Stuff" button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                <button
                  onClick={executeAiAgentRemediation}
                  disabled={isAiAgentWorking}
                  className="px-5 py-3 rounded-xl bg-white text-[#0047AB] font-black text-xs sm:text-sm hover:bg-stone-100 transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-[#0047AB] group-hover:scale-110 transition-transform" />
                  <span>{isAiAgentWorking ? 'AI Agent Healing Cluster...' : '🤖 Tell AI Agent to Remediate'}</span>
                </button>

                <button
                  onClick={resetToNominal}
                  className="px-3.5 py-3 rounded-xl bg-black/40 text-white font-bold text-xs hover:bg-black/60 transition-all cursor-pointer"
                >
                  Acknowledge & Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bento Grid: Real-Time APM Observability Stream */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: APM Latency */}
        <Card className="p-4 sm:p-5 skeuo-card border-[#E5D7C5] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6E6258] font-medium">
            <span>Cluster Roundtrip Latency</span>
            <Activity className="w-4 h-4 text-[#0047AB]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn('text-3xl font-black font-mono', isFiring ? 'text-rose-600 animate-pulse' : 'text-[#1A1A1A]')}>
              {latestTelemetry.latencyMs.toFixed(1)}ms
            </span>
            <span className="text-[11px] font-mono text-[#6E6258]">
              {isFiring ? '⚠️ +7,800% Spike' : 'SLA Target < 50ms'}
            </span>
          </div>
          {/* Mini latency sparkline bar */}
          <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
            <div
              className={cn('h-full transition-all duration-500', isFiring ? 'bg-rose-500 w-full' : 'bg-emerald-500 w-[24%]')}
            />
          </div>
        </Card>

        {/* Metric 2: Error Rate */}
        <Card className="p-4 sm:p-5 skeuo-card border-[#E5D7C5] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6E6258] font-medium">
            <span>APM Error Rate (5xx)</span>
            <AlertTriangle className={cn('w-4 h-4', isFiring ? 'text-rose-600' : 'text-emerald-600')} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn('text-3xl font-black font-mono', isFiring ? 'text-rose-600' : 'text-emerald-700')}>
              {(latestTelemetry.errorRate * 100).toFixed(1)}%
            </span>
            <span className="text-[11px] font-mono text-[#6E6258]">
              {isFiring ? 'CRITICAL BREACH' : 'Nominal 0.00%'}
            </span>
          </div>
          <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
            <div
              className={cn('h-full transition-all duration-500', isFiring ? 'bg-rose-500 w-[85%]' : 'bg-emerald-500 w-0')}
            />
          </div>
        </Card>

        {/* Metric 3: Sliding-Window Watchdog */}
        <Card className="p-4 sm:p-5 skeuo-card border-[#E5D7C5] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6E6258] font-medium">
            <span>3-Miss Watchdog Threshold</span>
            <ShieldCheck className="w-4 h-4 text-[#0047AB]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn('text-3xl font-black font-mono', isFiring ? 'text-rose-600' : 'text-[#0047AB]')}>
              {isFiring ? '3 / 3' : '0 / 3'}
            </span>
            <span className="text-[11px] font-mono text-[#6E6258]">
              {isFiring ? 'Outage Declared' : 'Zero Flapping'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <span className={cn('h-2 flex-1 rounded-full', isFiring ? 'bg-rose-500' : 'bg-emerald-400')} />
            <span className={cn('h-2 flex-1 rounded-full', isFiring ? 'bg-rose-500' : 'bg-emerald-400')} />
            <span className={cn('h-2 flex-1 rounded-full', isFiring ? 'bg-rose-500' : 'bg-emerald-400')} />
          </div>
        </Card>

        {/* Metric 4: PagerDuty On-Call State */}
        <Card className="p-4 sm:p-5 skeuo-card border-[#E5D7C5] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6E6258] font-medium">
            <span>PagerDuty Escalation</span>
            <Bell className={cn('w-4 h-4', isFiring ? 'text-rose-600 animate-bounce' : 'text-stone-400')} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn('text-2xl font-black font-mono', isFiring ? 'text-rose-600' : 'text-[#1A1A1A]')}>
              {isFiring ? 'LEVEL 1 PAGED' : 'STANDBY'}
            </span>
          </div>
          <p className="text-[11px] font-mono text-[#6E6258] truncate">
            {isFiring ? 'SRE On-Call notified via Push' : 'Auto-Healing Sentinel Armed'}
          </p>
        </Card>
      </motion.div>

      {/* Main Split: Real-Time Telemetry Graph & Service Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live APM Latency & Error Jitter Wave */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 sm:p-6 skeuo-card border-[#E5D7C5] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#EADCC9] gap-2">
              <div>
                <h3 className="text-base font-bold text-[#1A1A1A] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#0047AB]" />
                  <span>Datadog APM Live Latency Waveform</span>
                </h3>
                <p className="text-xs text-[#6E6258] font-medium">
                  Streaming telemetry jitter sampled every 2000ms. Demonstrates instant anomaly discovery.
                </p>
              </div>

              {/* Chaos Drill Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#8A7B6D] font-bold">Target Service:</span>
                <select
                  value={activeDrill}
                  onChange={(e) => setActiveDrill(e.target.value)}
                  className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-[#FAF3EA] border border-[#E5D7C5] text-[#1A1A1A] cursor-pointer"
                >
                  <option value="db-primary">db-primary (PostgreSQL)</option>
                  <option value="redis-cache">redis-cache (Redis)</option>
                  <option value="kafka-queue">kafka-queue (Kafka)</option>
                  <option value="auth-service">auth-service (OAuth2)</option>
                  <option value="payment-worker">payment-worker (Worker)</option>
                </select>
              </div>
            </div>

            {/* Dynamic Latency SVG Wave Graph */}
            <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-black shadow-inner space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <strong className="text-white">Telemetry Latency (ms)</strong>
                </span>
                <span className="text-cyan-400 font-bold">{latestTelemetry.latencyMs.toFixed(1)} ms</span>
              </div>

              {/* Render dynamic SVG polygon wave */}
              <div className="h-40 w-full relative overflow-hidden flex items-end">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="30" x2="400" y2="30" stroke="#333" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="400" y2="60" stroke="#333" strokeDasharray="3 3" />
                  <line x1="0" y1="90" x2="400" y2="90" stroke="#333" strokeDasharray="3 3" />

                  {/* Latency line path */}
                  <polyline
                    fill="none"
                    stroke={isFiring ? '#F43F5E' : '#22D3EE'}
                    strokeWidth="2.5"
                    points={telemetryHistory
                      .map((pt, idx) => {
                        const x = (idx / (telemetryHistory.length - 1)) * 400;
                        // Map 0 - 1000ms to 120 - 10
                        const clamped = Math.min(Math.max(pt.latencyMs, 10), 1000);
                        const y = 120 - (clamped / 1000) * 110;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />
                </svg>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 pt-1 border-t border-stone-800">
                <span>{telemetryHistory[0]?.time}</span>
                <span>Real-Time Stream Buffer (21 intervals)</span>
                <span>{telemetryHistory[telemetryHistory.length - 1]?.time}</span>
              </div>
            </div>

            {/* Sliding-Window Detection Explanation Card */}
            <div className="p-4 rounded-xl bg-[#FAF3EA] border border-[#E5D7C5] text-xs text-[#5A4E44] leading-relaxed space-y-1">
              <strong className="text-[#1A1A1A] block">💡 How Horizon Prevents Alert Flapping:</strong>
              <p>
                Unlike basic monitors that alert on a single transient blip, Horizon requires <strong>3 consecutive missed probes</strong> within a sliding window before transitioning a service to <code>DOWN</code>. Once declared, Kahn&apos;s algorithm immediately stages bottom-up recovery.
              </p>
            </div>
          </Card>

          {/* Microservices Probe Status Matrix */}
          <Card className="p-5 sm:p-6 skeuo-card border-[#E5D7C5] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADCC9]">
              <div>
                <h3 className="text-base font-bold text-[#1A1A1A] flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#0047AB]" />
                  <span>Dynatrace OneAgent Distributed Probe Matrix</span>
                </h3>
                <p className="text-xs text-[#6E6258] font-medium">
                  Continuous synthetic probes evaluating latency SLA and consecutive failure counters.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E5D7C5] bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF3EA] border-b border-[#EADCC9] text-[#6E6258] font-mono text-[11px] font-bold">
                    <th className="p-3">Service Node</th>
                    <th className="p-3">Layer</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">APM Latency</th>
                    <th className="p-3">Error Rate</th>
                    <th className="p-3">Misses (3-max)</th>
                    <th className="p-3 text-right">Drill</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EBE0] font-mono text-[11px]">
                  {services.map((svc) => (
                    <tr key={svc.id} className="hover:bg-[#FFF8F0] transition-colors">
                      <td className="p-3 font-bold text-[#1A1A1A]">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'w-2 h-2 rounded-full',
                              svc.status === 'healthy'
                                ? 'bg-emerald-500'
                                : svc.status === 'degraded'
                                ? 'bg-amber-500'
                                : 'bg-rose-500 animate-pulse'
                            )}
                          />
                          <span>{svc.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-[#6E6258] uppercase text-[10px]">{svc.type}</td>
                      <td className="p-3">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-bold uppercase border',
                            svc.status === 'healthy'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : svc.status === 'degraded'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          )}
                        >
                          {svc.status}
                        </span>
                      </td>
                      <td className="p-3 text-[#1A1A1A] font-bold">{svc.latencyMs.toFixed(1)}ms</td>
                      <td className="p-3 text-[#5A4E44]">{(svc.errorRate * 100).toFixed(0)}%</td>
                      <td className="p-3">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-bold',
                            svc.consecutiveMisses >= 3
                              ? 'bg-rose-100 text-rose-800'
                              : svc.consecutiveMisses > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-600'
                          )}
                        >
                          {svc.consecutiveMisses}/3
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => triggerOutageSimulation(svc.id)}
                          className="px-2 py-1 rounded bg-[#FAF3EA] hover:bg-[#F4EBE0] border border-[#E5D7C5] text-[#0047AB] font-bold text-[10px] cursor-pointer"
                        >
                          Fail Node
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column (1 Col): AI SRE Sentinel Live Action Terminal */}
        <div className="space-y-6">
          <Card className="p-5 sm:p-6 skeuo-card border-[#E5D7C5] space-y-4 flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADCC9]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0047AB]" />
                <h3 className="text-base font-bold text-[#1A1A1A]">Autonomous AI Sentinel Console</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EBF1FA] text-[#0047AB] font-bold">
                SARVAM AI-105B
              </span>
            </div>

            <p className="text-xs text-[#5A4E44] font-medium leading-relaxed">
              When an APM anomaly or PagerDuty alert fires, the AI Agent correlates the root cause via Kahn DAG sequencing, requests cryptographic EIP-712 clearance, and executes autonomous self-healing.
            </p>

            {/* Quick Action Button */}
            <button
              onClick={executeAiAgentRemediation}
              disabled={isAiAgentWorking || !isFiring}
              className={cn(
                'w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer',
                isFiring
                  ? 'bg-[#0047AB] hover:bg-[#003680] text-white animate-pulse'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
              )}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isAiAgentWorking
                  ? 'Executing Autonomous Recovery...'
                  : isFiring
                  ? '🤖 Tell AI Agent to Remediate Now'
                  : 'System Nominal (Trigger Failure Above)'}
              </span>
            </button>

            {/* Live Streaming Reasoning Terminal */}
            <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-black shadow-inner flex-1 min-h-[360px] flex flex-col justify-between font-mono text-[11px] text-cyan-300 overflow-hidden">
              <div className="space-y-2 overflow-y-auto max-h-[340px] pr-1">
                <div className="text-stone-400 text-[10px] pb-1 border-b border-stone-800 flex items-center justify-between">
                  <span>HORIZON AI SRE AGENT v2.4</span>
                  <span className="text-emerald-400 font-bold">● LIVE TERMINAL</span>
                </div>

                {aiLogs.length === 0 ? (
                  <p className="text-stone-500 italic pt-4">
                    Awaiting anomaly detection event... Trigger a failure breach to observe live AI SRE correlation and remediation.
                  </p>
                ) : (
                  aiLogs.map((log, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        'leading-relaxed break-words',
                        log.includes('🚨')
                          ? 'text-rose-400 font-bold'
                          : log.includes('✅')
                          ? 'text-emerald-300 font-bold'
                          : log.includes('🤖')
                          ? 'text-amber-300 font-bold'
                          : log.includes('🔐')
                          ? 'text-purple-300'
                          : 'text-cyan-300'
                      )}
                    >
                      {log}
                    </motion.div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-stone-800 text-[10px] text-stone-400 flex items-center justify-between">
                <span>Autonomous Sentinel Loop</span>
                <span className="text-emerald-400">Armed</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
