import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../common/Button';
import { AuthModal } from '../auth/AuthModal';
import { MSTWalletModal } from '../wallet/MSTWalletModal';
import { useAuth } from '../../context/useAuth';
import { fetchHealth, fetchNodes } from '../../lib/api';
import { mstBlockchain } from '../../engine/mstBlockchain';
import type { SystemNode } from '../../types';
import {
  Activity,
  LayoutDashboard,
  Network,
  RotateCcw,
  ShieldCheck,
  Gem,
  Wallet,
  User as UserIcon,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<string>('...');
  const [healthStatus, setHealthStatus] = useState<'UP' | 'DEGRADED' | 'CHECKING'>('CHECKING');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [incidentCount, setIncidentCount] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active dropdown tracker: 'platform' | 'governance' | 'profile' | null
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close dropdown on route change
  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
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
        const downCount = nodes.filter((n: SystemNode) => n.status === 'down' || n.status === 'degraded').length;
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

  const isPlatformActive = ['/dashboard', '/topology', '/recovery', '/architect'].includes(location.pathname);
  const isGovernanceActive = ['/audit', '/subscription'].includes(location.pathname);

  return (
    <>
      {/* React Bits Centered Floating Dock Navbar */}
      <header className="sticky top-3.5 z-50 w-full px-4 sm:px-6 pointer-events-none flex justify-center">
        <div
          ref={navRef}
          className="pointer-events-auto w-full max-w-5xl rounded-full bg-[#0A0E17]/85 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/60 px-3.5 sm:px-5 py-2 flex items-center justify-between gap-3 ring-1 ring-white/[0.05] transition-all"
        >
          {/* Brand Left */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#0F1626] border border-blue-500/30 shadow-md shadow-blue-500/20 group-hover:border-blue-400 group-hover:scale-105 transition-all">
              <img
                src="/logo.png"
                alt="Horizon"
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <Activity className="w-4 h-4 text-[#1E6BFF]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold tracking-wider text-[#FFF8F0] uppercase group-hover:text-blue-400 transition-colors">
                Horizon
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 hidden sm:inline">
                SRE
              </span>
            </div>
          </Link>

          {/* Center: Minimal Dock Links (React Bits Pill Dock) */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.06] relative">
            <Link
              to="/"
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                location.pathname === '/'
                  ? 'bg-blue-500/20 text-[#FFF8F0] border border-blue-500/30 shadow-sm shadow-blue-500/20'
                  : 'text-[#A3ADC2] hover:text-[#FFF8F0] hover:bg-white/[0.04]'
              }`}
            >
              Overview
            </Link>

            {/* Platform Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('platform')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isPlatformActive || openDropdown === 'platform'
                    ? 'bg-blue-500/20 text-[#FFF8F0] border border-blue-500/30'
                    : 'text-[#A3ADC2] hover:text-[#FFF8F0] hover:bg-white/[0.04]'
                }`}
              >
                <span>Platform</span>
                {incidentCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                    {incidentCount}
                  </span>
                )}
                <ChevronDown
                  className={`w-3 h-3 text-[#6E7A94] transition-transform duration-200 ${
                    openDropdown === 'platform' ? 'rotate-180 text-blue-400' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {openDropdown === 'platform' && (
                  <motion.div
                    key="platform-dropdown"
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-2xl p-2 bg-[#0C101A]/95 border border-white/[0.1] shadow-2xl backdrop-blur-2xl z-50"
                  >
                    <Link
                      to="/dashboard"
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <LayoutDashboard className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#FFF8F0]">Dashboard</div>
                        <div className="text-[10px] text-[#A3ADC2]">Telemetry & MTTR metrics</div>
                      </div>
                    </Link>

                    <Link
                      to="/topology"
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Network className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#FFF8F0]">DAG Topology</div>
                        <div className="text-[10px] text-[#A3ADC2]">Dependency blast radius</div>
                      </div>
                    </Link>

                    <Link
                      to="/recovery"
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#FFF8F0]">Autonomous Recovery</div>
                        <div className="text-[10px] text-[#A3ADC2]">Deterministic playbooks</div>
                      </div>
                    </Link>

                    <Link
                      to="/architect"
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#FFF8F0]">AI Flow Architect</div>
                        <div className="text-[10px] text-[#A3ADC2]">Natural language DAG & YAML</div>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Governance Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('governance')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isGovernanceActive || openDropdown === 'governance'
                    ? 'bg-blue-500/20 text-[#FFF8F0] border border-blue-500/30'
                    : 'text-[#A3ADC2] hover:text-[#FFF8F0] hover:bg-white/[0.04]'
                }`}
              >
                <span>Governance</span>
                <ChevronDown
                  className={`w-3 h-3 text-[#6E7A94] transition-transform duration-200 ${
                    openDropdown === 'governance' ? 'rotate-180 text-blue-400' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {openDropdown === 'governance' && (
                  <motion.div
                    key="governance-dropdown"
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-60 rounded-2xl p-2 bg-[#0C101A]/95 border border-white/[0.1] shadow-2xl backdrop-blur-2xl z-50"
                  >
                    <Link
                      to="/audit"
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#FFF8F0]">Audit Vault</div>
                        <div className="text-[10px] text-[#A3ADC2]">MST on-chain verification</div>
                      </div>
                    </Link>

                    <Link
                      to="/subscription"
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <Gem className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#FFF8F0]">Subscription Plans</div>
                        <div className="text-[10px] text-[#A3ADC2]">Web3 NFT token-gated tiers</div>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right: Telemetry Dot, BridgeKey, Auth */}
          <div className="flex items-center gap-2">
            {/* Live Health Indicator */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px]"
              title={`Cluster Status: ${healthStatus} (${latencyMs ?? '...'}ms)`}
            >
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
              <span className="text-[#A3ADC2] font-mono text-[10px]">
                {latencyMs !== null ? `${latencyMs}ms` : 'MST'}
              </span>
            </div>

            {/* BridgeKey Wallet Trigger */}
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border bg-blue-500/10 border-blue-500/25 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/40 cursor-pointer shadow-sm shadow-blue-500/10"
              title="BridgeKey Wallet — MST Testnet"
            >
              <Wallet className="w-3.5 h-3.5 text-[#1E6BFF]" />
              <span className="font-mono text-[11px] hidden sm:inline">
                {walletBalance}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" />
            </button>

            {/* Operator Auth Profile / Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('profile')}
                  className="flex items-center gap-1.5 p-1 pl-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors cursor-pointer"
                >
                  <span className="text-xs text-[#E2D7CB] max-w-[80px] truncate hidden sm:inline">
                    {user.displayName || user.email.split('@')[0]}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#1E6BFF] to-[#0047AB] flex items-center justify-center text-[10px] font-bold text-[#FFF8F0] shadow-sm">
                    {user.email.slice(0, 2).toUpperCase()}
                  </div>
                </button>

                <AnimatePresence>
                  {openDropdown === 'profile' && (
                    <motion.div
                      key="profile-dropdown"
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className="absolute top-full right-0 mt-2 w-56 rounded-2xl p-2 bg-[#0C101A]/95 border border-white/[0.1] shadow-2xl backdrop-blur-2xl z-50"
                    >
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAuthOpen(true)}
                className="gap-1.5 text-xs rounded-full px-3.5 py-1.5"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[#A3ADC2] hover:text-[#FFF8F0] md:hidden cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-nav-drawer"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-x-4 top-20 z-50 p-4 rounded-3xl bg-[#0A0E17]/95 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-2 md:hidden"
          >
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-medium text-[#FFF8F0] hover:bg-white/[0.06]"
            >
              Overview
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-medium text-[#FFF8F0] hover:bg-white/[0.06]"
            >
              Resilience Dashboard
            </Link>
            <Link
              to="/topology"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-medium text-[#FFF8F0] hover:bg-white/[0.06]"
            >
              DAG Dependency Graph
            </Link>
            <Link
              to="/recovery"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-medium text-[#FFF8F0] hover:bg-white/[0.06]"
            >
              Autonomous Recovery Engine
            </Link>
            <Link
              to="/architect"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-medium text-[#FFF8F0] hover:bg-white/[0.06]"
            >
              AI Flow Architect
            </Link>
            <Link
              to="/audit"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-medium text-[#FFF8F0] hover:bg-white/[0.06]"
            >
              On-Chain Audit Vault
            </Link>
            <Link
              to="/subscription"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-medium text-[#FFF8F0] hover:bg-white/[0.06]"
            >
              Subscription Plans
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <MSTWalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </>
  );
};
