import React, { useState } from 'react';
import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  Network,
  RotateCcw,
  ShieldCheck,
  Gem,
  Radio,
  Cpu,
  Layers,
  Sparkles,
  Activity,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { autonomousWatchdog } from '../../engine/watchdog';

const NAV_LINKS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    desc: 'Real-time telemetry',
    accent: 'text-blue-400',
  },
  {
    to: '/topology',
    label: 'Topology Map',
    icon: Network,
    desc: 'DAG & Blast Radius',
    accent: 'text-indigo-400',
  },
  {
    to: '/recovery',
    label: 'Recovery Engine',
    icon: RotateCcw,
    desc: 'Autonomous playbooks',
    accent: 'text-amber-400',
  },
  {
    to: '/architect',
    label: 'AI Flow Architect',
    icon: Sparkles,
    desc: 'Natural language DAG',
    accent: 'text-cyan-400',
  },
  {
    to: '/audit',
    label: 'Audit Trail',
    icon: ShieldCheck,
    desc: 'Tamper-proof logs',
    accent: 'text-emerald-400',
  },
  {
    to: '/subscription',
    label: 'NFT Subscriptions',
    icon: Gem,
    desc: 'Web3 tier access',
    accent: 'text-purple-400',
  },
] as const;

export const Sidebar: React.FC = () => {
  const [autonomousMode, setAutonomousMode] = useState(true);
  const metrics = autonomousWatchdog.getMetrics();

  return (
    <aside className="horizon-sidebar w-60 flex-shrink-0 hidden lg:flex flex-col bg-[#09111C]/70 backdrop-blur-xl border-r border-white/[0.06]">
      {/* Navigation */}
      <nav className="horizon-sidebar-nav flex-1 py-5 px-3 flex flex-col gap-0.5">
        {/* Section label */}
        <div className="px-3 pb-2 mb-1">
          <span className="text-label text-[#8896A8]">Modules</span>
        </div>

        {NAV_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'horizon-sidebar-link group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-[#1E6BFF]/12 text-[#FFF8F0] border border-[#1E6BFF]/20'
                    : 'text-[#8896A8] hover:text-[#C8D0DE] hover:bg-white/[0.04] border border-transparent'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      'flex-shrink-0 p-1.5 rounded-lg transition-colors',
                      isActive
                        ? `bg-[#1E6BFF]/15 ${link.accent}`
                        : `text-[#8896A8] group-hover:${link.accent} group-hover:bg-white/[0.05]`
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-semibold leading-none truncate">
                      {link.label}
                    </span>
                    <span className="text-[11px] text-[#6B7A8D] group-hover:text-[#8896A8] transition-colors mt-0.5 leading-none">
                      {link.desc}
                    </span>
                  </div>
                  {isActive && (
                    <div className="ml-auto w-1 h-4 rounded-full bg-[#1E6BFF] flex-shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom System Status Panel */}
      <div className="horizon-sidebar-status m-3 p-4 rounded-xl bg-[#0C1420]/80 border border-white/[0.06]">
        {/* Autonomous Mode Toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Radio
              className={cn(
                'w-3.5 h-3.5',
                autonomousMode ? 'text-emerald-400 animate-pulse' : 'text-[#8896A8]'
              )}
              aria-hidden="true"
            />
            <span className="text-[12px] font-semibold text-[#C8D0DE]">Autonomous</span>
          </div>
          <button
            type="button"
            onClick={() => setAutonomousMode(!autonomousMode)}
            aria-label={`${autonomousMode ? 'Disable' : 'Enable'} autonomous mode`}
            className={cn(
              'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent',
              'transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6BFF]',
              autonomousMode ? 'bg-[#1E6BFF]' : 'bg-white/15'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                autonomousMode ? 'translate-x-4' : 'translate-x-0'
              )}
            />
          </button>
        </div>

        {/* Telemetry rows */}
        <hr className="horizon-divider mb-2.5" />
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="flex items-center gap-1 text-[#8896A8]">
              <Cpu className="w-3 h-3 text-blue-400" aria-hidden="true" />
              Strategy
            </span>
            <span className="font-mono text-[#C8D0DE] font-medium">Topological DAG</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="flex items-center gap-1 text-[#8896A8]">
              <Layers className="w-3 h-3 text-purple-400" aria-hidden="true" />
              Approval Gate
            </span>
            <span className="font-mono text-emerald-400 font-medium">Active</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="flex items-center gap-1 text-[#8896A8]">
              <Activity className="w-3 h-3 text-cyan-400" aria-hidden="true" />
              Incidents
            </span>
            <span className="font-mono text-[#C8D0DE] font-medium">
              {metrics.totalIncidentsDiscovered}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
