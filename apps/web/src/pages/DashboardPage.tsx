import React, { useState, useEffect } from 'react';
import { MetricWidget } from '../components/dashboard/MetricWidget';
import { CommandBar } from '../components/copilot/CommandBar';
import { SystemHealthOverview } from '../components/dashboard/SystemHealthOverview';
import { RecentActivityWidget } from '../components/dashboard/RecentActivityWidget';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { fetchNodes, fetchHealth } from '../lib/api';
import type { SystemNode } from '../types';
import {
  Clock,
  Activity,
  Server,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router';

export const DashboardPage: React.FC = () => {
  const [nodes, setNodes] = useState<SystemNode[]>([]);
  const [healthStatus, setHealthStatus] = useState<string>('UP');
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      const [n, h] = await Promise.all([fetchNodes(), fetchHealth()]);
      setNodes(n);
      setHealthStatus(h.status);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalNodes = nodes.length || 7;
  const downCount = nodes.filter((n) => n.status === 'down' || n.status === 'degraded').length;
  const healthyCount = nodes.filter((n) => n.status === 'healthy').length;
  const availabilityPct = totalNodes > 0 ? ((healthyCount / totalNodes) * 100).toFixed(1) : '99.9';

  return (
    <div className="space-y-6">
      {/* Header and Quick Operations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#FFF8F0]">
            Resilience Command Center
          </h1>
          <p className="text-xs text-[#A3ADC2] mt-0.5">
            Autonomous multi-tier telemetry and real-time dependency health monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            className="gap-1.5 text-xs"
            title="Poll endpoints"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Poll Cluster</span>
          </Button>

          <Link to="/recovery">
            <Button variant="primary" size="sm" className="gap-1.5 text-xs font-semibold">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Orchestrate Recovery</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Sarvam AI SRE Copilot Command Bar */}
      <CommandBar />

      {/* KPI Metric Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricWidget
          title="Mean Time To Recovery"
          value="3.8m"
          trend="-18% vs avg"
          isPositive={true}
          icon={<Clock className="w-4 h-4" />}
          subtitle="Target SLA: < 5.0m"
        />
        <MetricWidget
          title="Cluster Availability"
          value={`${availabilityPct}%`}
          trend={downCount === 0 ? "100% Operational" : `${downCount} Nodes Degraded`}
          isPositive={downCount === 0}
          icon={<Activity className="w-4 h-4" />}
          subtitle="99.95% Monthly SLA"
        />
        <MetricWidget
          title="Monitored Services"
          value={totalNodes}
          icon={<Server className="w-4 h-4" />}
          subtitle="PostgreSQL, Redis, Gateway, Auth"
        />
        <MetricWidget
          title="Active Outages"
          value={downCount}
          trend={downCount === 0 ? "0 Unhandled" : "Autonomous Plan Ready"}
          isPositive={downCount === 0}
          icon={<AlertTriangle className="w-4 h-4" />}
          subtitle="Continuous Health Probes"
        />
      </div>

      {/* Main Grid: Services Overview and Real-Time Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SystemHealthOverview />
        <RecentActivityWidget />
      </div>

      {/* Bottom Observability Strip */}
      <Card className="p-4 flex flex-wrap items-center justify-between gap-4 text-xs text-[#A3ADC2]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[#FFF8F0]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Backend FastAPI: <strong>http://127.0.0.1:8000</strong>
          </span>
          <span className="font-mono text-[11px] text-blue-400">
            Health: {healthStatus}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/topology" className="text-blue-400 hover:underline">
            Inspect Topology DAG &rarr;
          </Link>
        </div>
      </Card>
    </div>
  );
};
