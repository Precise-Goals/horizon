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
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC = () => {
  const [autonomousMode, setAutonomousMode] = useState(true);

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Real-time telemetry' },
    { to: '/topology', label: 'Topology Map', icon: Network, desc: 'DAG & Blast Radius' },
    { to: '/recovery', label: 'Recovery Engine', icon: RotateCcw, desc: 'Autonomous playbooks' },
    { to: '/audit', label: 'Audit Trail', icon: ShieldCheck, desc: 'Tamper-proof logs' },
    { to: '/subscription', label: 'NFT Subscriptions', icon: Gem, desc: 'Web3 tier access' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#070A10]/90 backdrop-blur-2xl border-r border-white/[0.08] hidden lg:flex flex-col justify-between">
      {/* Navigation section */}
      <div className="py-6 px-3 flex flex-col gap-1.5">
        <div className="px-3 pb-3 mb-2 border-b border-white/[0.06] flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#A3ADC2] uppercase tracking-wider">
            Command Modules
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            LIVE
          </span>
        </div>

        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#1E6BFF]/15 text-[#FFF8F0] border border-blue-500/30 shadow-md shadow-blue-500/10"
                    : "text-[#A3ADC2] hover:text-[#FFF8F0] hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-500/20 text-[#1E6BFF]"
                        : "text-[#A3ADC2] group-hover:text-[#FFF8F0] group-hover:bg-white/[0.06]"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="leading-none">{link.label}</span>
                    <span className="text-[10px] text-[#6E7A94] group-hover:text-[#A3ADC2] transition-colors mt-0.5">
                      {link.desc}
                    </span>
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Observability Telemetry Box */}
      <div className="p-4 m-3 rounded-2xl bg-[#0D121E]/80 border border-white/[0.08] backdrop-blur-xl shadow-lg shadow-black/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FFF8F0]">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Autonomous Mode</span>
          </div>
          <button
            onClick={() => setAutonomousMode(!autonomousMode)}
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
              autonomousMode ? "bg-[#1E6BFF]" : "bg-white/20"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                autonomousMode ? "translate-x-4" : "translate-x-0"
              )}
            />
          </button>
        </div>

        <div className="space-y-1.5 text-[11px] text-[#A3ADC2] pt-2 border-t border-white/[0.06]">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-blue-400" />
              Engine Strategy
            </span>
            <span className="font-mono text-[#FFF8F0]">Topological DAG</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-purple-400" />
              Approval Gate
            </span>
            <span className="font-mono text-emerald-400">Enforced</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-[#6E7A94]">
          <span className="flex items-center gap-1 text-blue-400 font-medium">
            <Sparkles className="w-3 h-3" />
            Vercel Ready
          </span>
          <span className="font-mono">FastAPI v1.0</span>
        </div>
      </div>
    </aside>
  );
};
