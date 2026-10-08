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
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  database: Database,
  cache: Server,
  gateway: Globe,
  application: Layers,
  auth: Key,
  payment: CreditCard,
};

export const SystemHealthOverview: React.FC = () => {
  const [nodes, setNodes] = useState<SystemNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

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
    const interval = setInterval(loadNodes, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleFailure = async (node: SystemNode) => {
    setMutatingId(node.id);
    const newStatus = node.status === 'down' ? 'healthy' : 'down';
    await triggerSimulation(node.id, newStatus);
    await loadNodes();
    setMutatingId(null);
  };

  const downCount = nodes.filter((n) => n.status === 'down' || n.status === 'degraded').length;

  return (
    <Card className="p-6 col-span-1 md:col-span-2 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-[#FFF8F0] tracking-tight">
              Topology Services & Health Status
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-[#A3ADC2] border border-white/[0.08]">
              {nodes.length} Monitored
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadNodes}
              className="text-xs gap-1"
              title="Refresh status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Poll</span>
            </Button>
            {downCount > 0 && (
              <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300">
                {downCount} Impacted
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Nodes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {nodes.map((node) => {
            const Icon = iconMap[node.type] || Server;
            const isDown = node.status === 'down';
            const isDegraded = node.status === 'degraded';

            return (
              <div
                key={node.id}
                className={`p-3.5 rounded-xl border backdrop-blur-md transition-all duration-200 flex flex-col justify-between ${
                  isDown
                    ? 'bg-red-500/[0.08] border-red-500/30 shadow-md shadow-red-500/10'
                    : isDegraded
                    ? 'bg-amber-500/[0.08] border-amber-500/30 shadow-md shadow-amber-500/10'
                    : 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-lg border ${
                        isDown
                          ? 'bg-red-500/20 text-red-300 border-red-500/30'
                          : 'bg-blue-500/10 text-[#1E6BFF] border-blue-500/20'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#FFF8F0] leading-tight">
                        {node.name}
                      </h4>
                      <span className="text-[10px] font-mono text-[#6E7A94] uppercase">
                        {node.type}
                      </span>
                    </div>
                  </div>
                  <Badge status={node.status as any} pulse={isDown}>
                    {node.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                  <span className="text-[10px] text-[#A3ADC2] font-mono">
                    {node.dependencies.length > 0
                      ? `Depends: ${node.dependencies.join(', ')}`
                      : 'Root Service'}
                  </span>
                  <button
                    onClick={() => handleToggleFailure(node)}
                    disabled={mutatingId === node.id}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-all cursor-pointer border ${
                      isDown
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                        : 'bg-red-500/10 text-red-300 border-red-500/20 hover:bg-red-500/20'
                    }`}
                  >
                    {mutatingId === node.id ? '...' : isDown ? 'Recover' : 'Simulate Fail'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#A3ADC2]">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span>Interactive Chaos Switch: Click "Simulate Fail" to observe autonomous recovery.</span>
        </div>
        <span className="font-mono text-[10px]">Real-time polling: 6s</span>
      </div>
    </Card>
  );
};
