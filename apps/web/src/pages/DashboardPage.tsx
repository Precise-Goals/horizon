import React from 'react';
import { BentoGrid } from '../components/layout/BentoGrid';
import { MetricWidget } from '../components/dashboard/MetricWidget';
import { SystemHealthOverview } from '../components/dashboard/SystemHealthOverview';
import { RecentActivityWidget } from '../components/dashboard/RecentActivityWidget';
import { Clock, Activity, Server, AlertTriangle } from 'lucide-react';

export const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black uppercase tracking-tight">Command Center</h1>
      </div>
      
      <BentoGrid>
        <MetricWidget title="Mean Time To Recovery" value="4.2m" trend="-12% vs last month" icon={<Clock />} />
        <MetricWidget title="System Uptime" value="99.98%" trend="+0.01% vs last month" icon={<Activity />} />
        <MetricWidget title="Active Nodes" value="7" icon={<Server />} />
        <MetricWidget title="Unhandled Failures" value="0" className="bg-[#22C55E] text-black" icon={<AlertTriangle />} />
      </BentoGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SystemHealthOverview />
        <RecentActivityWidget />
      </div>
    </div>
  );
};
