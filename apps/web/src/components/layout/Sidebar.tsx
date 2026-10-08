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
    accent: 'text-[#0047AB]',
  },
  {
    to: '/topology',
    label: 'Topology Map',
    icon: Network,
    desc: 'DAG & Blast Radius',
    accent: 'text-[#0047AB]',
  },
  {
    to: '/recovery',
    label: 'Recovery Engine',
    icon: RotateCcw,
    desc: 'Autonomous playbooks',
    accent: 'text-[#D97706]',
  },
  {
    to: '/architect',
    label: 'AI Flow Architect',
    icon: Sparkles,
    desc: 'Natural language DAG',
    accent: 'text-[#0047AB]',
  },
  {
    to: '/audit',
    label: 'Audit Trail',
    icon: ShieldCheck,
    desc: 'Tamper-proof logs',
    accent: 'text-[#0F8E52]',
  },
  {
    to: '/subscription',
    label: 'NFT Subscriptions',
    icon: Gem,
    desc: 'Web3 tier access',
    accent: 'text-[#7C3AED]',
  },
] as const;

export const Sidebar: React.FC = () => {
  const [autonomousMode, setAutonomousMode] = useState(true);
  const metrics = autonomousWatchdog.getMetrics();

  return (
    <aside className="horizon-sidebar w-64 flex-shrink-0 hidden lg:flex flex-col bg-[#FAF3EA] border-r border-[rgba(26,26,26,0.12)] shadow-[1px_0_0_#FFFFFF]">
      {/* Navigation */}
      <nav className="horizon-sidebar-nav flex-1 py-6 px-3.5 flex flex-col gap-1">
        {/* Section label */}
        <div className="px-3 pb-2 mb-1 flex items-center justify-between">
          <span className="text-label text-[#666666] font-bold">Command Modules</span>
          <span className="horizon-badge text-[10px] text-[#0047AB] bg-[#EBF1FA] border-[#0047AB]/20">
            SRE v1.0
          </span>
        </div>

        {NAV_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'horizon-sidebar-link group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-[#F2E7D8] text-[#0047AB] border border-[rgba(26,26,26,0.14)] shadow-[inset_0_2px_4px_rgba(26,26,26,0.06),0_1px_0_#FFFFFF]'
                    : 'text-[#444444] hover:text-[#1A1A1A] hover:bg-[#F5EDE2] border border-transparent hover:border-[rgba(26,26,26,0.08)]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      'flex-shrink-0 p-1.5 rounded-lg transition-colors border',
                      isActive
                        ? 'bg-[#0047AB] text-[#FFF8F0] border-[#003680] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_1px_2px_rgba(0,71,171,0.25)]'
                        : 'bg-white text-[#666666] border-[rgba(26,26,26,0.1)] group-hover:text-[#0047AB] group-hover:border-[#0047AB]/30'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-bold leading-none truncate">
                      {link.label}
                    </span>
                    <span className="text-[11px] text-[#777777] group-hover:text-[#555555] transition-colors mt-0.5 leading-none">
                      {link.desc}
                    </span>
                  </div>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-4 rounded-full bg-[#0047AB] shadow-[0_0_6px_#0047AB]" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Physical Telemetry Box */}
      <div className="horizon-sidebar-status m-3.5 p-4 rounded-2xl bg-white border border-[rgba(26,26,26,0.12)] shadow-[inset_0_1px_0_#FFFFFF,0_2px_6px_rgba(26,26,26,0.05)]">
        {/* Autonomous Mode Physical Toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'skeuo-led',
                autonomousMode ? 'skeuo-led-healthy animate-pulse' : 'bg-gray-400'
              )}
            />
            <span className="text-xs font-bold text-[#1A1A1A]">Autonomous</span>
          </div>

          <button
            type="button"
            onClick={() => setAutonomousMode(!autonomousMode)}
            aria-label={`${autonomousMode ? 'Disable' : 'Enable'} autonomous mode`}
            className={cn(
              'relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border border-[rgba(26,26,26,0.18)]',
              'transition-colors duration-150 focus:outline-none shadow-[inset_0_2px_3px_rgba(26,26,26,0.12)]',
              autonomousMode ? 'bg-[#0047AB]' : 'bg-[#E5DCD0]'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_#FFF] transition duration-150 ease-in-out',
                autonomousMode ? 'translate-x-5' : 'translate-x-0.5'
              )}
            />
          </button>
        </div>

        {/* Telemetry debossed well */}
        <div className="skeuo-well p-2.5 space-y-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="flex items-center gap-1.5 text-[#666666] font-medium">
              <Cpu className="w-3 h-3 text-[#0047AB]" aria-hidden="true" />
              Strategy
            </span>
            <span className="font-mono text-[#1A1A1A] font-bold">Topological DAG</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="flex items-center gap-1.5 text-[#666666] font-medium">
              <Layers className="w-3 h-3 text-[#7C3AED]" aria-hidden="true" />
              Approval Gate
            </span>
            <span className="font-mono text-[#0F8E52] font-bold">Active</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="flex items-center gap-1.5 text-[#666666] font-medium">
              <Activity className="w-3 h-3 text-[#0047AB]" aria-hidden="true" />
              Incidents
            </span>
            <span className="font-mono text-[#1A1A1A] font-bold">
              {metrics.totalIncidentsDiscovered}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
