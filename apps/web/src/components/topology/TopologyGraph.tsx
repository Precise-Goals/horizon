import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { fetchNodes, fetchGraph, triggerSimulation } from '../../lib/api';
import { clusterState } from '../../engine/state';
import type { SystemNode } from '../../types';
import { cn } from '../../lib/utils';
import {
  Network,
  Database,
  Globe,
  Zap,
  ShieldCheck,
  CreditCard,
  Monitor,
  RefreshCw,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  ArrowDown,
  Layers,
  Activity,
  Flame,
  Radio,
  RotateCcw,
} from 'lucide-react';

export interface TopologyGraphProps {
  className?: string;
}

interface NodeLayoutMeta {
  id: string;
  name: string;
  tier: number;
  tierLabel: string;
  tierName: string;
  recoveryStep: number;
  type: 'database' | 'application' | 'gateway' | 'cache';
  port: string;
  latency: string;
  protocol: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  engine: string;
  description: string;
  x: number;
  y: number;
}

const STATIC_NODE_METAS: Record<string, NodeLayoutMeta> = {
  'web-frontend': {
    id: 'web-frontend',
    name: 'Horizon Web UI',
    tier: 3,
    tierLabel: 'TIER 3',
    tierName: 'Client Ingress',
    recoveryStep: 5,
    type: 'application',
    port: ':3000',
    latency: '24ms',
    protocol: 'HTTPS / Web',
    icon: Monitor,
    iconColor: 'text-[#0047AB]',
    iconBg: 'bg-blue-50 border-blue-200',
    engine: 'React 19 / Vite Edge',
    description: 'Client-facing mission control dashboard and operator cockpit.',
    x: 300,
    y: 50,
  },
  'api-gateway': {
    id: 'api-gateway',
    name: 'API Gateway',
    tier: 2,
    tierLabel: 'TIER 2',
    tierName: 'Routing & Proxy',
    recoveryStep: 4,
    type: 'gateway',
    port: ':8080',
    latency: '4.5ms',
    protocol: 'HTTP/2 & gRPC',
    icon: Globe,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50 border-indigo-200',
    engine: 'Envoy Reverse Proxy',
    description: 'TLS termination, rate limiting, and intelligent load routing.',
    x: 300,
    y: 165,
  },
  'auth-service': {
    id: 'auth-service',
    name: 'Auth Service',
    tier: 1,
    tierLabel: 'TIER 1',
    tierName: 'Microservice',
    recoveryStep: 3,
    type: 'application',
    port: ':5001',
    latency: '12ms',
    protocol: 'gRPC / JWT',
    icon: ShieldCheck,
    iconColor: 'text-emerald-700',
    iconBg: 'bg-emerald-50 border-emerald-200',
    engine: 'EIP-712 / Go Auth Engine',
    description: 'Session state validation, HMAC token signing, and Web3 key authorization.',
    x: 180,
    y: 295,
  },
  'payment-service': {
    id: 'payment-service',
    name: 'Payment Service',
    tier: 1,
    tierLabel: 'TIER 1',
    tierName: 'Microservice',
    recoveryStep: 3,
    type: 'application',
    port: ':5002',
    latency: '18ms',
    protocol: 'REST / Webhook',
    icon: CreditCard,
    iconColor: 'text-purple-700',
    iconBg: 'bg-purple-50 border-purple-200',
    engine: 'MST Escrow / Stripe Gateway',
    description: 'NFT subscription license checking and fiat/crypto payment settlement.',
    x: 420,
    y: 295,
  },
  'redis-cache': {
    id: 'redis-cache',
    name: 'Redis Cache',
    tier: 0,
    tierLabel: 'TIER 0',
    tierName: 'In-Memory Store',
    recoveryStep: 2,
    type: 'cache',
    port: ':6379',
    latency: '0.4ms',
    protocol: 'RESP3 / TCP',
    icon: Zap,
    iconColor: 'text-amber-700',
    iconBg: 'bg-amber-50 border-amber-200',
    engine: 'Redis 7.2 Memory Cluster',
    description: 'High-throughput session cache, rate-limit buckets, and pub/sub message bus.',
    x: 105,
    y: 435,
  },
  'db-primary': {
    id: 'db-primary',
    name: 'PostgreSQL Primary',
    tier: 0,
    tierLabel: 'TIER 0',
    tierName: 'Primary Database',
    recoveryStep: 1,
    type: 'database',
    port: ':5432',
    latency: '1.2ms',
    protocol: 'PostgreSQL Wire / TLS',
    icon: Database,
    iconColor: 'text-[#0047AB]',
    iconBg: 'bg-blue-100 border-blue-300',
    engine: 'PostgreSQL 16 Primary ACID',
    description: 'Foundational system of record with continuous WAL replication archiving.',
    x: 300,
    y: 435,
  },
  'db-replica': {
    id: 'db-replica',
    name: 'PostgreSQL Replica',
    tier: 0,
    tierLabel: 'TIER 0',
    tierName: 'Standby Database',
    recoveryStep: 2,
    type: 'database',
    port: ':5433',
    latency: '0.8ms',
    protocol: 'WAL Streaming Sync',
    icon: Database,
    iconColor: 'text-sky-700',
    iconBg: 'bg-sky-50 border-sky-200',
    engine: 'PostgreSQL 16 Hot Standby',
    description: 'Real-time asynchronous read replica ready for automated failover promotion.',
    x: 495,
    y: 435,
  },
};

interface GraphEdgeConfig {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  path: string;
}

const STATIC_EDGES: GraphEdgeConfig[] = [
  {
    id: 'edge-gateway-to-web',
    sourceId: 'api-gateway',
    targetId: 'web-frontend',
    label: 'User Traffic Ingress',
    path: 'M 300 129 L 300 86',
  },
  {
    id: 'edge-auth-to-gateway',
    sourceId: 'auth-service',
    targetId: 'api-gateway',
    label: 'Route Auth & JWT',
    path: 'M 180 259 C 180 220, 270 230, 270 201',
  },
  {
    id: 'edge-cache-to-gateway',
    sourceId: 'redis-cache',
    targetId: 'api-gateway',
    label: 'Session & Rate Limits',
    path: 'M 105 399 C 75 300, 220 250, 245 201',
  },
  {
    id: 'edge-cache-to-auth',
    sourceId: 'redis-cache',
    targetId: 'auth-service',
    label: 'Token Caching',
    path: 'M 120 399 C 120 360, 155 365, 155 331',
  },
  {
    id: 'edge-db-to-auth',
    sourceId: 'db-primary',
    targetId: 'auth-service',
    label: 'User Credentials Query',
    path: 'M 275 399 C 275 360, 205 365, 205 331',
  },
  {
    id: 'edge-auth-to-payment',
    sourceId: 'auth-service',
    targetId: 'payment-service',
    label: 'Identity Attestation',
    path: 'M 260 295 C 300 295, 300 295, 340 295',
  },
  {
    id: 'edge-db-to-payment',
    sourceId: 'db-primary',
    targetId: 'payment-service',
    label: 'Ledger Balance Query',
    path: 'M 325 399 C 325 360, 420 365, 420 331',
  },
  {
    id: 'edge-db-to-cache',
    sourceId: 'db-primary',
    targetId: 'redis-cache',
    label: 'Cache Warmup & Sync',
    path: 'M 220 435 C 200 435, 200 435, 185 435',
  },
  {
    id: 'edge-db-to-replica',
    sourceId: 'db-primary',
    targetId: 'db-replica',
    label: 'Continuous WAL Stream',
    path: 'M 380 435 C 400 435, 400 435, 415 435',
  },
];

export const TopologyGraph: React.FC<TopologyGraphProps> = ({ className = '' }) => {
  const [nodes, setNodes] = useState<SystemNode[]>([]);
  const [edges, setEdges] = useState<{ dependent_id: string; depends_on_id: string }[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('db-primary');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'traffic' | 'recovery'>('traffic');
  const [filter, setFilter] = useState<'all' | 'data' | 'services' | 'edge'>('all');

  const loadTopology = useCallback(async () => {
    try {
      setLoading(true);
      const [n, g] = await Promise.all([fetchNodes(), fetchGraph()]);
      setNodes(n);
      if (g.edges && g.edges.length > 0) {
        setEdges(g.edges);
      } else {
        const derivedEdges: { dependent_id: string; depends_on_id: string }[] = [];
        n.forEach((node: SystemNode) => {
          node.dependencies.forEach((dep: string) => {
            derivedEdges.push({ dependent_id: node.id, depends_on_id: dep });
          });
        });
        setEdges(derivedEdges);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTopology();
    const unsubscribe = clusterState.subscribe(() => {
      loadTopology();
    });
    return () => unsubscribe();
  }, [loadTopology]);

  // Selected node metadata
  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  const selectedNodeMeta = useMemo(() => {
    if (!selectedNodeId) return null;
    return STATIC_NODE_METAS[selectedNodeId] || null;
  }, [selectedNodeId]);

  // Compute upstream prerequisites for selected node
  const upstreamDependencies = useMemo(() => {
    if (!selectedNodeId) return [];
    const directPrereqs = edges
      .filter((e) => e.dependent_id === selectedNodeId)
      .map((e) => e.depends_on_id);
    return Array.from(new Set(directPrereqs));
  }, [selectedNodeId, edges]);

  // Compute blast radius for selected node
  const blastRadius = useMemo(() => {
    if (!selectedNodeId) return [];
    const affected = new Set<string>();
    const queue = [selectedNodeId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const dependents = edges
        .filter((e) => e.depends_on_id === current)
        .map((e) => e.dependent_id);

      for (const dep of dependents) {
        if (!affected.has(dep)) {
          affected.add(dep);
          queue.push(dep);
        }
      }
    }
    return Array.from(affected);
  }, [selectedNodeId, edges]);

  // Check if any node in cluster is down
  const downNodes = useMemo(() => {
    return nodes.filter((n) => n.status === 'down');
  }, [nodes]);

  const isSelectedDown = selectedNode?.status === 'down';

  // Toggle simulate failure or restore
  const handleToggleState = async (nodeId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'down' ? 'healthy' : 'down';
    await triggerSimulation(nodeId, nextStatus);
    await loadTopology();
  };

  // One-click restore all nodes to healthy
  const handleRestoreAll = async () => {
    for (const node of nodes) {
      if (node.status === 'down') {
        await triggerSimulation(node.id, 'healthy');
      }
    }
    await loadTopology();
  };

  // Helper to determine edge relationship with active focus
  const getEdgeState = (edge: GraphEdgeConfig) => {
    const focusId = hoveredNodeId || selectedNodeId;
    if (!focusId) return 'normal';

    const isDirectUpstream = edge.targetId === focusId;
    const isDirectDownstream = edge.sourceId === focusId;
    const isCascaded =
      blastRadius.includes(edge.targetId) &&
      (edge.sourceId === selectedNodeId || blastRadius.includes(edge.sourceId));

    if (isDirectUpstream) return 'upstream';
    if (isDirectDownstream || isCascaded) {
      return isSelectedDown ? 'danger' : 'downstream';
    }
    return 'dimmed';
  };

  return (
    <div className={cn('horizon-topology-graph grid grid-cols-1 xl:grid-cols-12 gap-6 items-start font-sans', className)}>
      {/* Main Interactive Visualizer (Left Column, 8-span) */}
      <Card className="horizon-topology-card p-5 sm:p-6 xl:col-span-8 flex flex-col justify-between min-h-[630px] relative overflow-hidden skeuo-card border-[#E5D7C5]">
        {/* Subtle Network Dot Grid */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(#0047AB_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

        <div>
          {/* Header Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#EADCC9] gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0047AB]/10 border border-[#0047AB]/25 text-[#0047AB] flex items-center justify-center shadow-inner shrink-0">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-[#1A1A1A] tracking-tight">
                    Autonomous Dependency DAG
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-bold bg-[#0047AB]/10 text-[#0047AB] border border-[#0047AB]/20">
                    O(V + E)
                  </span>
                </div>
                <p className="text-xs text-[#6E6258] font-medium mt-0.5">
                  Multi-tier service dependency topology with reverse blast radius resolution.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* View Mode Switcher */}
              <div className="inline-flex p-1 rounded-xl bg-[#F5EDE2] border border-[#E5D7C5] shadow-inner text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setViewMode('traffic')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1.5 cursor-pointer',
                    viewMode === 'traffic'
                      ? 'bg-white text-[#0047AB] font-bold shadow-xs border border-[#E0D0BE]'
                      : 'text-[#6E6258] hover:text-[#1A1A1A]'
                  )}
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>Traffic Flow</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('recovery')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1.5 cursor-pointer',
                    viewMode === 'recovery'
                      ? 'bg-white text-[#0047AB] font-bold shadow-xs border border-[#E0D0BE]'
                      : 'text-[#6E6258] hover:text-[#1A1A1A]'
                  )}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Kahn Order</span>
                </button>
              </div>

              {/* Refresh DAG */}
              <Button
                variant="secondary"
                size="sm"
                onClick={loadTopology}
                className="gap-1.5 text-xs font-semibold rounded-xl"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Sub-toolbar: Non-Repetitive Filter & Outage Alert Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-2 text-xs relative z-10">
            {/* Filter pills without repeating "Tier" */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[10px] font-mono tracking-wider text-[#8A7B6D] font-bold uppercase mr-1">
                Filter:
              </span>
              {[
                { id: 'all', label: 'All (7)' },
                { id: 'data', label: 'Tier 0' },
                { id: 'services', label: 'Tier 1' },
                { id: 'edge', label: 'Tier 2-3' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id as any)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg font-mono text-[10px] tracking-wider font-bold uppercase transition-colors cursor-pointer',
                    filter === f.id
                      ? 'bg-[#0047AB] text-white shadow-xs'
                      : 'bg-white border border-[#E5D7C5] text-[#6E6258] hover:bg-[#FAF3EA]'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Outage status pill */}
            {downNodes.length > 0 ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-50 border border-red-300 text-red-700 text-xs font-bold animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span className="font-mono text-[11px] tracking-wider">
                  {downNodes.length} OUTAGE ACTIVE: {downNodes.map((n) => n.name).join(', ')}
                </span>
                <button
                  type="button"
                  onClick={handleRestoreAll}
                  className="ml-1 underline hover:text-red-900 cursor-pointer font-mono text-[10px] uppercase font-bold"
                >
                  Heal All
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" />
                <span className="font-semibold text-[11px]">ALL 7 NODES OPERATIONAL &bull; 0 CYCLES</span>
              </div>
            )}
          </div>

          {/* Interactive Topological DAG Canvas with Dedicated Left Rail */}
          <div className="relative w-full overflow-x-auto overflow-y-hidden rounded-2xl bg-[#FFFDF9] border border-[#E8DCCE] p-2 shadow-inner">
            <div className="relative w-[710px] h-[500px] mx-auto select-none flex">
              {/* Dedicated Left-Side Rail Gutter (No text behind cards!) */}
              <div className="w-[110px] h-full flex flex-col justify-between py-2 border-r border-[#EADCC9]/60 shrink-0 select-none z-10 pr-2">
                {/* TIER 3: Ingress */}
                <div className="h-[80px] flex flex-col justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-[#0047AB]/10 text-[#0047AB] font-mono tracking-wider text-[9px] font-black border border-[#0047AB]/20">
                      TIER 3
                    </span>
                    <span className="font-mono tracking-wider text-[10px] font-bold text-[#1A1A1A] uppercase">
                      INGRESS
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-[#8A7B6D] tracking-wide mt-1 pl-0.5">
                    Client Edge
                  </span>
                </div>

                {/* TIER 2: Gateway */}
                <div className="h-[85px] flex flex-col justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono tracking-wider text-[9px] font-black border border-indigo-200">
                      TIER 2
                    </span>
                    <span className="font-mono tracking-wider text-[10px] font-bold text-[#1A1A1A] uppercase">
                      GATEWAY
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-[#8A7B6D] tracking-wide mt-1 pl-0.5">
                    Route & TLS
                  </span>
                </div>

                {/* TIER 1: Core */}
                <div className="h-[95px] flex flex-col justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono tracking-wider text-[9px] font-black border border-emerald-200">
                      TIER 1
                    </span>
                    <span className="font-mono tracking-wider text-[10px] font-bold text-[#1A1A1A] uppercase">
                      CORE
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-[#8A7B6D] tracking-wide mt-1 pl-0.5">
                    Application
                  </span>
                </div>

                {/* TIER 0: Data */}
                <div className="h-[95px] flex flex-col justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-[#0047AB]/10 text-[#0047AB] font-mono tracking-wider text-[9px] font-black border border-[#0047AB]/25">
                      TIER 0
                    </span>
                    <span className="font-mono tracking-wider text-[10px] font-bold text-[#0047AB] uppercase">
                      DATA
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-[#8A7B6D] tracking-wide mt-1 pl-0.5">
                    Root ACID
                  </span>
                </div>
              </div>

              {/* Main Node Canvas Area (600px width) */}
              <div className="relative w-[600px] h-full overflow-hidden">
                {/* Subtle Horizontal Divider Lines (Zero text collisions!) */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-2">
                  <div className="h-[80px] border-b border-dashed border-[#E5D7C5]/40" />
                  <div className="h-[85px] border-b border-dashed border-[#E5D7C5]/40" />
                  <div className="h-[95px] border-b border-dashed border-[#E5D7C5]/40" />
                  <div className="h-[95px]" />
                </div>

                {/* SVG Connectors Canvas */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 600 500"
                >
                  <defs>
                    <marker
                      id="arrow-default"
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 8 5 L 0 9 z" fill="#94A3B8" />
                    </marker>

                    <marker
                      id="arrow-upstream"
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 8 5 L 0 9 z" fill="#0047AB" />
                    </marker>

                    <marker
                      id="arrow-downstream"
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 8 5 L 0 9 z" fill="#D97706" />
                    </marker>

                    <marker
                      id="arrow-danger"
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 8 5 L 0 9 z" fill="#EF4444" />
                    </marker>
                  </defs>

                  {/* Render Directed Bézier Curves */}
                  {STATIC_EDGES.map((edge) => {
                    const state = getEdgeState(edge);
                    const source = STATIC_NODE_METAS[edge.sourceId];
                    const target = STATIC_NODE_METAS[edge.targetId];

                    let strokeColor = '#CBD5E1';
                    let strokeWidth = 1.75;
                    let strokeDash = '5 4';
                    let marker = 'url(#arrow-default)';
                    let animClass = 'animate-dag-flow';
                    let opacity = 1;

                    if (state === 'upstream') {
                      strokeColor = '#0047AB';
                      strokeWidth = 2.75;
                      strokeDash = '6 3';
                      marker = 'url(#arrow-upstream)';
                      animClass = 'animate-dag-flow-fast';
                    } else if (state === 'downstream') {
                      strokeColor = '#D97706';
                      strokeWidth = 2.5;
                      strokeDash = '6 3';
                      marker = 'url(#arrow-downstream)';
                      animClass = 'animate-dag-flow-fast';
                    } else if (state === 'danger') {
                      strokeColor = '#EF4444';
                      strokeWidth = 3;
                      strokeDash = '4 4';
                      marker = 'url(#arrow-danger)';
                      animClass = 'animate-dag-flow-fast';
                    } else if (state === 'dimmed') {
                      opacity = 0.22;
                      animClass = '';
                    }

                    return (
                      <g key={edge.id} className="cursor-pointer group">
                        <path
                          d={edge.path}
                          fill="none"
                          stroke="transparent"
                          strokeWidth={14}
                          className="pointer-events-auto"
                        />
                        <path
                          d={edge.path}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                          strokeDasharray={strokeDash}
                          markerEnd={viewMode === 'recovery' ? marker : undefined}
                          markerStart={viewMode === 'traffic' ? marker : undefined}
                          className={cn('transition-all duration-150', animClass, 'group-hover:stroke-[#0047AB] group-hover:stroke-[3px]')}
                          style={{ opacity }}
                        />
                        <title>{`${source?.name} → ${target?.name} (${edge.label})`}</title>
                      </g>
                    );
                  })}
                </svg>

                {/* Interactive Node Cards */}
                {Object.values(STATIC_NODE_METAS).map((meta) => {
                  const liveNode = nodes.find((n) => n.id === meta.id);
                  const status = liveNode?.status || 'healthy';
                  const isDown = status === 'down';
                  const isSelected = selectedNodeId === meta.id;
                  const isUpstream = upstreamDependencies.includes(meta.id);
                  const isDownstream = blastRadius.includes(meta.id);
                  const isSimulatedBlast = isDownstream && isSelectedDown;

                  // Dim card if filter does not match
                  let isFilteredOut = false;
                  if (filter === 'data' && meta.tier !== 0) isFilteredOut = true;
                  if (filter === 'services' && meta.tier !== 1) isFilteredOut = true;
                  if (filter === 'edge' && meta.tier < 2) isFilteredOut = true;

                  const IconComponent = meta.icon;

                  return (
                    <div
                      key={meta.id}
                      style={{
                        left: `${meta.x}px`,
                        top: `${meta.y}px`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className={cn(
                        'absolute pointer-events-auto select-none transition-opacity duration-150',
                        isSelected ? 'z-20' : 'z-10',
                        isFilteredOut && 'opacity-25 pointer-events-none'
                      )}
                    >
                      <div
                        onClick={() => setSelectedNodeId(meta.id)}
                        onMouseEnter={() => setHoveredNodeId(meta.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className={cn(
                          'horizon-dag-node w-[160px] rounded-2xl p-2.5 transition-all duration-150 cursor-pointer select-none',
                          'shadow-[0_2px_8px_rgba(26,26,26,0.06),0_1px_2px_rgba(26,26,26,0.04)]',
                          // Base Card Style (No movement on hover!)
                          !isSelected && !isDown && !isSimulatedBlast && 'bg-white border-2 border-[rgba(26,26,26,0.12)] hover:border-[#0047AB]/70 hover:shadow-[0_4px_16px_rgba(0,71,171,0.18)] hover:ring-2 hover:ring-[#0047AB]/20',
                          // Selected Style
                          isSelected && !isDown && 'bg-white border-2 border-[#0047AB] ring-4 ring-[#0047AB]/20 shadow-[0_6px_20px_rgba(0,71,171,0.22)]',
                          // Upstream Prerequisite of Selected Node
                          isUpstream && !isSelected && 'border-2 border-[#0047AB]/60 bg-blue-50/40',
                          // Active Cascaded Risk (when selected target is down)
                          isSimulatedBlast && 'border-2 border-dashed border-amber-500 bg-amber-50/90 shadow-[0_4px_14px_rgba(217,119,6,0.2)]',
                          // Target Node Is Down (Primary Failure)
                          isDown && 'border-2 border-red-500 bg-red-50/90 ring-4 ring-red-500/20 shadow-[0_6px_20px_rgba(239,68,68,0.25)]'
                        )}
                      >
                        {/* Top Anchor Dot */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#CBD5E1] border border-white shadow-xs pointer-events-none" />
                        {/* Bottom Anchor Dot */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-[#CBD5E1] border border-white shadow-xs pointer-events-none" />

                        {/* Mode Tag / Sequence Pill */}
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-[9px] font-mono tracking-widest font-black px-1.5 py-0.5 rounded bg-[#F4EBE0] border border-[#E0D0BE] text-[#5A4E44] uppercase">
                            {viewMode === 'recovery' ? `STEP ${meta.recoveryStep}` : meta.tierLabel}
                          </span>

                          {/* Status Indicator Pill */}
                          {isDown ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider font-bold bg-red-100 text-red-800 border border-red-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                              <span>DOWN</span>
                            </span>
                          ) : isSimulatedBlast ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-700" />
                              <span>RISK</span>
                            </span>
                          ) : isUpstream ? (
                            <span className="text-[9px] font-mono tracking-wider font-bold text-[#0047AB] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              PREREQ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider font-bold bg-[#EBF7EE] text-[#0A6C3D] border border-[#0F8E52]/25">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-xs" />
                              <span>HEALTHY</span>
                            </span>
                          )}
                        </div>

                        {/* Node Core Info */}
                        <div className="flex items-center gap-2">
                          <div className={cn('w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 shadow-xs', meta.iconBg)}>
                            <IconComponent className={cn('w-4 h-4', meta.iconColor)} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-black text-[#1A1A1A] truncate leading-tight">
                              {meta.name}
                            </div>
                            <div className="text-[10px] text-[#6E6258] font-mono tracking-wider uppercase font-bold truncate">
                              {meta.port} &bull; {meta.latency}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Legend Footer */}
        <div className="mt-4 pt-3 border-t border-[#EADCC9] flex flex-wrap items-center justify-between text-xs text-[#6E6258] relative z-10 gap-3">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-wider uppercase">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" /> Healthy
            </span>
            <span className="flex items-center gap-1.5 font-bold text-red-700">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-xs animate-pulse" /> Outage
            </span>
            <span className="flex items-center gap-1.5 font-bold text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-600 shadow-xs" /> Cascade Risk
            </span>
            <span className="flex items-center gap-1.5 font-bold text-[#0047AB]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0047AB] shadow-xs" /> Prerequisite
            </span>
          </div>
          <span className="font-mono text-[10px] tracking-wider text-[#8A7B6D] font-bold uppercase">
            Click any service to inspect topology & blast radius
          </span>
        </div>
      </Card>

      {/* Persistent Side-by-Side Service Inspector Column (Right Column, 4-span) */}
      <Card className="horizon-impact-panel p-5 xl:col-span-4 h-[630px] flex flex-col justify-between skeuo-card border-[#E5D7C5] sticky top-6">
        <div>
          {/* Panel Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EADCC9] shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0047AB]/10 text-[#0047AB] border border-[#0047AB]/20 flex items-center justify-center">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#1A1A1A] tracking-tight">
                  Service Inspector
                </h3>
                <p className="text-[10px] font-mono tracking-wider uppercase text-[#6E6258] font-bold">
                  Topological Impact Analysis
                </p>
              </div>
            </div>
            {selectedNode && (
              <Badge status={selectedNode.status as any}>
                {selectedNode.status}
              </Badge>
            )}
          </div>

          {/* Scrollable Inspector Body with Constant Stable Container Height */}
          {selectedNode && selectedNodeMeta ? (
            <div className="overflow-y-auto max-h-[460px] space-y-3.5 pr-1">
              {/* Target Service Overview Card */}
              <div className="p-3.5 rounded-xl skeuo-well border-[#E5D7C5]">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-[#8A7B6D] uppercase font-mono tracking-wider font-bold">
                    Target Service
                  </span>
                  <span className="text-[9px] font-mono tracking-widest px-2 py-0.5 rounded-md bg-[#0047AB]/10 text-[#0047AB] font-black border border-[#0047AB]/20 uppercase">
                    {selectedNodeMeta.tierLabel} &bull; {selectedNodeMeta.tierName}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 mt-2">
                  <div className={cn('w-9 h-9 rounded-xl border flex items-center justify-center shadow-xs shrink-0', selectedNodeMeta.iconBg)}>
                    {React.createElement(selectedNodeMeta.icon, {
                      className: cn('w-5 h-5', selectedNodeMeta.iconColor),
                    })}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-black text-[#1A1A1A] truncate">
                      {selectedNodeMeta.name}
                    </div>
                    <div className="text-[11px] text-[#6E6258] font-mono truncate">
                      {selectedNodeMeta.engine}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#E5D7C5]/60 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-white/80 border border-[#D9C8B5]">
                    <span className="text-[8px] text-[#8A7B6D] block tracking-wider uppercase font-bold">PORT / PROTOCOL</span>
                    <span className="font-bold text-[#1A1A1A] text-[10px] truncate block">
                      {selectedNodeMeta.port} ({selectedNodeMeta.protocol})
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/80 border border-[#D9C8B5]">
                    <span className="text-[8px] text-[#8A7B6D] block tracking-wider uppercase font-bold">TELEMETRY P99</span>
                    <span className="font-bold text-[#0047AB] text-[10px] block">
                      {selectedNodeMeta.latency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Upstream Prerequisites */}
              <div className="p-3 rounded-xl bg-white border border-[#E5D7C5] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-[#0047AB]" />
                    <span>Upstream Prerequisites</span>
                  </span>
                  <span className="text-[9px] font-mono tracking-wider font-bold text-[#6E6258] uppercase">
                    {upstreamDependencies.length} REQUIRED
                  </span>
                </div>
                {upstreamDependencies.length === 0 ? (
                  <p className="text-xs text-[#6E6258] italic font-medium">
                    Root foundation service. Has zero upstream dependencies.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {upstreamDependencies.map((depId) => {
                      const depMeta = STATIC_NODE_METAS[depId];
                      const depNode = nodes.find((n) => n.id === depId);
                      return (
                        <div
                          key={depId}
                          onClick={() => setSelectedNodeId(depId)}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#FAF3EA] border border-[#E5D7C5] hover:border-[#0047AB]/40 cursor-pointer transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#0047AB]" />
                            <span className="font-bold text-[#1A1A1A]">
                              {depMeta?.name || depId}
                            </span>
                          </div>
                          <Badge status={(depNode?.status || 'healthy') as any}>
                            {depNode?.status || 'healthy'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Blast Radius Box (Cobalt Patch) */}
              <div className="p-3.5 rounded-xl cobalt-patch shadow-lg shadow-[#0047AB]/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-300" />
                    <span>Cascaded Blast Radius</span>
                  </span>
                  <span className="text-[9px] font-mono tracking-wider font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30 uppercase">
                    {blastRadius.length} DOWNSTREAM
                  </span>
                </div>

                <p className="text-xs text-white/80 mt-2 font-medium">
                  If <strong className="text-white underline">{selectedNodeMeta.name}</strong> fails, the following downstream systems are impaired:
                </p>

                <div className="mt-2.5 space-y-1.5">
                  {blastRadius.length === 0 ? (
                    <div className="text-xs text-emerald-200 flex items-center gap-1.5 py-1 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Edge leaf node: 0 downstream dependencies cascaded.</span>
                    </div>
                  ) : (
                    blastRadius.map((depId) => {
                      const depMeta = STATIC_NODE_METAS[depId];
                      return (
                        <div
                          key={depId}
                          onClick={() => setSelectedNodeId(depId)}
                          className="flex items-center justify-between p-2 rounded-lg bg-black/25 border border-white/10 hover:border-white/30 text-xs cursor-pointer transition-colors"
                        >
                          <span className="text-white font-semibold">
                            {depMeta ? depMeta.name : depId}
                          </span>
                          <span className="text-[9px] font-mono tracking-wider text-amber-300 font-bold px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/30 uppercase">
                            {isSelectedDown ? 'IMPAIRED' : 'AT RISK'}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Autonomous Playbook Assignment */}
              <div className="p-3 rounded-xl skeuo-well border-[#E5D7C5] text-xs text-[#5A4E44]">
                <div className="flex items-center gap-1.5 font-bold text-[#1A1A1A] mb-1">
                  <Activity className="w-3.5 h-3.5 text-[#0047AB]" />
                  <span>Autonomous Playbook Assignment:</span>
                </div>
                <p className="leading-relaxed text-[11px]">
                  {selectedNode.type === 'database'
                    ? 'Playbook #PB-01: High-Risk Database Failover to read replica. EIP-712 Multi-Sig Commander approval required.'
                    : selectedNode.type === 'cache'
                    ? 'Playbook #PB-02: Automated Redis cache flush, container restart, and client pool reconnection.'
                    : selectedNode.type === 'gateway'
                    ? 'Playbook #PB-03: Zero-downtime Envoy ingress reload and dynamic DNS re-route to healthy pods.'
                    : 'Playbook #PB-04: Graceful SIGTERM pod termination, Kubernetes rolling restart, and readiness probe poll.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-xs text-[#8A7B6D] font-medium">
              Select any service from the DAG topology to inspect its dependencies and blast radius.
            </div>
          )}
        </div>

        {/* Action Controls Footer (Always Pinned and 100% Visible, Never Cut Off!) */}
        {selectedNode && (
          <div className="pt-3 border-t border-[#EADCC9] shrink-0">
            <Button
              variant={selectedNode.status === 'down' ? 'primary' : 'danger'}
              size="sm"
              onClick={() => handleToggleState(selectedNode.id, selectedNode.status)}
              className="w-full text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {selectedNode.status === 'down' ? (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Restore & Heal Service</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4" />
                  <span>Simulate Failure on Node</span>
                </>
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
