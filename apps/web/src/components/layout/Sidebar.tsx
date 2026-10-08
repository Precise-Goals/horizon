import React from 'react';
import { NavLink } from 'react-router';
import { LayoutDashboard, Network, PlaySquare, ShieldAlert, Wallet } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Sidebar = () => {
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/topology', label: 'Topology Map', icon: Network },
    { to: '/recovery', label: 'Recovery Orchestrator', icon: PlaySquare },
    { to: '/audit', label: 'Audit Trail', icon: ShieldAlert },
    { to: '/subscription', label: 'NFT Subscriptions', icon: Wallet },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r-4 border-[#1A1A1A] hidden md:flex flex-col">
      <div className="flex-1 py-6 flex flex-col gap-2 px-4">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 font-bold uppercase text-sm border-2 transition-all",
                  isActive
                    ? "bg-[#0047AB] text-white border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] translate-x-[-2px] translate-y-[-2px]"
                    : "bg-white text-black border-transparent hover:border-[#1A1A1A] hover:shadow-[4px_4px_0px_#1A1A1A] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                )
              }
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};
