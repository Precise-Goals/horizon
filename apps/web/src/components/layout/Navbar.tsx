import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { Button } from '../common/Button';
import { AuthModal } from '../auth/AuthModal';
import { MSTWalletModal } from '../wallet/MSTWalletModal';
import { useAuth } from '../../context/useAuth';
import { fetchHealth, fetchNodes } from '../../lib/api';
import { mstBlockchain } from '../../engine/mstBlockchain';
import {
  Activity,
  LayoutDashboard,
  Network,
  RotateCcw,
  ShieldCheck,
  Gem,
  ExternalLink,
  Wallet,
  User as UserIcon,
  ChevronDown,
  Layers,
  Cpu,
  FileText,
  LogOut,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<string>('...');
  const [healthStatus, setHealthStatus] = useState<'UP' | 'DEGRADED' | 'CHECKING'>('CHECKING');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [incidentCount, setIncidentCount] = useState<number>(0);

  // Active dropdown tracker: 'platform' | 'governance' | 'resources' | 'profile' | null
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close dropdown on route change
  useEffect(() => {
    setOpenDropdown(null);
  }, [location.pathname]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch live MST balance
  useEffect(() => {
    mstBlockchain.getBalance()
      .then((bal) => setWalletBalance(`${bal} MST`))
      .catch(() => setWalletBalance('0.00 MST'));
  }, []);

  // Health and incident polling
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      const start = performance.now();
      try {
        const health = await fetchHealth();
        const duration = Math.round(performance.now() - start);
        if (!isMounted) return;
        setLatencyMs(duration);
        setHealthStatus(health.status === 'UP' ? 'UP' : 'DEGRADED');

        const nodes = await fetchNodes();
        if (!isMounted) return;
        const downCount = nodes.filter((n) => n.status === 'down' || n.status === 'degraded').length;
        setIncidentCount(downCount);
      } catch {
        if (!isMounted) return;
        setHealthStatus('DEGRADED');
        setLatencyMs(null);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const isPlatformActive = ['/dashboard', '/topology', '/recovery'].includes(location.pathname);
  const isGovernanceActive = ['/audit', '/subscription'].includes(location.pathname);

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-nav backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4" ref={navRef}>
          
          {/* Brand Left */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[#0F1626] border border-blue-500/30 shadow-lg shadow-blue-500/20 group-hover:border-blue-400 transition-all">
                <img
                  src="/logo.png"
                  alt="Horizon"
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <Activity className="w-5 h-5 text-[#1E6BFF]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold tracking-tight text-[#FFF8F0] group-hover:text-blue-400 transition-colors">
                    Horizon
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    SRE
                  </span>
                </div>
              </div>
            </Link>

            {/* Micro Health Pill */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08]">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    healthStatus === 'UP' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    healthStatus === 'UP' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </span>
              <span className="text-[11px] text-[#A3ADC2]">
                {healthStatus === 'UP' ? 'Healthy' : 'Degraded'}
              </span>
              {latencyMs !== null && (
                <span className="text-[10px] font-mono text-[#6E7A94] border-l border-white/10 pl-1.5">
                  {latencyMs}ms
                </span>
              )}
            </div>
          </div>

          {/* Center: React Bits Concise Dropdown Navigation */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-white/[0.02] border border-white/[0.06] relative">
            
            {/* 1. Platform Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('platform')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isPlatformActive || openDropdown === 'platform'
                    ? 'bg-blue-500/15 text-[#FFF8F0] border border-blue-500/30'
                    : 'text-[#A3ADC2] hover:text-[#FFF8F0] hover:bg-white/[0.04]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Platform</span>
                {incidentCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                    {incidentCount}
                  </span>
                )}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#6E7A94] transition-transform duration-200 ${
                    openDropdown === 'platform' ? 'rotate-180 text-blue-400' : ''
                  }`}
                />
              </button>

              {/* Flyout Card */}
              {openDropdown === 'platform' && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl p-2 bg-[#0C101A]/95 border border-white/[0.1] shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <Link
                    to="/dashboard"
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:border-blue-400">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#FFF8F0] group-hover:text-blue-300">
                        Resilience Dashboard
                      </div>
                      <div className="text-[10px] text-[#A3ADC2]">
                        Cluster health, MTTR & real-time telemetry
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/topology"
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:border-indigo-400">
                      <Network className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#FFF8F0] group-hover:text-indigo-300">
                        Topology & Graph
                      </div>
                      <div className="text-[10px] text-[#A3ADC2]">
                        DAG dependency visualizer & blast radius
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/recovery"
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:border-amber-400">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-[#FFF8F0] flex items-center justify-between group-hover:text-amber-300">
                        <span>Autonomous Recovery</span>
                        {incidentCount > 0 && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                            {incidentCount} active
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#A3ADC2]">
                        Deterministic playbooks & execution gates
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* 2. Governance & Web3 Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('governance')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isGovernanceActive || openDropdown === 'governance'
                    ? 'bg-blue-500/15 text-[#FFF8F0] border border-blue-500/30'
                    : 'text-[#A3ADC2] hover:text-[#FFF8F0] hover:bg-white/[0.04]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Governance</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#6E7A94] transition-transform duration-200 ${
                    openDropdown === 'governance' ? 'rotate-180 text-blue-400' : ''
                  }`}
                />
              </button>

              {/* Flyout Card */}
              {openDropdown === 'governance' && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl p-2 bg-[#0C101A]/95 border border-white/[0.1] shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <Link
                    to="/audit"
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:border-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#FFF8F0] group-hover:text-emerald-300">
                        Immutable Audit Log
                      </div>
                      <div className="text-[10px] text-[#A3ADC2]">
                        Hash-chain verification on MST Testnet
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/subscription"
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:border-purple-400">
                      <Gem className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#FFF8F0] group-hover:text-purple-300">
                        Web3 Subscription Plans
                      </div>
                      <div className="text-[10px] text-[#A3ADC2]">
                        Token-gated NFT tiers & smart contracts
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* 3. Resources Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('resources')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  openDropdown === 'resources'
                    ? 'bg-blue-500/15 text-[#FFF8F0] border border-blue-500/30'
                    : 'text-[#A3ADC2] hover:text-[#FFF8F0] hover:bg-white/[0.04]'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span>Resources</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#6E7A94] transition-transform duration-200 ${
                    openDropdown === 'resources' ? 'rotate-180 text-blue-400' : ''
                  }`}
                />
              </button>

              {/* Flyout Card */}
              {openDropdown === 'resources' && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl p-2 bg-[#0C101A]/95 border border-white/[0.1] shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <a
                    href="http://127.0.0.1:8000/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:border-blue-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-[#FFF8F0] flex items-center justify-between group-hover:text-blue-300">
                        <span>FastAPI Interactive Docs</span>
                        <ExternalLink className="w-3 h-3 text-[#A3ADC2]" />
                      </div>
                      <div className="text-[10px] text-[#A3ADC2]">
                        OpenAPI specifications & endpoints
                      </div>
                    </div>
                  </a>

                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] mt-1 text-[11px] text-[#A3ADC2] space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span>Network:</span>
                      <span className="text-blue-400">MST Testnet (91562037)</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span>AI Model:</span>
                      <span className="text-purple-400">sarvam-105b</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right: Actions, BridgeKey, Profile */}
          <div className="flex items-center gap-2.5">
            
            {/* BridgeKey Web3 Wallet Trigger */}
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border bg-blue-500/10 border-blue-500/25 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/40 cursor-pointer shadow-sm shadow-blue-500/10"
              title="BridgeKey Wallet — MST Testnet"
            >
              <Wallet className="w-3.5 h-3.5 text-[#1E6BFF]" />
              <span className="font-mono text-[11px]">
                {walletBalance}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" />
            </button>

            {/* Operator Auth Profile / Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('profile')}
                  className="flex items-center gap-2 p-1 pl-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors cursor-pointer"
                >
                  <span className="text-xs text-[#E2D7CB] max-w-[90px] truncate hidden sm:inline">
                    {user.displayName || user.email.split('@')[0]}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#1E6BFF] to-[#0047AB] flex items-center justify-center text-[10px] font-bold text-[#FFF8F0] shadow-sm">
                    {user.email.slice(0, 2).toUpperCase()}
                  </div>
                </button>

                {/* Profile Flyout */}
                {openDropdown === 'profile' && (
                  <div className="absolute top-full right-0 mt-2 w-56 rounded-2xl p-2 bg-[#0C101A]/95 border border-white/[0.1] shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2 border-b border-white/[0.08] mb-1">
                      <div className="text-xs font-semibold text-[#FFF8F0] truncate">
                        {user.displayName || 'Commander'}
                      </div>
                      <div className="text-[10px] font-mono text-[#A3ADC2] truncate">
                        {user.email}
                      </div>
                      <div className="mt-1 inline-block text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {user.role} Access
                      </div>
                    </div>

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAuthOpen(true)}
                className="gap-1.5 text-xs"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <MSTWalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </>
  );
};
