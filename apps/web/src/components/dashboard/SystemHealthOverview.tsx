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
    <Card className="p-6 sm:p-8 flex flex-col justify-between">
      <div>
        {/* Header with Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5E5E5] mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base sm:text-lg font-semibold text-[#0A0A0A]">
                Infrastructure Services Matrix
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium text-[#0A0A0A] bg-neutral-100 border border-[#E5E5E5]">
                {nodes.length} Active Nodes
              </span>
            </div>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              Live continuous probes across database primaries, replica clusters, and distributed gateways.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Tabs */}
            <div className="inline-flex rounded-full bg-neutral-100 p-1 border border-[#E5E5E5] text-xs">
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  'px-3 py-1 rounded-full transition-all text-xs font-medium cursor-pointer',
                  filter === 'all'
                    ? 'bg-white text-[#0A0A0A] shadow-sm font-semibold'
                    : 'text-[#6B6B6B] hover:text-[#0A0A0A]'
                )}
              >
                All ({nodes.length})
              </button>
              <button
                onClick={() => setFilter('database')}
                className={cn(
                  'px-3 py-1 rounded-full transition-all text-xs font-medium cursor-pointer',
                  filter === 'database'
                    ? 'bg-white text-[#0A0A0A] shadow-sm font-semibold'
                    : 'text-[#6B6B6B] hover:text-[#0A0A0A]'
                )}
              >
                Data Tier
              </button>
              <button
                onClick={() => setFilter('service')}
                className={cn(
                  'px-3 py-1 rounded-full transition-all text-xs font-medium cursor-pointer',
                  filter === 'service'
                    ? 'bg-white text-[#0A0A0A] shadow-sm font-semibold'
                    : 'text-[#6B6B6B] hover:text-[#0A0A0A]'
                )}
              >
                App Services
              </button>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={loadNodes}
              className="p-2 h-9 w-9 rounded-full"
              title="Refresh telemetry probes"
              aria-label="Refresh telemetry probes"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
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
                  'p-4 rounded-[16px] border transition-all duration-150 flex flex-col justify-between group relative overflow-hidden',
                  isDown
                    ? 'bg-red-50/50 border-red-200'
                    : isDegraded
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-white border-[#E5E5E5] hover:border-[#D4D4D4] hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,.04),0_8px_24px_rgba(0,0,0,.04)]'
                )}
              >
                {/* Node Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={cn(
                          'p-2 rounded-lg border transition-colors flex-shrink-0',
                          isDown
                            ? 'bg-red-100 text-red-600 border-red-200 animate-pulse'
                            : 'bg-neutral-50 text-[#0A0A0A] border-[#E5E5E5]'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-[#0A0A0A] truncate">
                          {node.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-mono text-[#6B6B6B]">
                            :{telemetry.port}
                          </span>
                          <span className="text-[#A3A3A3] text-[10px]">•</span>
                          <span className="text-[11px] font-mono text-[#6B6B6B]">
                            {telemetry.region}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge status={node.status as any} pulse={isDown}>
                      {node.status}
                    </Badge>
                  </div>

                  {/* Telemetry Well */}
                  <div className="flex items-center justify-between text-xs py-1.5 px-3 mb-3 rounded-lg bg-[#FAFAF9] border border-[#E5E5E5]">
                    <span className="text-[#6B6B6B] flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3 text-[#2DD4BF]" />
                      Latency:
                    </span>
                    <span className={cn('font-mono font-medium text-[11px]', isDown ? 'text-red-600' : 'text-emerald-700')}>
                      {isDown ? 'TIMEOUT' : telemetry.latency}
                    </span>
                  </div>
                </div>

                {/* Node Footer Actions */}
                <div className="flex items-center justify-between pt-2.5 border-t border-[#E5E5E5]">
                  <div className="text-[11px] text-[#6B6B6B] font-mono truncate max-w-[120px]">
                    {node.dependencies.length > 0 ? (
                      <span title={`Depends on: ${node.dependencies.join(', ')}`}>
                        &larr; {node.dependencies.length} deps
                      </span>
                    ) : (
                      <span className="text-[#0A0A0A] font-medium">Root Service</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleFailure(node)}
                    disabled={mutatingId === node.id}
                    className={cn(
                      'text-xs font-medium px-3 py-1 rounded-full transition-all cursor-pointer border select-none',
                      isDown
                        ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                        : 'bg-white text-[#0A0A0A] hover:bg-neutral-50 border-[#E5E5E5]'
                    )}
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
      <div className="mt-6 pt-4 border-t border-[#E5E5E5] flex flex-wrap items-center justify-between gap-3 text-xs text-[#6B6B6B]">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
          <span>
            {downCount > 0 ? (
              <span className="text-amber-800 font-medium">{downCount} service(s) impacted — automated DAG recovery loop triggered.</span>
            ) : (
              'Chaos switch active: trigger failover on any node to verify blast radius & Kahn sort.'
            )}
          </span>
        </div>
        <Link
          to="/topology"
          className="inline-flex items-center gap-1 font-medium text-[#0A0A0A] hover:underline transition-colors"
        >
          <span>Open Full DAG Topology</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
};

export default SystemHealthOverview;
