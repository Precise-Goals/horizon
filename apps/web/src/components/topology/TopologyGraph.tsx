import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ArrowRight } from 'lucide-react';

export const TopologyGraph = () => {
  const [simulated, setSimulated] = useState(false);

  return (
    <Card className="min-h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-6 border-b-2 border-[#1A1A1A] pb-4">
        <h2 className="text-xl font-black uppercase">Dependency Topology Map</h2>
        <Button variant={simulated ? "secondary" : "danger"} onClick={() => setSimulated(!simulated)}>
          {simulated ? "Clear Simulation" : "Simulate Blast Radius"}
        </Button>
      </div>

      <div className="flex-1 relative flex items-center justify-center p-8 bg-[#FFF8F0] border-2 border-[#1A1A1A] border-dashed">
        <div className="flex flex-col items-center gap-12">
          {/* Tier 1 */}
          <div className="flex gap-16">
            <Node name="Frontend" status="healthy" />
          </div>

          <ArrowRight className="rotate-90 w-8 h-8 text-[#1A1A1A]" />

          {/* Tier 2 */}
          <div className="flex gap-16">
            <Node name="API Gateway" status={simulated ? "degraded" : "healthy"} />
          </div>

          <div className="flex gap-16 justify-center w-full">
            <ArrowRight className="rotate-120 w-8 h-8 text-[#1A1A1A]" />
            <ArrowRight className="rotate-60 w-8 h-8 text-[#1A1A1A]" />
          </div>

          {/* Tier 3 */}
          <div className="flex gap-16">
            <Node name="Auth Service" status="healthy" />
            <Node name="Postgres DB" status={simulated ? "down" : "healthy"} />
            <Node name="Redis Cache" status="healthy" />
          </div>
        </div>
      </div>
    </Card>
  );
};

const Node = ({ name, status }: { name: string, status: string }) => (
  <div className={`p-4 border-[3px] border-[#1A1A1A] bg-white flex flex-col items-center gap-2 min-w-[140px] shadow-[4px_4px_0px_#1A1A1A] transition-all ${status === 'down' ? 'animate-pulse bg-red-50' : ''}`}>
    <span className="font-bold text-sm uppercase">{name}</span>
    <Badge status={status as any}>{status}</Badge>
  </div>
);
