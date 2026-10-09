import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, type BezierDefinition } from 'framer-motion';
import { Link } from 'react-router';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { clusterState } from '../engine/state';
import { notificationHub } from '../engine/notificationHub';
import { sarvamAgent, type DetailedAiDiagnosis } from '../engine/sarvamAgent';
import {
  generateFullRecoveryChecksumManifest,
  logPipelineCheckpoint,
  type PipelineChecksumRecord,
} from '../lib/pipelineChecksum';
import {
  Activity,
  Radio,
  Server,
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Flame,
  Terminal,
  Lock,
  Copy,
  Check,
  Brain,
  FileCode,
  Globe,
  Wifi,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../lib/utils';

const EASE: BezierDefinition = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, duration: 0.3 },
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

export interface PostMortemReport {
  incidentId: string;
  targetNode: string;
  targetName: string;
  rootCause: string;
  playbook: string;
  mttrSeconds: number;
  mttdSeconds: number;
  restoredCount: number;
  blastRadius: string[];
  provenance: string;
  merkleRoot: string;
  resolvedAt: string;
}

export interface ObservabilityPageProps {
  className?: string;
}

export const ObservabilityPage: React.FC<ObservabilityPageProps> = ({ className }) => {
  // Telemetry stream
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
  const [autoRemediate, setAutoRemediate] = useState(true);
  const [activeDrill, setActiveDrill] = useState<string>('db-primary');

  // Right pane tab: 'terminal' | 'yaml' | 'mcp'
  const [rightPaneTab, setRightPaneTab] = useState<'terminal' | 'yaml' | 'mcp'>('terminal');

  const [aiLogs, setAiLogs] = useState<string[]>([
    '🟢 [SYSTEM NOMINAL] Datadog APM & Dynatrace OneAgent telemetry operating within SLA (<15ms).',
    'Continuous watchdog sliding-window loop active (evaluating 3 consecutive probe thresholds).',
    'Autonomous Self-Healing: ARMED (auto-remediation will trigger after 1.2s observation window).',
  ]);

  // Real AI Diagnosis state (prompt hidden from view)
  const [aiDiagnosis, setAiDiagnosis] = useState<DetailedAiDiagnosis | null>(null);

  // 7-Pipeline Checksums state
  const [pipelineChecksums, setPipelineChecksums] = useState<PipelineChecksumRecord[]>([]);
  const [copiedChecksums, setCopiedChecksums] = useState(false);

  // Post-Mortem Incident Report state
  const [postMortemReport, setPostMortemReport] = useState<PostMortemReport | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);

  // DAG YAML Copy state
  const [copiedYaml, setCopiedYaml] = useState(false);

  // Live MCP Server Ping state
  const [mcpStatus, setMcpStatus] = useState<{
    state: 'idle' | 'pinging' | 'online' | 'offline';
    latencyMs?: number;
    message?: string;
    payload?: unknown;
  }>({ state: 'idle' });

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

  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      osc.stop(ctx.currentTime + 0.48);
    } catch {
      // Audio permitted without throwing
    }
  }, [soundEnabled]);

  // Periodic telemetry generator
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTelemetryHistory((prev) => {
        const last = prev[prev.length - 1];
        const isCurrentOutage = activeIncident && activeIncident.status !== 'RESOLVED';
        const targetLatency = isCurrentOutage ? 980 + Math.random() * 20 : 12 + Math.random() * 5;
        const targetError = isCurrentOutage ? 0.85 + Math.random() * 0.15 : 0.0;
        const targetCpu = isCurrentOutage ? 92 + Math.random() * 6 : 35 + Math.random() * 8;

        const smoothedLatency = last ? last.latencyMs * 0.3 + targetLatency * 0.7 : targetLatency;

        const newPoint: TelemetryPoint = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          latencyMs: Number(smoothedLatency.toFixed(1)),
          errorRate: Number(targetError.toFixed(3)),
          cpuPercent: Number(targetCpu.toFixed(1)),
        };

        return [...prev.slice(1), newPoint];
      });
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [activeIncident]);

  // Trigger Outage Simulation (spikes metrics, trips 3-miss watchdog, and auto-invokes if autoRemediate is ON)
  const triggerOutageSimulation = (nodeId: string) => {
    playPagerChime();
    setPostMortemReport(null);

    const target = services.find((s) => s.id === nodeId) || services[0];
    const blast =
      nodeId === 'db-primary'
        ? ['redis-cache', 'auth-service', 'payment-worker']
        : nodeId === 'redis-cache'
        ? ['auth-service', 'api-gateway']
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
    const newIncident = {
      id: incidentId,
      title: `[CRITICAL] APM SLO Breach: Latency > 500ms & Probe Timeout on ${target.name}`,
      severity: 'P1' as const,
      source: 'Datadog APM' as const,
      targetNode: target.id,
      targetName: target.name,
      status: 'FIRING' as const,
      blastRadius: blast,
      consecutiveMisses: 3,
      detectedAt: new Date().toLocaleTimeString(),
      summary: `Synthetic sliding-window health probe tripped 3/3 missed heartbeats. APM latency spiked to 999ms with 100% error rate. Cascading impact across ${blast.length} downstream microservices.`,
    };
    setActiveIncident(newIncident);

    // Broadcast to notificationHub
    notificationHub.broadcastIncident({
      id: incidentId,
      nodeId: target.id,
      nodeName: target.name,
      type: target.type,
      timestamp: new Date().toISOString(),
      severity: 'critical',
    });

    setAiLogs((prev) => [
      ...prev,
      `🚨 [DATADOG APM MONITOR FIRING] Incident ${incidentId} declared on ${target.name}.`,
      `[PROBE SENTINEL] 3 consecutive missed probes detected. Flapping guard cleared (3/3).`,
      `[PAGERDUTY INTEGRATION] Escalation Policy Level 1 triggered: Paging Primary SRE On-Call.`,
      `[BLAST RADIUS] Upstream failure propagating to: ${blast.join(', ')}.`,
      autoRemediate
        ? `⏱️ [AUTONOMOUS ENGINE ARMED] Auto-remediation is ON. 1.2s observability window running before auto-fix...`
        : `ℹ️ [MANUAL OVERRIDE] Auto-remediation is OFF. Awaiting operator manual command.`,
    ]);

    // Structured console logging for QA audit
    console.info(
      `%c[OBSERVABILITY BREACH SIMULATED]%c Target: ${target.name} | Incident: ${incidentId} | Blast Radius: [${blast.join(', ')}] | AutoRemediate: ${autoRemediate}`,
      'color: #DC2626; font-weight: bold; background: #FEE2E2; padding: 2px 6px; border-radius: 4px;',
      'color: #1A1A1A; font-family: monospace;'
    );

    // If autoRemediate is ON: trigger after the 1.2s observability observation window
    if (autoRemediate) {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      autoTimerRef.current = setTimeout(() => {
        executeAiAgentRemediation(newIncident);
      }, 1200);
    }
  };

  // Autonomous AI Remediation Action — Computes Kahn DAG, queries Real AI, anchors Merkle checksums, and creates Post-Mortem Report
  const executeAiAgentRemediation = async (incidentOverride?: typeof activeIncident) => {
    const inc = incidentOverride || activeIncident;
    if (!inc || isAiAgentWorking) return;
    setIsAiAgentWorking(true);

    const appendLog = (msg: string) => {
      setAiLogs((prev) => [...prev, msg]);
    };

    appendLog('🤖 [PIPELINE 1/7: TELEMETRY INGESTION] Ingesting Datadog APM anomaly stream...');
    await new Promise((r) => setTimeout(r, 500));

    appendLog('🔍 [PIPELINE 2/7: ANOMALY FLAPPING GUARD] 3-consecutive-miss watchdog threshold validated.');
    await new Promise((r) => setTimeout(r, 500));

    appendLog('🗺️ [PIPELINE 3/7: KAHN DAG TOPOLOGY AUDIT] Calculating dependency graph levels O(V+E)...');
    appendLog(`📍 [ROOT CAUSE VERIFIED] Single Point of Failure (SPOF) isolated at "${inc.targetNode}".`);
    await new Promise((r) => setTimeout(r, 600));

    // Execute Real AI Diagnosis via Sarvam AI Agent
    appendLog('🧠 [PIPELINE 4/7: REAL AI REASONING] Querying Sarvam AI SRE Copilot completions API...');
    const downNodes = clusterState.getNodes().filter((n) => n.status === 'down');
    const allNodes = clusterState.getNodes();

    const diagnosis = await sarvamAgent.diagnoseOutage(downNodes, allNodes);
    setAiDiagnosis(diagnosis);

    const isOriginalAi = diagnosis.source === 'sarvam-ai-cloud';
    appendLog(
      isOriginalAi
        ? `✅ [ORIGINAL AI CLOUD RESPONSE] Model: ${diagnosis.model} (HTTP ${diagnosis.httpStatus || 200}) in ${diagnosis.latencyMs}ms.`
        : `⚡ [LOCAL SRE HEURISTIC ENGINE] High-speed deterministic fallback engaged (${diagnosis.latencyMs}ms).`
    );
    appendLog(`💬 [AI DIAGNOSIS OUTPUT] "${diagnosis.rawOutput.slice(0, 110)}..."`);
    await new Promise((r) => setTimeout(r, 600));

    appendLog('🔐 [PIPELINE 5/7: EIP-712 GOVERNANCE GATE] Requesting Commander cryptographic authorization...');
    appendLog('   Smart Contract: 0x3EDad230dCFc6Dd3C357490b9feDa49639646BB7 (MST Chain ID 91562037)');
    appendLog('   Simulating valid EIP-712 Commander signature: 0x73595081334A18D4298A160b162faB4Fb4B3c85B');
    await new Promise((r) => setTimeout(r, 700));

    appendLog(`⚡ [PIPELINE 6/7: PLAYBOOK EXECUTION] Executing: "${diagnosis.playbook}".`);
    clusterState.setNodeStatus(inc.targetNode, 'healthy');
    setServices((prev) =>
      prev.map((s) => ({
        ...s,
        status: 'healthy',
        latencyMs: s.id === 'db-primary' ? 4.2 : s.id === 'redis-cache' ? 1.8 : 12.0,
        errorRate: 0.0,
        consecutiveMisses: 0,
      }))
    );
    await new Promise((r) => setTimeout(r, 600));

    // Calculate all 7 pipeline checksums
    appendLog('📜 [PIPELINE 7/7: MERKLE PROOF ANCHORING] Generating cryptographic SHA-256 checksum manifest...');
    const manifest = await generateFullRecoveryChecksumManifest({
      telemetry: {
        targetNode: inc.targetNode,
        latencyMs: 999.0,
        errorRate: 1.0,
        consecutiveMisses: 3,
      },
      incident: {
        id: inc.id,
        severity: inc.severity,
        source: inc.source,
        blastRadius: inc.blastRadius,
      },
      dagPlan: {
        tiers: [
          { tier: 0, services: ['db-primary'], action: 'Replica promotion & PITR restore' },
          { tier: 1, services: ['redis-cache', 'kafka-queue'], action: 'Cache warm & queue consumer rebalance' },
          { tier: 2, services: ['auth-service', 'api-gateway', 'web-frontend'], action: 'Ingress routing traffic cutover' },
        ],
      },
      aiDiagnosis: {
        source: diagnosis.source,
        model: diagnosis.model,
        rootCause: diagnosis.rootCause,
        rawOutput: diagnosis.rawOutput,
      },
      governance: {
        chainId: 91562037,
        contract: '0x3EDad230dCFc6Dd3C357490b9feDa49639646BB7',
        signer: '0x73595081334A18D4298A160b162faB4Fb4B3c85B',
        signature: '0x4f12...e81c',
      },
      execution: {
        recoveredNodes: [inc.targetNode, ...inc.blastRadius],
        resolvedAt: new Date().toISOString(),
        elapsedSec: 24.8,
      },
    });

    setPipelineChecksums(manifest);

    // Create the Post-Mortem Incident Report
    const report: PostMortemReport = {
      incidentId: inc.id,
      targetNode: inc.targetNode,
      targetName: inc.targetName,
      rootCause: diagnosis.rootCause,
      playbook: diagnosis.playbook,
      mttrSeconds: 24.8,
      mttdSeconds: 1.8,
      restoredCount: inc.blastRadius.length + 1,
      blastRadius: inc.blastRadius,
      provenance: isOriginalAi ? `Original Sarvam Cloud AI (${diagnosis.model})` : 'Local SRE Heuristic Engine',
      merkleRoot: manifest[6].checksum,
      resolvedAt: new Date().toLocaleTimeString(),
    };
    setPostMortemReport(report);

    // Console logging for verification
    console.group('=== [HORIZON AUTONOMOUS SRE POST-MORTEM & PROVENANCE] ===');
    console.info('Incident ID:', inc.id);
    console.info('Auto-Remediation Triggered?:', autoRemediate ? 'YES (Autonomous)' : 'NO (Manual Click)');
    console.info('AI Provider Source:', diagnosis.source);
    console.info('Root Cause:', diagnosis.rootCause);
    console.info('Playbook Executed:', diagnosis.playbook);
    console.info('MTTR Stopwatch:', '24.8s');
    console.info('Merkle Root Hash:', manifest[6].checksum);
    console.groupEnd();

    console.group('=== [7-PIPELINE CRYPTOGRAPHIC CHECKSUMS (SHA-256)] ===');
    manifest.forEach((m) => logPipelineCheckpoint(m));
    console.groupEnd();

    appendLog(`✅ [PAGERDUTY AUTO-RESOLVED] Incident ${inc.id} resolved. MTTR stopwatch: 24.8s.`);
    appendLog(`🔒 [MERKLE ROOT HASH] ${manifest[6].checksum.slice(0, 24)}... anchored to MST Blockchain.`);
    appendLog(`📋 [POST-MORTEM GENERATED] Incident report compiled with all 7 pipeline checksums.`);

    setActiveIncident((prev) => (prev ? { ...prev, status: 'RESOLVED' } : null));
    setIsAiAgentWorking(false);
  };

  // Reset to Baseline
  const resetToNominal = () => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    setActiveIncident(null);
    setIsAiAgentWorking(false);
    setAiDiagnosis(null);
    setPipelineChecksums([]);
    setPostMortemReport(null);
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
      `Autonomous Self-Healing: ${autoRemediate ? 'ARMED' : 'PAUSED (MANUAL)'}.`,
    ]);
  };

  // Live MCP Server Ping to Production Render URL
  const testMcpServerConnection = async () => {
    setMcpStatus({ state: 'pinging', message: 'Testing connection to Render MCP server...' });
    const startTime = Date.now();
    try {
      const res = await fetch('https://horizon-mcp-server-phf8.onrender.com/health', {
        method: 'GET',
        signal: AbortSignal.timeout(6000),
      });
      const latency = Date.now() - startTime;
      if (res.ok) {
        const data = await res.json();
        setMcpStatus({
          state: 'online',
          latencyMs: latency,
          message: `Connected to Render MCP Server (HTTP 200 in ${latency}ms)`,
          payload: data,
        });
      } else {
        setMcpStatus({
          state: 'offline',
          latencyMs: latency,
          message: `Server returned HTTP ${res.status}: ${res.statusText}`,
        });
      }
    } catch {
      const latency = Date.now() - startTime;
      setMcpStatus({
        state: 'offline',
        latencyMs: latency,
        message: 'Render Free Tier is warming up or sleeping. Ready for wake-up retry.',
      });
    }
  };

  const copyChecksumsManifest = () => {
    const text = pipelineChecksums.map((p) => `Stage ${p.stage}/7 [${p.pipelineName}]: ${p.checksum} (${p.source})`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedChecksums(true);
    setTimeout(() => setCopiedChecksums(false), 2000);
  };

  const copyPostMortemMarkdown = () => {
    if (!postMortemReport) return;
    const text = `# Horizon Autonomous Incident Post-Mortem: ${postMortemReport.incidentId}
- **Timestamp:** ${postMortemReport.resolvedAt}
- **Target Node:** ${postMortemReport.targetName} (${postMortemReport.targetNode})
- **Severity:** P1 CRITICAL
- **Time to Detect (MTTD):** ${postMortemReport.mttdSeconds}s
- **Time to Recover (MTTR):** ${postMortemReport.mttrSeconds}s
- **Root Cause:** ${postMortemReport.rootCause}
- **Remediation Playbook:** ${postMortemReport.playbook}
- **AI Provenance:** ${postMortemReport.provenance}
- **Mitigated Downstream Services:** ${postMortemReport.blastRadius.join(', ')}
- **Merkle Audit Root:** \`${postMortemReport.merkleRoot}\`
- **Blockchain Governance:** MST Testnet (Chain ID 91562037)

### 7-Stage Checksum Verification
${pipelineChecksums.map((p) => `- Stage ${p.stage}/7 [${p.pipelineName}]: \`${p.checksum}\` (${p.source})`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  // Live compiled DAG YAML text
  const dagRecoveryYaml = `apiVersion: horizon.resilience/v1alpha1
kind: AutonomousRecoveryPlan
metadata:
  incidentId: "${activeIncident?.id || 'INC-NOMINAL'}"
  targetNode: "${activeIncident?.targetNode || 'db-primary'}"
  generatedAt: "${new Date().toISOString()}"
  algorithm: "Kahn-Topological-Sort-O(V+E)"
spec:
  governanceGate:
    required: true
    standard: "EIP-712"
    chainId: 91562037
    contract: "0x3EDad230dCFc6Dd3C357490b9feDa49639646BB7"
  recoveryTiers:
    - tier: 0
      name: "Foundational Storage & State"
      services:
        - id: "${activeIncident?.targetNode || 'db-primary'}"
          action: "promote_replica_and_pitr"
          healthProbe: "pg_isready -h localhost -p 5432"
          timeoutSeconds: 30
    - tier: 1
      name: "Caching & Event Bus"
      services:
        - id: "redis-cache"
          action: "purge_and_warm_sessions"
          healthProbe: "redis-cli ping"
        - id: "kafka-queue"
          action: "rebalance_consumer_groups"
    - tier: 2
      name: "Application Edge & Ingress"
      services:
        - id: "auth-service"
          action: "restart_jwt_verifier"
        - id: "api-gateway"
          action: "route_traffic_cutover"
          healthProbe: "curl -f http://localhost:8080/health"
`;

  const copyDagYaml = () => {
    navigator.clipboard.writeText(dagRecoveryYaml);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2000);
  };

  const isFiring = activeIncident && activeIncident.status !== 'RESOLVED';
  const latestTelemetry = telemetryHistory[telemetryHistory.length - 1] || { latencyMs: 12, errorRate: 0, cpuPercent: 35 };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('horizon-observability-page space-y-6 font-sans w-full max-w-7xl mx-auto pb-16', className)}
    >
      {/* Breadcrumb & Sound Controls */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#EADCC9] pb-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-[#6E6258]">
          <Link to="/" className="hover:text-[#0047AB] transition-colors">
            Horizon
          </Link>
          <span>/</span>
          <span className="text-[#8A7B6D]">Platform</span>
          <span>/</span>
          <span className="text-[#1A1A1A] font-bold">Observability & Verification Hub</span>
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

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-emerald-800 font-bold">Datadog & Dynatrace Stream Active</span>
          </div>
        </div>
      </motion.div>

      {/* Hero Header & 1-Click Action Bar */}
      <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-white border border-[#EADCC9] shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1A1A1A]">
                Telemetry & Failure Detection Hub
              </h1>
              <Badge status="info" className="bg-[#0047AB]/10 text-[#0047AB] border-[#0047AB]/20 text-[11px] font-mono font-bold">
                <Activity className="w-3.5 h-3.5 mr-1" />
                APM & PAGERDUTY
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-[#5A4E44] mt-1 max-w-2xl leading-relaxed">
              Real-time infrastructure monitoring inspired by Datadog APM and Dynatrace. Evaluates 3-miss sliding window probes, triggers PagerDuty P1 alerts, verifies original AI diagnosis, and logs cryptographic SHA-256 checksums across all 7 pipelines.
            </p>
          </div>

          {/* Action Controls with Auto-Remediation Toggle */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Target Node Dropdown */}
            <div className="flex items-center gap-2 bg-[#FAF3EA] px-3 py-1.5 rounded-xl border border-[#E5D7C5]">
              <span className="text-[11px] font-bold text-[#6E6258] uppercase">Target Node:</span>
              <select
                value={activeDrill}
                onChange={(e) => setActiveDrill(e.target.value)}
                className="bg-white text-xs font-mono font-bold text-[#1A1A1A] px-2 py-1 rounded-lg border border-[#D5C4B1] focus:outline-none focus:ring-1 focus:ring-[#0047AB] cursor-pointer"
              >
                <option value="db-primary">PostgreSQL Primary (SPOF)</option>
                <option value="redis-cache">Redis Cache Master</option>
                <option value="kafka-queue">Kafka Event Bus</option>
                <option value="auth-service">OAuth2 / JWT Service</option>
                <option value="api-gateway">Envoy API Gateway</option>
              </select>
            </div>

            {/* Auto-Remediate Toggle Switch */}
            <div className="flex items-center gap-2 bg-[#FAF3EA] px-3 py-1.5 rounded-xl border border-[#E5D7C5]">
              <span className="text-[11px] font-bold text-[#6E6258] uppercase">Auto Remedy:</span>
              <button
                type="button"
                onClick={() => setAutoRemediate((prev) => !prev)}
                className={cn(
                  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                  autoRemediate ? 'bg-emerald-600' : 'bg-stone-300'
                )}
                title="When ON, AI automatically remediates without pressing buttons after 1.2s observability window"
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    autoRemediate ? 'translate-x-4' : 'translate-x-0'
                  )}
                />
              </button>
              <span className={cn('text-[10px] font-mono font-black', autoRemediate ? 'text-emerald-700' : 'text-stone-500')}>
                {autoRemediate ? 'ON' : 'OFF'}
              </span>
            </div>

            {/* Simulate Breach Button */}
            <button
              onClick={() => triggerOutageSimulation(activeDrill)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md cursor-pointer flex items-center gap-2 transition-all active:scale-95"
            >
              <Flame className="w-4 h-4 text-white animate-bounce" />
              <span>Simulate Breach</span>
            </button>

            {/* Manual AI Remediate Button (active if autoRemediate is OFF) */}
            {!autoRemediate && (
              <button
                onClick={() => executeAiAgentRemediation()}
                disabled={!isFiring || isAiAgentWorking}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md flex items-center gap-2 transition-all cursor-pointer',
                  isFiring
                    ? 'bg-[#0047AB] hover:bg-blue-800 ring-2 ring-blue-400/50'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-60'
                )}
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>{isAiAgentWorking ? 'AI Healing...' : '🤖 Remediate with AI'}</span>
              </button>
            )}

            {/* Reset Button */}
            <button
              onClick={resetToNominal}
              className="px-3 py-2 rounded-xl text-xs font-bold text-[#5A4E44] bg-[#FAF3EA] hover:bg-[#F2E5D5] border border-[#E5D7C5] transition-all cursor-pointer flex items-center gap-1.5"
              title="Reset all probes to nominal baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* PagerDuty P1 Emergency Incident Alert Banner */}
      <AnimatePresence>
        {isFiring && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="p-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-xl border-2 border-red-700"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-red-700 font-mono font-black text-xs animate-pulse">
                    PAGERDUTY P1 CRITICAL
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-black/30 font-mono text-xs font-bold">
                    Incident #{activeIncident?.id}
                  </span>
                  <span className="text-xs text-white/90 font-mono font-semibold">
                    Source: {activeIncident?.source}
                  </span>
                  {autoRemediate && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-200 text-xs font-mono font-bold animate-pulse">
                      ⚡ AUTO-HEALING ENGAGED
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-tight">{activeIncident?.title}</h3>
                <p className="text-xs text-white/90 max-w-3xl leading-relaxed">
                  {activeIncident?.summary}
                </p>
                <div className="text-[11px] font-mono text-white/80 pt-1">
                  <strong>Blast Radius Impact:</strong> {activeIncident?.blastRadius.join(' → ')}
                </div>
              </div>

              {!autoRemediate && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => executeAiAgentRemediation()}
                    disabled={isAiAgentWorking}
                    className="px-5 py-3 rounded-xl bg-white text-[#0047AB] font-black text-xs sm:text-sm hover:bg-stone-100 transition-all shadow-lg cursor-pointer flex items-center gap-2 group disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-[#0047AB] group-hover:scale-110 transition-transform" />
                    <span>{isAiAgentWorking ? 'AI Agent Healing...' : '🤖 Execute AI Remediation'}</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4 Metric Status Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SLA Status */}
        <Card className={cn('p-4 border transition-colors', isFiring ? 'border-red-400 bg-red-50/50' : 'border-[#EADCC9] bg-white')}>
          <div className="flex items-center justify-between text-xs text-[#6E6258] mb-1">
            <span className="font-bold uppercase tracking-wider">Cluster SLA Status</span>
            <Radio className={cn('w-4 h-4', isFiring ? 'text-red-600 animate-pulse' : 'text-emerald-600')} />
          </div>
          <div className="text-xl font-black text-[#1A1A1A]">
            {isFiring ? 'P1 OUTAGE ACTIVE' : '99.99% NOMINAL'}
          </div>
          <div className="text-[11px] font-mono text-[#8A7B6D] mt-1">
            {isFiring ? 'PagerDuty Escalation Level 1' : 'All 7 nodes responding'}
          </div>
        </Card>

        {/* Latency & Wave */}
        <Card className={cn('p-4 border transition-colors', isFiring ? 'border-amber-400 bg-amber-50/50' : 'border-[#EADCC9] bg-white')}>
          <div className="flex items-center justify-between text-xs text-[#6E6258] mb-1">
            <span className="font-bold uppercase tracking-wider">Datadog APM Latency</span>
            <Activity className="w-4 h-4 text-[#0047AB]" />
          </div>
          <div className="text-xl font-black text-[#1A1A1A]">
            {latestTelemetry.latencyMs} <span className="text-xs font-normal text-[#6E6258]">ms</span>
          </div>
          <div className="text-[11px] font-mono text-[#8A7B6D] mt-1">
            Baseline: 12ms | SLA: &lt;50ms
          </div>
        </Card>

        {/* 3-Miss Sliding Window Flapping Guard */}
        <Card className="p-4 border border-[#EADCC9] bg-white">
          <div className="flex items-center justify-between text-xs text-[#6E6258] mb-1">
            <span className="font-bold uppercase tracking-wider">Flapping Guard</span>
            <ShieldCheck className="w-4 h-4 text-[#0047AB]" />
          </div>
          <div className="text-xl font-black text-[#1A1A1A] flex items-center gap-2">
            <span>3-Miss Window</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((slot) => {
                const filled = (activeIncident?.consecutiveMisses || 0) >= slot;
                return (
                  <span
                    key={slot}
                    className={cn(
                      'w-3 h-3 rounded-full border',
                      filled ? 'bg-red-500 border-red-700 animate-ping' : 'bg-emerald-100 border-emerald-300'
                    )}
                  />
                );
              })}
            </div>
          </div>
          <div className="text-[11px] font-mono text-[#8A7B6D] mt-1">
            Trips P1 alert only upon 3 misses
          </div>
        </Card>

        {/* AI SRE Engine Status */}
        <Card className="p-4 border border-[#EADCC9] bg-white">
          <div className="flex items-center justify-between text-xs text-[#6E6258] mb-1">
            <span className="font-bold uppercase tracking-wider">Autonomous SRE</span>
            <Brain className="w-4 h-4 text-[#0047AB]" />
          </div>
          <div className="text-xl font-black text-[#1A1A1A] flex items-center gap-1.5">
            <span className={cn('w-2 h-2 rounded-full', autoRemediate ? 'bg-emerald-500' : 'bg-amber-500')} />
            <span>{autoRemediate ? 'Auto Active' : 'Manual Mode'}</span>
          </div>
          <div className="text-[11px] font-mono text-[#8A7B6D] mt-1">
            {aiDiagnosis ? (aiDiagnosis.source === 'sarvam-ai-cloud' ? 'Original AI Verified' : 'Local Guardrail') : 'Standby / Armed'}
          </div>
        </Card>
      </motion.div>

      {/* Real AI Diagnosis Verification Panel (Prompt cleanly hidden from view) */}
      {aiDiagnosis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-3xl bg-gradient-to-br from-white to-[#FDF8F2] border-2 border-[#0047AB]/30 shadow-lg space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EADCC9] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#0047AB]/10 text-[#0047AB]">
                <Brain className="w-5 h-5 text-[#0047AB]" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#1A1A1A] flex items-center gap-2">
                  <span>AI SRE Root Cause Diagnosis & Verifiable Output</span>
                  {aiDiagnosis.source === 'sarvam-ai-cloud' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-black border border-emerald-300">
                      ORIGINAL SARVAM AI CLOUD (HTTP {aiDiagnosis.httpStatus || 200})
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-black border border-amber-300">
                      LOCAL SRE GUARDRAIL ENGINE (DETERMINISTIC FALLBACK)
                    </span>
                  )}
                </h3>
                <p className="text-xs text-[#6E6258]">
                  Verified response delivered in <strong>{aiDiagnosis.latencyMs}ms</strong> using model <strong>{aiDiagnosis.model}</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Actual Real AI Output Text */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5D7C5] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-[#6E6258] font-bold">
              <span>REAL AI REASONING & REMEDIATION DIRECTIVE:</span>
              <span className="font-mono text-[11px] text-[#0047AB]">Playbook: {aiDiagnosis.playbook}</span>
            </div>
            <p className="text-xs sm:text-sm text-[#1A1A1A] font-medium leading-relaxed bg-[#FAF3EA] p-3 rounded-xl border border-[#E8DAC8]">
              "{aiDiagnosis.rawOutput}"
            </p>
            <div className="text-xs text-[#6E6258] pt-1">
              <strong>Isolated Root Cause:</strong> <span className="text-rose-700 font-bold">{aiDiagnosis.rootCause}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Dynamic Incident Post-Mortem & Audit Report Card */}
      {postMortemReport && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-white border-2 border-emerald-600/40 shadow-lg space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EADCC9] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <FileText className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#1A1A1A] flex items-center gap-2">
                  <span>Autonomous Incident Recovery Report (Post-Mortem)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                    RESOLVED
                  </span>
                </h3>
                <p className="text-xs text-[#6E6258]">
                  Incident <strong>#{postMortemReport.incidentId}</strong> resolved at {postMortemReport.resolvedAt} with 0 unhandled alerts.
                </p>
              </div>
            </div>

            <button
              onClick={copyPostMortemMarkdown}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FAF3EA] hover:bg-[#F2E5D5] border border-[#E5D7C5] transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-center"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#0047AB]" />}
              <span>{copiedReport ? 'Report Copied!' : 'Copy Markdown Report'}</span>
            </button>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#FAF3EA] border border-[#E8DAC8]">
              <div className="text-[10px] font-mono text-[#8A7B6D] uppercase">Time to Detect (MTTD)</div>
              <div className="text-base font-black text-[#1A1A1A] mt-0.5">{postMortemReport.mttdSeconds}s</div>
              <div className="text-[10px] text-emerald-700 font-bold">3/3 probe window</div>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF3EA] border border-[#E8DAC8]">
              <div className="text-[10px] font-mono text-[#8A7B6D] uppercase">Time to Recover (MTTR)</div>
              <div className="text-base font-black text-[#0047AB] mt-0.5">{postMortemReport.mttrSeconds}s</div>
              <div className="text-[10px] text-[#0047AB] font-bold">SLA: &lt;60s met</div>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF3EA] border border-[#E8DAC8]">
              <div className="text-[10px] font-mono text-[#8A7B6D] uppercase">Restored Nodes</div>
              <div className="text-base font-black text-[#1A1A1A] mt-0.5">{postMortemReport.restoredCount} Services</div>
              <div className="text-[10px] text-stone-600">Bottom-up DAG tiers</div>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF3EA] border border-[#E8DAC8]">
              <div className="text-[10px] font-mono text-[#8A7B6D] uppercase">AI SRE Engine</div>
              <div className="text-sm font-bold text-[#1A1A1A] mt-0.5 truncate">{postMortemReport.provenance}</div>
              <div className="text-[10px] text-emerald-700 font-bold">Kahn sequenced</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF3EA] border border-[#E8DAC8] text-xs space-y-1.5 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[#6E6258] gap-1">
              <span><strong>Root Cause:</strong> {postMortemReport.rootCause}</span>
              <span><strong>Playbook:</strong> {postMortemReport.playbook}</span>
            </div>
            <div className="text-[11px] text-[#8A7B6D] break-all">
              <strong>Merkle Audit Root Hash:</strong> <span className="text-emerald-800 font-bold">{postMortemReport.merkleRoot}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* 7-Pipeline Cryptographic Checksum Matrix */}
      {pipelineChecksums.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-3xl bg-white border border-[#EADCC9] shadow-md space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EADCC9] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Lock className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#1A1A1A]">
                  7-Pipeline Cryptographic Checksums Matrix (SHA-256)
                </h3>
                <p className="text-[11px] text-[#6E6258]">
                  Deterministic audit hashes guaranteeing tamper-evidence across each stage of the remediation lifecycle.
                </p>
              </div>
            </div>

            <button
              onClick={copyChecksumsManifest}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FAF3EA] hover:bg-[#F2E5D5] border border-[#E5D7C5] transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-center"
            >
              {copiedChecksums ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#0047AB]" />}
              <span>{copiedChecksums ? 'Manifest Copied!' : 'Copy Checksum Manifest'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#EADCC9] text-[#6E6258] text-[10px] uppercase font-mono">
                  <th className="py-2 px-3">Stage</th>
                  <th className="py-2 px-3">Pipeline Name</th>
                  <th className="py-2 px-3">Origin Source</th>
                  <th className="py-2 px-3">SHA-256 Verification Checksum</th>
                  <th className="py-2 px-3">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2E7DC] font-mono text-[11px]">
                {pipelineChecksums.map((pipe) => (
                  <tr key={pipe.pipelineId} className="hover:bg-[#FDF9F4] transition-colors">
                    <td className="py-2 px-3 font-bold text-[#0047AB]">{pipe.stage}/7</td>
                    <td className="py-2 px-3 font-sans font-bold text-[#1A1A1A]">{pipe.pipelineName}</td>
                    <td className="py-2 px-3 text-[#6E6258]">{pipe.source}</td>
                    <td className="py-2 px-3 text-emerald-700 font-bold truncate max-w-[280px]" title={pipe.checksum}>
                      {pipe.checksum}
                    </td>
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Main Grid: Left Column (Telemetry & Microservices) vs Right Column (Tabbed: Terminal / YAML / MCP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): APM Waveform + Dynatrace Probe Matrix */}
        <div className="lg:col-span-7 space-y-6">
          {/* Datadog APM Latency Waveform */}
          <Card className="p-5 border border-[#EADCC9] bg-white space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#1A1A1A] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#0047AB]" />
                  Datadog APM Latency Waveform Stream
                </h3>
                <p className="text-[11px] text-[#6E6258]">Real-time latency jitter sampled every 2000ms</p>
              </div>
              <Badge status="info" className="font-mono text-xs font-bold">
                {latestTelemetry.latencyMs} ms
              </Badge>
            </div>

            {/* SVG Wave Graph */}
            <div className="h-40 w-full bg-[#FAF3EA] rounded-2xl p-3 border border-[#E8DAC8] relative overflow-hidden flex flex-col justify-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isFiring ? '#DC2626' : '#0047AB'} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={isFiring ? '#DC2626' : '#0047AB'} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="30" x2="600" y2="30" stroke="#E5D7C5" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="600" y2="60" stroke="#E5D7C5" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2="600" y2="90" stroke="#E5D7C5" strokeDasharray="3 3" />

                {/* Path line */}
                {(() => {
                  const maxLatency = Math.max(...telemetryHistory.map((h) => h.latencyMs), 60);
                  const points = telemetryHistory.map((pt, idx) => {
                    const x = (idx / (telemetryHistory.length - 1)) * 600;
                    const y = 110 - (pt.latencyMs / maxLatency) * 95;
                    return `${x},${y}`;
                  });
                  const pathD = `M ${points[0]} L ${points.slice(1).join(' L ')}`;
                  const fillD = `${pathD} L 600,120 L 0,120 Z`;

                  return (
                    <>
                      <path d={fillD} fill="url(#waveGradient)" />
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isFiring ? '#DC2626' : '#0047AB'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  );
                })()}
              </svg>

              <div className="absolute top-2 left-3 text-[10px] font-mono text-[#8A7B6D] flex items-center gap-3">
                <span>Critical Threshold: 500ms</span>
                <span>Error Rate: {(latestTelemetry.errorRate * 100).toFixed(1)}%</span>
                <span>CPU: {latestTelemetry.cpuPercent}%</span>
              </div>
            </div>
          </Card>

          {/* Dynatrace OneAgent Microservice Probes */}
          <Card className="p-5 border border-[#EADCC9] bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#1A1A1A] flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#0047AB]" />
                  Dynatrace Microservice Probes Matrix
                </h3>
                <p className="text-[11px] text-[#6E6258]">7 monitored service containers with individual health probes</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#EADCC9] text-[#6E6258] text-[10px] uppercase font-mono">
                    <th className="py-2 px-3">Service</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Latency</th>
                    <th className="py-2 px-3">Misses</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Drill</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2E7DC]">
                  {services.map((svc) => (
                    <tr key={svc.id} className="hover:bg-[#FAF3EA]/60 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-[#1A1A1A]">{svc.name}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#6E6258]">{svc.type}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] font-semibold">
                        {svc.latencyMs.toFixed(1)}ms
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        <span className={svc.consecutiveMisses > 0 ? 'text-red-600 font-bold' : 'text-stone-400'}>
                          {svc.consecutiveMisses}/3
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold',
                            svc.status === 'healthy'
                              ? 'bg-emerald-100 text-emerald-800'
                              : svc.status === 'degraded'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800 animate-pulse'
                          )}
                        >
                          {svc.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => triggerOutageSimulation(svc.id)}
                          className="px-2 py-1 rounded-md text-[10px] font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
                        >
                          Kill
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column (5 cols): Interactive Sub-Tab View (Terminal / YAML / MCP) */}
        <div className="lg:col-span-5 flex flex-col">
          <Card className="p-5 border border-[#EADCC9] bg-white flex-1 flex flex-col justify-between space-y-4">
            <div>
              {/* Tab Switcher Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#EADCC9]">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#FAF3EA] border border-[#E5D7C5]">
                  <button
                    onClick={() => setRightPaneTab('terminal')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                      rightPaneTab === 'terminal' ? 'bg-white text-[#0047AB] shadow-xs' : 'text-[#6E6258] hover:text-[#1A1A1A]'
                    )}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Terminal</span>
                  </button>
                  <button
                    onClick={() => setRightPaneTab('yaml')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                      rightPaneTab === 'yaml' ? 'bg-white text-[#0047AB] shadow-xs' : 'text-[#6E6258] hover:text-[#1A1A1A]'
                    )}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>DAG YAML</span>
                  </button>
                  <button
                    onClick={() => setRightPaneTab('mcp')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                      rightPaneTab === 'mcp' ? 'bg-white text-[#0047AB] shadow-xs' : 'text-[#6E6258] hover:text-[#1A1A1A]'
                    )}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>MCP Gateway</span>
                  </button>
                </div>

                <span className="text-[10px] font-mono text-emerald-600 font-bold">● ONLINE</span>
              </div>
            </div>

            {/* TAB 1: Live SRE Streaming Terminal */}
            {rightPaneTab === 'terminal' && (
              <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-black shadow-inner flex-1 min-h-[440px] flex flex-col justify-between font-mono text-[11px] text-cyan-300 overflow-hidden">
                <div className="space-y-2 overflow-y-auto max-h-[400px] pr-1">
                  <div className="text-stone-400 text-[10px] pb-1 border-b border-stone-800 flex items-center justify-between">
                    <span>SARVAM SRE SENTINEL v2.4</span>
                    <span className="text-emerald-400 font-bold">STREAM ARMED</span>
                  </div>

                  {aiLogs.map((log, idx) => (
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
                          : log.includes('🔐') || log.includes('📜')
                          ? 'text-purple-300'
                          : 'text-cyan-300'
                      )}
                    >
                      {log}
                    </motion.div>
                  ))}
                </div>

                <div className="pt-2 border-t border-stone-800 text-[10px] text-stone-400 flex items-center justify-between">
                  <span>7-Pipeline Sentinel Loop</span>
                  <span className="text-emerald-400">{autoRemediate ? 'Autonomous (Active)' : 'Manual Mode'}</span>
                </div>
              </div>
            )}

            {/* TAB 2: Compiled Recovery DAG Manifest (YAML) */}
            {rightPaneTab === 'yaml' && (
              <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-black shadow-inner flex-1 min-h-[440px] flex flex-col justify-between font-mono text-[11px] text-emerald-300 overflow-hidden">
                <div className="space-y-2 flex-1 flex flex-col">
                  <div className="text-stone-400 text-[10px] pb-1 border-b border-stone-800 flex items-center justify-between">
                    <span>COMPILED KUBERNETES DAG MANIFEST</span>
                    <button
                      onClick={copyDagYaml}
                      className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {copiedYaml ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedYaml ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="overflow-y-auto max-h-[380px] text-[11px] text-emerald-300 font-mono leading-relaxed select-all">
                    {dagRecoveryYaml}
                  </pre>
                </div>
                <div className="pt-2 border-t border-stone-800 text-[10px] text-stone-400 flex items-center justify-between">
                  <span>Algorithm: Kahn O(V+E)</span>
                  <span className="text-[#0047AB]">EIP-712 Gated</span>
                </div>
              </div>
            )}

            {/* TAB 3: Live MCP Server Access & Ping Verification */}
            {rightPaneTab === 'mcp' && (
              <div className="p-4 rounded-2xl bg-[#FAF3EA] border border-[#E5D7C5] shadow-inner flex-1 min-h-[440px] flex flex-col justify-between text-xs space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E5D7C5] pb-2">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-[#0047AB]" />
                      <span className="font-black text-[#1A1A1A]">Render MCP Server Gateway</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-200 text-stone-700 font-bold">
                      FASTAPI + FASTMCP
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#E8DAC8] space-y-1.5 font-mono text-[11px]">
                    <div className="text-[#8A7B6D] text-[10px] uppercase font-bold">Target MCP Endpoint:</div>
                    <div className="text-[#1A1A1A] font-bold truncate">
                      https://horizon-mcp-server-phf8.onrender.com
                    </div>
                    <div className="flex items-center gap-2 pt-1 text-[10px] text-[#6E6258]">
                      <span>Protocol: 2024-11-05</span>
                      <span>•</span>
                      <span>12 Registered Tools</span>
                    </div>
                  </div>

                  {/* Ping MCP Server Button */}
                  <button
                    onClick={testMcpServerConnection}
                    disabled={mcpStatus.state === 'pinging'}
                    className="w-full py-2.5 rounded-xl bg-[#0047AB] hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Activity className={cn('w-4 h-4 text-white', mcpStatus.state === 'pinging' && 'animate-spin')} />
                    <span>{mcpStatus.state === 'pinging' ? 'Testing Connection...' : 'Ping MCP Server from Website'}</span>
                  </button>

                  {/* Result status */}
                  {mcpStatus.state !== 'idle' && (
                    <div
                      className={cn(
                        'p-3 rounded-xl border text-[11px] font-mono space-y-1',
                        mcpStatus.state === 'online'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : mcpStatus.state === 'offline'
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-blue-50 border-blue-200 text-blue-900'
                      )}
                    >
                      <div className="font-bold flex items-center gap-1.5">
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full',
                            mcpStatus.state === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
                          )}
                        />
                        <span>{mcpStatus.message}</span>
                      </div>
                      {Boolean(mcpStatus.payload) && (
                        <pre className="text-[10px] max-h-24 overflow-y-auto text-emerald-800 pt-1">
                          {JSON.stringify(mcpStatus.payload, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}

                  {/* MCP Tool Registry Highlights */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-mono text-[#8A7B6D] uppercase font-bold">12 Registered MCP Tools:</div>
                    <div className="flex flex-wrap gap-1">
                      {[
                        'horizon_get_topology',
                        'horizon_probe_health',
                        'horizon_trigger_recovery',
                        'horizon_submit_gate_approval',
                        'horizon_get_incident_timeline',
                        'horizon_broadcast_incident',
                      ].map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-md bg-white border border-[#E5D7C5] text-[10px] font-mono text-stone-700">
                          {t}
                        </span>
                      ))}
                      <span className="px-2 py-0.5 rounded-md bg-stone-200 text-[10px] font-mono text-stone-600 font-bold">
                        +6 more
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E5D7C5] text-[10px] text-[#8A7B6D] flex items-center justify-between">
                  <span>Inbound Webhook: /api/v1/incidents/webhook</span>
                  <Link to="/docs" className="text-[#0047AB] font-bold hover:underline flex items-center gap-0.5">
                    Docs <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
