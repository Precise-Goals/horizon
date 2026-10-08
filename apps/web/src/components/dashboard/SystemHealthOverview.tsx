import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Server, Database, Globe, Key } from 'lucide-react';

export const SystemHealthOverview = () => {
  const [failed, setFailed] = useState(false);

  const nodes = [
    { name: 'API Gateway', icon: Globe, status: failed ? 'degraded' : 'healthy' },
    { name: 'Auth Service', icon: Key, status: 'healthy' },
    { name: 'Postgres Primary', icon: Database, status: failed ? 'down' : 'healthy' },
    { name: 'Redis Cache', icon: Server, status: 'healthy' },
  ] as const;

  return (
    <Card className="col-span-1 md:col-span-2">
      <div className="flex items-center justify-between mb-6 border-b-2 border-[#1A1A1A] pb-4">
        <h2 className="text-xl font-black uppercase">System Health Overview</h2>
        <Button 
          variant={failed ? "secondary" : "danger"} 
          size="sm" 
          onClick={() => setFailed(!failed)}
        >
          {failed ? "Reset Simulation" : "Simulate Failure"}
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {nodes.map((node) => {
          const Icon = node.icon;
          return (
            <div key={node.name} className="flex flex-col items-center p-4 border-2 border-[#1A1A1A] bg-[#FFF8F0] gap-3 text-center">
              <Icon className="w-8 h-8" />
              <span className="font-bold text-sm uppercase">{node.name}</span>
              <Badge status={node.status as any}>
                {node.status}
              </Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
