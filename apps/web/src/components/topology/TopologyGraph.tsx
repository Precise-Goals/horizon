import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { fetchNodes, fetchGraph, triggerSimulation } from '../../lib/api';
import type { SystemNode } from '../../types';
import {
  Network,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
} from 'lucide-react';

export const TopologyGraph: React.FC = () => {
  const [nodes, setNodes] = useState<SystemNode[]>([]);
  const [edges, setEdges] = useState<{ dependent_id: string; depends_on_id: string }[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('db-primary');
  const [loading, setLoading] = useState(true);
  const [blastRadius, setBlastRadius] = useState<string[]>([]);

  const loadTopology = async () => {
    try {
      const [n, g] = await Promise.all([fetchNodes(), fetchGraph()]);
      setNodes(n);
      if (g.edges && g.edges.length > 0) {
        setEdges(g.edges);
      } else {
        // Fallback default edges based on node dependencies
        const derivedEdges: { dependent_id: string; depends_on_id: string }[] = [];
        n.forEach((node) => {
          node.dependencies.forEach((dep) => {
            derivedEdges.push({ dependent_id: node.id, depends_on_id: dep });
          });
        });
        setEdges(derivedEdges);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopology();
  }, []);

  // Compute blast radius: find all nodes that depend directly or indirectly on targetNode
  useEffect(() => {
    if (!selectedNodeId) {
      setBlastRadius([]);
      return;
    }

    const affected = new Set<string>();
    const queue = [selectedNodeId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      // Find all nodes that depend on current
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

    setBlastRadius(Array.from(affected));
  }, [selectedNodeId, edges]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const handleToggleState = async (nodeId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'down' ? 'healthy' : 'down';
    await triggerSimulation(nodeId, nextStatus);
    await loadTopology();
  };

  // Group nodes into topological visual tiers
  const tier1 = nodes.filter((n) => n.id === 'web-frontend');
  const tier2 = nodes.filter((n) => n.id === 'api-gateway');
  const tier3 = nodes.filter((n) => n.id === 'auth-service' || n.id === 'payment-service');
  const tier4 = nodes.filter((n) => n.id === 'redis-cache');
  const tier5 = nodes.filter((n) => n.id === 'db-primary' || n.id === 'db-replica');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Interactive Visualizer */}
      <Card className="p-6 lg:col-span-2 flex flex-col justify-between min-h-[580px] relative overflow-hidden">
        {/* Background Network Mesh Visual */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#1E6BFF_1px,transparent_1px)] [background-size:24px_24px]" />

        <div>
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/[0.08] relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#1E6BFF]">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#FFF8F0] tracking-tight">
                  Autonomous Dependency DAG
                </h2>
                <p className="text-xs text-[#A3ADC2]">
                  Topological recovery flow: Foundational Data Layer &rarr; Gateway &rarr; Web Edge
                </p>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={loadTopology} className="gap-1.5 text-xs">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh DAG</span>
            </Button>
          </div>

          {/* Interactive Tiered Canvas */}
          <div className="relative z-10 py-4 flex flex-col items-center gap-8">
            
            {/* Tier 1: Client Edge */}
            <div className="flex justify-center gap-6 w-full">
              {tier1.map((n) => renderNode(n))}
            </div>

            <ConnectorArrow text="Directs User Traffic" />

            {/* Tier 2: Gateway */}
            <div className="flex justify-center gap-6 w-full">
              {tier2.map((n) => renderNode(n))}
            </div>

            <ConnectorArrow text="Authenticates & Routes" />

            {/* Tier 3: Microservices */}
            <div className="flex justify-center gap-6 w-full flex-wrap">
              {tier3.map((n) => renderNode(n))}
            </div>

            <ConnectorArrow text="Caches & Persists" />

            {/* Tier 4 & 5: Cache & Database Foundational */}
            <div className="flex justify-center gap-6 w-full flex-wrap">
              {tier4.map((n) => renderNode(n))}
              {tier5.map((n) => renderNode(n))}
            </div>
          </div>
        </div>

        {/* Legend Footer */}
        <div className="mt-8 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#A3ADC2] relative z-10">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Healthy
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" /> Down
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 border border-amber-300" /> Blast Radius Affected
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#6E7A94]">Click any node to inspect blast radius</span>
        </div>
      </Card>

      {/* Side Impact & Blast Radius Inspection Panel */}
      <Card className="p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-[#1E6BFF]" />
              <h3 className="text-base font-semibold text-[#FFF8F0] tracking-tight">
                Impact Analysis
              </h3>
            </div>
            {selectedNode && (
              <Badge status={selectedNode.status as any}>
                {selectedNode.status}
              </Badge>
            )}
          </div>

          {selectedNode ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
                <span className="text-xs text-[#A3ADC2] uppercase font-mono tracking-wider">
                  Target Service
                </span>
                <div className="text-lg font-bold text-[#FFF8F0] mt-0.5">
                  {selectedNode.name}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    ID: {selectedNode.id}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-[#A3ADC2]">
                    TYPE: {selectedNode.type}
                  </span>
                </div>
              </div>

              {/* Blast Radius Count */}
              <div className="p-4 rounded-xl bg-[#0F1626]/80 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#FFF8F0]">Calculated Blast Radius</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    {blastRadius.length} Cascaded Services
                  </span>
                </div>

                <p className="text-xs text-[#A3ADC2] mt-2">
                  If <strong className="text-[#FFF8F0]">{selectedNode.name}</strong> experiences downtime, the following downstream systems are impaired:
                </p>

                <div className="mt-3 space-y-1.5">
                  {blastRadius.length === 0 ? (
                    <div className="text-xs text-emerald-400 flex items-center gap-1.5 py-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Edge leaf node: 0 downstream dependencies impacted.</span>
                    </div>
                  ) : (
                    blastRadius.map((depId) => {
                      const depNode = nodes.find((n) => n.id === depId);
                      return (
                        <div
                          key={depId}
                          className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] text-xs"
                        >
                          <span className="text-[#FFF8F0] font-medium">
                            {depNode ? depNode.name : depId}
                          </span>
                          <span className="text-[10px] font-mono text-amber-400">
                            Impaired
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Recovery Order Recommendation */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-[#A3ADC2]">
                <span className="font-semibold text-[#FFF8F0] block mb-1">
                  Autonomous Playbook Assignment:
                </span>
                {selectedNode.type === 'database'
                  ? 'High-Risk Database Failover to replica. Human Commander approval gate required.'
                  : selectedNode.type === 'cache'
                  ? 'Automated Cache Invalidation and connection pool reconnection.'
                  : 'Zero-Downtime Rolling Service Pod Restart.'}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-[#6E7A94]">
              Select a service from the DAG topology to inspect its blast radius.
            </div>
          )}
        </div>

        {selectedNode && (
          <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
            <Button
              variant={selectedNode.status === 'down' ? 'primary' : 'danger'}
              size="sm"
              onClick={() => handleToggleState(selectedNode.id, selectedNode.status)}
              className="w-full text-xs font-semibold"
            >
              {selectedNode.status === 'down' ? 'Restore Service' : 'Simulate Failure'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );

  function renderNode(node: SystemNode) {
    const isSelected = selectedNodeId === node.id;
    const isImpacted = blastRadius.includes(node.id);
    const isDown = node.status === 'down';

    return (
      <div
        key={node.id}
        onClick={() => setSelectedNodeId(node.id)}
        className={`p-3.5 rounded-xl border backdrop-blur-xl cursor-pointer transition-all duration-200 min-w-[150px] flex flex-col items-center gap-2 select-none ${
          isDown
            ? 'bg-red-500/15 border-red-500/40 shadow-lg shadow-red-500/20 scale-105'
            : isSelected
            ? 'bg-blue-500/15 border-blue-500/50 shadow-lg shadow-blue-500/20 scale-105'
            : isImpacted
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.06]'
        }`}
      >
        <span className="text-xs font-bold text-[#FFF8F0] text-center">{node.name}</span>
        <Badge status={node.status as any}>{node.status}</Badge>
        {isImpacted && (
          <span className="text-[9px] font-mono font-semibold text-amber-300">
            &bull; Impacted
          </span>
        )}
      </div>
    );
  }

  function ConnectorArrow({ text }: { text: string }) {
    return (
      <div className="flex flex-col items-center gap-1 text-[10px] font-mono text-[#6E7A94]">
        <div className="w-px h-6 bg-gradient-to-b from-blue-500/40 to-transparent" />
        <span>{text}</span>
      </div>
    );
  }
};
