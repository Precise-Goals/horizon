import React from 'react';
import { TopologyGraph } from '../components/topology/TopologyGraph';

export const TopologyPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black uppercase tracking-tight">System Topology</h1>
      <TopologyGraph />
    </div>
  );
};
