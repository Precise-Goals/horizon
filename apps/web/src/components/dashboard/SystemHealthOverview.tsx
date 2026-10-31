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
import { cn } from '../../lib/utils';

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

  const filteredNodes = nodes.filter((n) => {
    if (filter === 'database') return n.type === 'database' || n.type === 'cache';
    if (filter === 'service') return n.type === 'application' || n.type === 'gateway';
    return true;
  });

  const downCount = nodes.filter((n) => n.status === 'down' || n.status === 'degraded').length;

  return (
    <Card className="p-6 sm:p-7 flex flex-col justify-between">
      <div>
        {/* Header with Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[rgba(26,26,26,0.08)] mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg sm:text-xl font-black text-[#1A1A1A]">
                Infrastructure Services Matrix
              </h3>
              <span className="horizon-badge text-[11px] text-[#0047AB] bg-[#EBF1FA] border-[#0047AB]/20">
                {nodes.length} Nodes Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#666666] mt-1">
              Live probes across multi-tier database instances, distributed cache tiers, and edge gateways.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Skeuomorphic Filter Tabs */}
            <div className="inline-flex rounded-xl bg-[#F4EBE0] p-1 border border-[rgba(26,26,26,0.12)] shadow-[inset_0_1px_2px_rgba(26,26,26,0.06)] text-xs">
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  'px-3 py-1.5 rounded-lg transition-all text-xs font-bold cursor-pointer',
                  filter === 'all'
                    ? 'bg-white text-[#0047AB] shadow-[0_1px_3px_rgba(26,26,26,0.08),inset_0_1px_0_#FFFFFF]'
                    : 'text-[#666666] hover:text-[#1A1A1A]'
                )}
              >
                All ({nodes.length})
              </button>
              <button
                onClick={() => setFilter('database')}
                className={cn(
                  'px-3 py-1.5 rounded-lg transition-all text-xs font-bold cursor-pointer',
                  filter === 'database'
                    ? 'bg-white text-[#0047AB] shadow-[0_1px_3px_rgba(26,26,26,0.08),inset_0_1px_0_#FFFFFF]'
                    : 'text-[#666666] hover:text-[#1A1A1A]'
                )}
              >
                Data Tier
              </button>
              <button
                onClick={() => setFilter('service')}
                className={cn(
                  'px-3 py-1.5 rounded-lg transition-all text-xs font-bold cursor-pointer',
                  filter === 'service'
                    ? 'bg-white text-[#0047AB] shadow-[0_1px_3px_rgba(26,26,26,0.08),inset_0_1px_0_#FFFFFF]'
                    : 'text-[#666666] hover:text-[#1A1A1A]'
                )}
              >
                App Services
              </button>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={loadNodes}
              className="p-2 h-9 w-9 rounded-xl"
              title="Refresh telemetry probes"
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNodes.map((node) => {
            const Icon = iconMap[node.type] || Server;
            const isDown = node.status === 'down';
            const isDegraded = node.status === 'degraded';
            const telemetry = nodeTelemetryMap[node.id] || { port: '8080', region: 'us-east-1', latency: '15ms' };

            return (
              <div
                key={node.id}
                className={cn(
                  'p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between group relative overflow-hidden',
                  isDown
                    ? 'bg-[#FFF5F5] border-red-300 shadow-[0_2px_8px_rgba(220,38,38,0.1)]'
                    : isDegraded
                    ? 'bg-[#FFFDF5] border-amber-300 shadow-[0_2px_8px_rgba(217,119,6,0.1)]'
                    : 'bg-white border-[rgba(26,26,26,0.11)] shadow-[inset_0_1px_0_#FFFFFF,0_1px_3px_rgba(26,26,26,0.05)] hover:border-[#0047AB]/30 hover:shadow-[0_4px_12px_rgba(0,71,171,0.08)]'
                )}
              >
                {/* Node Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'p-2.5 rounded-xl border transition-colors flex-shrink-0',
                          isDown
                            ? 'bg-red-100 text-red-700 border-red-200 animate-pulse'
                            : 'bg-[#EBF1FA] text-[#0047AB] border-[#0047AB]/20'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#1A1A1A] leading-tight">
                          {node.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-mono text-[#666666]">
                            :{telemetry.port}
                          </span>
                          <span className="text-xs text-[#999999]">•</span>
                          <span className="text-xs font-mono text-[#666666]">
                            {telemetry.region}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge status={node.status as any} pulse={isDown}>
                      {node.status}
                    </Badge>
                  </div>

                  {/* Debossed Telemetry Well */}
                  <div className="skeuo-well flex items-center justify-between text-xs py-2 px-2.5 mb-3">
                    <span className="text-[#666666] flex items-center gap-1.5 font-medium">
                      <Clock className="w-3 h-3 text-[#0047AB]" />
                      Probe Latency:
                    </span>
                    <span className={cn('font-mono font-bold', isDown ? 'text-[#DC2626]' : 'text-[#0F8E52]')}>
                      {isDown ? 'TIMEOUT' : telemetry.latency}
                    </span>
                  </div>
                </div>

                {/* Node Footer Actions */}
                <div className="flex items-center justify-between pt-2.5 border-t border-[rgba(26,26,26,0.08)]">
                  <div className="text-xs text-[#666666] font-mono truncate max-w-[130px]">
                    {node.dependencies.length > 0 ? (
                      <span title={`Depends on: ${node.dependencies.join(', ')}`}>
                        &larr; {node.dependencies.length} deps
                      </span>
                    ) : (
                      <span className="text-[#0047AB] font-bold">Root Service</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleFailure(node)}
                    disabled={mutatingId === node.id}
                    className={cn(
                      'text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer border select-none',
                      isDown
                        ? 'bg-[#EBF7EE] text-[#0A6C3D] border-[#0F8E52]/40 hover:bg-[#D8F0DE] shadow-[0_1px_2px_rgba(15,142,82,0.15)]'
                        : 'bg-[#FDF2F2] text-[#B91C1C] border-[#DC2626]/25 hover:bg-[#FDE8E8]'
                    )}
                  >
                    {mutatingId === node.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin inline" />
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
      <div className="mt-6 pt-4 border-t border-[rgba(26,26,26,0.08)] flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-[#666666]">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#0047AB] shrink-0" />
          <span>
            {downCount > 0 ? (
              <strong className="text-[#D97706] font-bold">{downCount} service(s) impacted — autonomous recovery sequence initialized.</strong>
            ) : (
              'Chaos engineering switch active: toggle failover on any node to verify blast radius.'
            )}
          </span>
        </div>
        <Link
          to="/topology"
          className="inline-flex items-center gap-1.5 font-bold text-[#0047AB] hover:underline"
        >
          <span>Open Full Dependency DAG</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </Card>
  );
};
