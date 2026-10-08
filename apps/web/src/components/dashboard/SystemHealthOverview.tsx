import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { fetchNodes, triggerSimulation } from '../../lib/api';
import type { SystemNode } from '../../types';
import {
  Server,
  Database,
  Globe,
  Key,
  CreditCard,
  Layers,
  Zap,
  RefreshCw,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router';

const iconMap: Record<string, React.ElementType> = {
  database: Database,
  cache: Server,
  gateway: Globe,
  application: Layers,
  auth: Key,
  payment: CreditCard,
};

// Node metadata for high-fidelity SRE telemetry
const nodeTelemetryMap: Record<string, { port: string; region: string; latency: string }> = {
  'db-primary': { port: '5432', region: 'us-east-1a', latency: '4ms' },
  'db-replica': { port: '5433', region: 'us-east-1b', latency: '6ms' },
  'cache-redis': { port: '6379', region: 'us-east-1a', latency: '1.2ms' },
  'api-gateway': { port: '443', region: 'global-edge', latency: '12ms' },
  'auth-service': { port: '8081', region: 'us-east-1c', latency: '18ms' },
  'payment-gateway': { port: '8443', region: 'us-east-1a', latency: '34ms' },
  'notification-hub': { port: '9000', region: 'us-east-1b', latency: '22ms' },
};

export const SystemHealthOverview: React.FC = () => {
  const [nodes, setNodes] = useState<SystemNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'database' | 'service'>('all');

  const loadNodes = async () => {
    try {
      const data = await fetchNodes();
      setNodes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNodes();
    const interval = setInterval(loadNodes, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleFailure = async (node: SystemNode) => {
    setMutatingId(node.id);
    const newStatus = node.status === 'down' ? 'healthy' : 'down';
    try {
      await triggerSimulation(node.id, newStatus);
      await loadNodes();
    } finally {
      setMutatingId(null);
    }
  };

  const downCount = nodes.filter((n) => n.status === 'down' || n.status === 'degraded').length;

  const filteredNodes = nodes.filter((node) => {
    if (filter === 'all') return true;
    if (filter === 'database') return node.type === 'database' || node.type === 'cache';
    if (filter === 'service') return node.type !== 'database' && node.type !== 'cache';
    return true;
  });

  return (
    <Card className="p-5 sm:p-6 col-span-1 lg:col-span-2 flex flex-col justify-between border-white/[0.08] shadow-2xl">
      <div>
        {/* Top Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/[0.08] gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-semibold text-[#FFF8F0] tracking-tight">
                Cluster Topology Health Matrix
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                {nodes.length} Nodes
              </span>
            </div>
            <p className="text-[11px] text-[#A3ADC2] mt-0.5">
              Live probes across multi-tier database instances, cache tiers, and edge gateways.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Tabs */}
            <div className="inline-flex rounded-lg bg-black/40 p-0.5 border border-white/[0.08] text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-all text-[11px] font-medium cursor-pointer ${
                  filter === 'all'
                    ? 'bg-[#1E6BFF] text-[#FFF8F0] shadow-sm'
                    : 'text-[#A3ADC2] hover:text-[#FFF8F0]'
                }`}
              >
                All ({nodes.length})
              </button>
              <button
                onClick={() => setFilter('database')}
                className={`px-2.5 py-1 rounded-md transition-all text-[11px] font-medium cursor-pointer ${
                  filter === 'database'
                    ? 'bg-[#1E6BFF] text-[#FFF8F0] shadow-sm'
                    : 'text-[#A3ADC2] hover:text-[#FFF8F0]'
                }`}
              >
                Data Tier
              </button>
              <button
                onClick={() => setFilter('service')}
                className={`px-2.5 py-1 rounded-md transition-all text-[11px] font-medium cursor-pointer ${
                  filter === 'service'
                    ? 'bg-[#1E6BFF] text-[#FFF8F0] shadow-sm'
                    : 'text-[#A3ADC2] hover:text-[#FFF8F0]'
                }`}
              >
                App Services
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={loadNodes}
              className="text-xs p-2 h-8 w-8"
              title="Refresh telemetry probes"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Nodes Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredNodes.map((node) => {
            const Icon = iconMap[node.type] || Server;
            const isDown = node.status === 'down';
            const isDegraded = node.status === 'degraded';
            const telemetry = nodeTelemetryMap[node.id] || { port: '8080', region: 'us-east-1', latency: '15ms' };

            return (
              <div
                key={node.id}
                className={`p-3.5 rounded-xl border backdrop-blur-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden ${
                  isDown
                    ? 'bg-red-500/[0.08] border-red-500/30 shadow-lg shadow-red-500/10'
                    : isDegraded
                    ? 'bg-amber-500/[0.08] border-amber-500/30 shadow-lg shadow-amber-500/10'
                    : 'bg-white/[0.02] border-white/[0.07] hover:border-white/[0.18] hover:bg-white/[0.04]'
                }`}
              >
                {/* Node Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2 rounded-xl border transition-colors ${
                          isDown
                            ? 'bg-red-500/20 text-red-300 border-red-500/30 animate-pulse'
                            : 'bg-blue-500/10 text-[#1E6BFF] border-blue-500/20 group-hover:bg-blue-500/20'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[#FFF8F0] leading-tight">
                          {node.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-mono text-[#6E7A94] uppercase">
                            :{telemetry.port}
                          </span>
                          <span className="text-[10px] text-[#4F5B73]">•</span>
                          <span className="text-[10px] font-mono text-[#6E7A94]">
                            {telemetry.region}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge status={node.status as any} pulse={isDown}>
                      {node.status}
                    </Badge>
                  </div>

                  {/* Telemetry Chips */}
                  <div className="flex items-center justify-between text-[10px] py-1.5 px-2 rounded-lg bg-black/30 border border-white/[0.04] mb-3">
                    <span className="text-[#A3ADC2] flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-blue-400" />
                      Latency:
                    </span>
                    <span className={`font-mono font-semibold ${isDown ? 'text-red-400' : 'text-emerald-400'}`}>
                      {isDown ? 'TIMEOUT' : telemetry.latency}
                    </span>
                  </div>
                </div>

                {/* Node Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                  <div className="text-[10px] text-[#A3ADC2] font-mono truncate max-w-[120px]">
                    {node.dependencies.length > 0 ? (
                      <span title={`Depends on: ${node.dependencies.join(', ')}`}>
                        &larr; {node.dependencies.length} deps
                      </span>
                    ) : (
                      <span className="text-blue-400/80">Root Service</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleFailure(node)}
                    disabled={mutatingId === node.id}
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer border ${
                      isDown
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30 shadow-sm shadow-emerald-500/20'
                        : 'bg-red-500/10 text-red-300 border-red-500/25 hover:bg-red-500/20'
                    }`}
                  >
                    {mutatingId === node.id ? (
                      <RefreshCw className="w-3 h-3 animate-spin inline" />
                    ) : isDown ? (
                      'Recover'
                    ) : (
                      'Simulate Fail'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SRE Chaos Guide Footer */}
      <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs text-[#A3ADC2]">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span>
            {downCount > 0 ? (
              <strong className="text-amber-400">{downCount} service(s) disrupted — autonomous healing ready.</strong>
            ) : (
              'Chaos switch active: trigger failure on any node to verify blast radius.'
            )}
          </span>
        </div>
        <Link
          to="/topology"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
        >
          <span>Open Full Dependency DAG</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
};
