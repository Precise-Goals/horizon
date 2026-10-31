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
      <Card className="p-6 lg:col-span-2 flex flex-col justify-between min-h-[580px] relative overflow-hidden skeuo-card border-[#E5D7C5]">
        {/* Subtle Network Dot Grid */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(#0047AB_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

        <div>
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#EADCC9] relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0047AB]/10 border border-[#0047AB]/25 text-[#0047AB] flex items-center justify-center shadow-inner">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1A1A1A] tracking-tight">
                  Autonomous Dependency DAG
                </h2>
                <p className="text-xs text-[#6E6258] font-medium">
                  Topological recovery flow: Foundational Data Layer &rarr; Gateway &rarr; Web Edge
                </p>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={loadTopology} className="gap-1.5 text-xs font-semibold">
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
        <div className="mt-8 pt-4 border-t border-[#EADCC9] flex flex-wrap items-center justify-between text-xs text-[#6E6258] relative z-10">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" /> Healthy
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-xs" /> Down
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-600 shadow-xs" /> Blast Radius Affected
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#8A7B6D] font-bold">Click any node to inspect blast radius</span>
        </div>
      </Card>

      {/* Side Impact & Blast Radius Inspection Panel */}
      <Card className="p-6 flex flex-col justify-between skeuo-card border-[#E5D7C5]">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#EADCC9]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0047AB]/10 text-[#0047AB] border border-[#0047AB]/20 flex items-center justify-center">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#1A1A1A] tracking-tight">
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
              <div className="p-4 rounded-xl skeuo-well border-[#E5D7C5]">
                <span className="text-[10px] text-[#8A7B6D] uppercase font-mono tracking-wider font-bold">
                  Target Service
                </span>
                <div className="text-lg font-black text-[#1A1A1A] mt-0.5">
                  {selectedNode.name}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white border border-[#D9C8B5] text-[#0047AB] font-bold">
                    ID: {selectedNode.id}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white border border-[#D9C8B5] text-[#6E6258] font-semibold">
                    TYPE: {selectedNode.type}
                  </span>
                </div>
              </div>

              {/* Blast Radius Count - Cobalt Blue Patch */}
              <div className="p-4 rounded-xl cobalt-patch shadow-lg shadow-[#0047AB]/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Calculated Blast Radius</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                    {blastRadius.length} Cascaded Services
                  </span>
                </div>

                <p className="text-xs text-white/80 mt-2 font-medium">
                  If <strong className="text-white underline">{selectedNode.name}</strong> experiences downtime, the following downstream systems are impaired:
                </p>

                <div className="mt-3 space-y-1.5">
                  {blastRadius.length === 0 ? (
                    <div className="text-xs text-emerald-200 flex items-center gap-1.5 py-1 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Edge leaf node: 0 downstream dependencies impacted.</span>
                    </div>
                  ) : (
                    blastRadius.map((depId) => {
                      const depNode = nodes.find((n) => n.id === depId);
                      return (
                        <div
                          key={depId}
                          className="flex items-center justify-between p-2 rounded-lg bg-black/20 border border-white/10 text-xs"
                        >
                          <span className="text-white font-semibold">
                            {depNode ? depNode.name : depId}
                          </span>
                          <span className="text-[10px] font-mono text-amber-300 font-bold">
                            Impaired
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Recovery Order Recommendation */}
              <div className="p-3.5 rounded-xl skeuo-well border-[#E5D7C5] text-xs text-[#5A4E44]">
                <span className="font-bold text-[#1A1A1A] block mb-1">
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
            <div className="text-center py-12 text-xs text-[#8A7B6D] font-medium">
              Select a service from the DAG topology to inspect its blast radius.
            </div>
          )}
        </div>

        {selectedNode && (
          <div className="mt-6 pt-4 border-t border-[#EADCC9] flex items-center justify-between gap-3">
            <Button
              variant={selectedNode.status === 'down' ? 'primary' : 'danger'}
              size="sm"
              onClick={() => handleToggleState(selectedNode.id, selectedNode.status)}
              className="w-full text-xs font-bold py-2.5 rounded-xl"
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
        className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 min-w-[150px] flex flex-col items-center gap-2 select-none ${
          isDown
            ? 'bg-red-50 border-red-300 shadow-md shadow-red-500/10 scale-105'
            : isSelected
            ? 'bg-blue-50 border-[#0047AB] shadow-md shadow-[#0047AB]/20 scale-105 ring-2 ring-[#0047AB]/20'
            : isImpacted
            ? 'bg-amber-50/80 border-amber-300 shadow-xs'
            : 'bg-white border-[#E5D7C5] shadow-xs hover:border-[#0047AB]/50 hover:shadow-md'
        }`}
      >
        <span className="text-xs font-bold text-[#1A1A1A] text-center">{node.name}</span>
        <Badge status={node.status as any}>{node.status}</Badge>
        {isImpacted && (
          <span className="text-[10px] font-mono font-bold text-amber-800">
            &bull; Impacted
          </span>
        )}
      </div>
    );
  }

  function ConnectorArrow({ text }: { text: string }) {
    return (
      <div className="flex flex-col items-center gap-1 text-[10px] font-mono text-[#8A7B6D] font-bold">
        <div className="w-px h-6 bg-gradient-to-b from-[#0047AB]/60 to-transparent" />
        <span>{text}</span>
      </div>
    );
  }
};
