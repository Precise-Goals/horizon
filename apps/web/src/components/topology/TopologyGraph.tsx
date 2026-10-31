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
  ArrowDown,
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Main Interactive Visualizer */}
      <Card className="p-5 sm:p-6 lg:col-span-2 flex flex-col justify-between min-h-[560px] relative overflow-hidden">
        {/* Subtle Network Dot Grid */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#ECECF0_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

        <div>
          <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-white/[0.07] relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[7px] bg-[#6366F1]/15 border border-[#6366F1]/25 text-[#6366F1] flex items-center justify-center">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-[#ECECF0] tracking-tight">
                  Autonomous Dependency DAG
                </h2>
                <p className="text-[11px] text-[#A0A0AB]">
                  Topological recovery flow: Foundational Data Layer &rarr; Gateway &rarr; Web Ingress
                </p>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={loadTopology} className="gap-1.5 text-xs">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh DAG</span>
            </Button>
          </div>

          {/* Interactive Tiered Canvas */}
          <div className="relative z-10 py-3 flex flex-col items-center gap-6">
            {/* Tier 1: Client Edge */}
            <div className="flex justify-center gap-4 w-full">
              {tier1.map((n) => renderNode(n))}
            </div>

            <ConnectorArrow text="Directs User Traffic" />

            {/* Tier 2: Gateway */}
            <div className="flex justify-center gap-4 w-full">
              {tier2.map((n) => renderNode(n))}
            </div>

            <ConnectorArrow text="Authenticates & Routes" />

            {/* Tier 3: Microservices */}
            <div className="flex justify-center gap-4 w-full flex-wrap">
              {tier3.map((n) => renderNode(n))}
            </div>

            <ConnectorArrow text="Caches & Persists" />

            {/* Tier 4 & 5: Cache & Database Foundational */}
            <div className="flex justify-center gap-4 w-full flex-wrap">
              {tier4.map((n) => renderNode(n))}
              {tier5.map((n) => renderNode(n))}
            </div>
          </div>
        </div>

        {/* Legend Footer */}
        <div className="mt-6 pt-3.5 border-t border-white/[0.06] flex flex-wrap items-center justify-between text-xs text-[#A0A0AB] relative z-10">
          <div className="flex items-center gap-3.5">
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#34D399]" /> Healthy
            </span>
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#F87171]" /> Down
            </span>
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#FBBF24]" /> Blast Radius Impacted
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#63636E]">Click any node to inspect blast radius</span>
        </div>
      </Card>

      {/* Side Impact & Blast Radius Inspection Panel */}
      <Card className="p-5 sm:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-white/[0.07]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[6px] bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/25 flex items-center justify-center">
                <AlertOctagon className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-[#ECECF0]">
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
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-[9px] bg-[#101012] border border-white/[0.07]">
                <span className="text-[10px] text-[#63636E] uppercase font-mono tracking-wider font-semibold">
                  Target Service
                </span>
                <div className="text-base font-bold text-[#ECECF0] mt-0.5">
                  {selectedNode.name}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-[#7C7FF7]">
                    ID: {selectedNode.id}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-[#A0A0AB]">
                    TYPE: {selectedNode.type}
                  </span>
                </div>
              </div>

              {/* Blast Radius Section */}
              <div className="p-3.5 rounded-[9px] bg-[#1A1829] border border-[#6366F1]/30 shadow-[0_4px_16px_rgba(99,102,241,0.12)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#ECECF0]">Calculated Blast Radius</span>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.2 rounded-full bg-[#6366F1]/20 text-[#7C7FF7] border border-[#6366F1]/35">
                    {blastRadius.length} Cascaded Services
                  </span>
                </div>

                <p className="text-xs text-[#A0A0AB] mt-1.5 leading-relaxed">
                  If <strong className="text-[#ECECF0]">{selectedNode.name}</strong> experiences outage, downstream services fail in cascade:
                </p>

                <div className="mt-2.5 space-y-1.5 max-h-[160px] overflow-y-auto">
                  {blastRadius.length === 0 ? (
                    <div className="text-xs text-[#34D399] flex items-center gap-1.5 py-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                      <span>Edge leaf node: 0 downstream dependencies impacted.</span>
                    </div>
                  ) : (
                    blastRadius.map((depId) => {
                      const depNode = nodes.find((n) => n.id === depId);
                      return (
                        <div
                          key={depId}
                          className="flex items-center justify-between p-2 rounded-[6px] bg-black/40 border border-white/[0.08] text-xs"
                        >
                          <span className="text-[#ECECF0] font-medium">
                            {depNode ? depNode.name : depId}
                          </span>
                          <span className="text-[10px] font-mono text-[#FBBF24]">
                            Impaired
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Recovery Order Recommendation */}
              <div className="p-3 rounded-[8px] bg-[#101012] border border-white/[0.06] text-xs text-[#A0A0AB]">
                <span className="font-semibold text-[#ECECF0] block mb-1">
                  Autonomous Playbook Assignment:
                </span>
                {selectedNode.type === 'database'
                  ? 'High-Risk Database Failover to replica. BridgeKey human approval gate enforced.'
                  : selectedNode.type === 'cache'
                  ? 'Automated Cache Flush and connection pool re-establishment.'
                  : 'Zero-Downtime Rolling Kubernetes Pod Restart.'}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-[#63636E]">
              Select a service from the DAG to inspect its blast radius.
            </div>
          )}
        </div>

        {selectedNode && (
          <div className="mt-5 pt-3.5 border-t border-white/[0.06]">
            <Button
              variant={selectedNode.status === 'down' ? 'primary' : 'danger'}
              size="sm"
              onClick={() => handleToggleState(selectedNode.id, selectedNode.status)}
              className="w-full text-xs py-2"
            >
              {selectedNode.status === 'down' ? 'Restore Service (Simulate Recovery)' : 'Simulate Failure (Test Blast Radius)'}
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
        className={`p-3 rounded-[10px] border cursor-pointer transition-all duration-150 min-w-[140px] flex flex-col items-center gap-1.5 select-none ${
          isDown
            ? 'bg-[rgba(248,113,113,0.12)] border-[rgba(248,113,113,0.4)] shadow-[0_0_16px_rgba(248,113,113,0.2)] scale-102'
            : isSelected
            ? 'bg-[#6366F1]/15 border-[#6366F1] shadow-[0_0_16px_rgba(99,102,241,0.25)] scale-102'
            : isImpacted
            ? 'bg-[rgba(251,191,36,0.08)] border-[rgba(251,191,36,0.35)]'
            : 'bg-[#18181B] border-white/[0.08] hover:border-white/[0.16]'
        }`}
      >
        <span className="text-xs font-semibold text-[#ECECF0] text-center">{node.name}</span>
        <Badge status={node.status as any}>{node.status}</Badge>
        {isImpacted && (
          <span className="text-[10px] font-mono text-[#FBBF24]">
            &bull; Impacted
          </span>
        )}
      </div>
    );
  }

  function ConnectorArrow({ text }: { text: string }) {
    return (
      <div className="flex flex-col items-center gap-0.5 text-[10px] font-mono text-[#63636E]">
        <div className="w-px h-5 bg-gradient-to-b from-[#6366F1]/50 to-transparent" />
        <span>{text}</span>
      </div>
    );
  }
};
