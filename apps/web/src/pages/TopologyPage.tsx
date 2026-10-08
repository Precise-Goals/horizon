import React from 'react';
import { TopologyGraph } from '../components/topology/TopologyGraph';

export const TopologyPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#FFF8F0]">
          Infrastructure Dependency Topology
        </h1>
        <p className="text-xs text-[#A3ADC2] mt-0.5">
          Dynamic Directed Acyclic Graph (DAG) visualizing parent-child service relationships and real-time failure cascade blast radius.
        </p>
      </div>
      <TopologyGraph />
    </div>
  );
};
