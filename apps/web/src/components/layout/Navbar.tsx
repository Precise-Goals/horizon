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
  Terminal,
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

  const isPlatformActive = ['/dashboard', '/topology', '/recovery'].includes(location.pathname);
  const isAgentActive = location.pathname === '/architect';
  const isDocsActive = ['/docs', '/mcp'].includes(location.pathname);
  const isGovernanceActive = ['/audit', '/subscription'].includes(location.pathname);

  return (
    <>
      {/* Porcelain Skeuomorphic Floating Dock Navbar */}
      <header className="sticky top-3.5 z-50 w-full px-4 sm:px-6 pointer-events-none flex justify-center">
        <div
          ref={navRef}
          className="pointer-events-auto w-full max-w-5xl rounded-full bg-white/95 backdrop-blur-2xl border border-[rgba(26,26,26,0.14)] shadow-[inset_0_1px_0_#FFFFFF,0_4px_16px_-2px_rgba(26,26,26,0.08),0_12px_32px_-4px_rgba(0,71,171,0.08)] px-4 sm:px-5 py-2 flex items-center justify-between gap-3 transition-all"
        >
          {/* Brand Left */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#0047AB] border border-[#003680] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(0,71,171,0.3)] group-hover:scale-105 transition-all">
              <Activity className="w-4 h-4 text-[#FFF8F0]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-wider text-[#1A1A1A] uppercase group-hover:text-[#0047AB] transition-colors">
                Horizon
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#EBF1FA] text-[#0047AB] border border-[#0047AB]/20 hidden sm:inline">
                SRE
              </span>
            </div>
          </Link>

          {/* Center: Tactile Dock Links */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-[#F4EBE0] border border-[rgba(26,26,26,0.1)] shadow-[inset_0_1px_2px_rgba(26,26,26,0.06),0_1px_0_#FFFFFF] relative">
            <Link
              to="/"
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                location.pathname === '/'
                  ? 'bg-white text-[#0047AB] border border-[rgba(26,26,26,0.14)] shadow-[0_1px_3px_rgba(26,26,26,0.08),inset_0_1px_0_#FFFFFF]'
                  : 'text-[#555555] hover:text-[#1A1A1A] hover:bg-white/60'
              }`}
            >
              Overview
            </Link>

            {/* Platform Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('platform')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isPlatformActive || openDropdown === 'platform'
                    ? 'bg-white text-[#0047AB] border border-[rgba(26,26,26,0.14)] shadow-[0_1px_3px_rgba(26,26,26,0.08),inset_0_1px_0_#FFFFFF]'
                    : 'text-[#555555] hover:text-[#1A1A1A] hover:bg-white/60'
                }`}
              >
                <span>Platform</span>
                {incidentCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-red-100 text-red-700 border border-red-300">
                    {incidentCount}
                  </span>
                )}
                <ChevronDown
                  className={`w-3 h-3 text-[#777777] transition-transform duration-200 ${
                    openDropdown === 'platform' ? 'rotate-180 text-[#0047AB]' : ''
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
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-2xl p-2 bg-white border border-[rgba(26,26,26,0.14)] shadow-[0_12px_32px_rgba(26,26,26,0.12),inset_0_1px_0_#FFFFFF] z-50"
                  >
                    <Link
                      to="/dashboard"
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-[#F7EFE5] transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-[#EBF1FA] text-[#0047AB] border border-[#0047AB]/20">
                        <LayoutDashboard className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1A1A1A]">Dashboard</div>
                        <div className="text-[10px] text-[#666666]">Telemetry & MTTR metrics</div>
                      </div>
                    </Link>

                    <Link
                      to="/topology"
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-[#F7EFE5] transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-[#EBF1FA] text-[#0047AB] border border-[#0047AB]/20">
                        <Network className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1A1A1A]">DAG Topology</div>
                        <div className="text-[10px] text-[#666666]">Dependency blast radius</div>
                      </div>
                    </Link>

                    <Link
                      to="/recovery"
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-[#F7EFE5] transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-[#FEF6E7] text-[#D97706] border border-[#D97706]/20">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1A1A1A]">Autonomous Recovery</div>
                        <div className="text-[10px] text-[#666666]">Deterministic playbooks</div>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* AI Agent Direct Navbar Item */}
            <Link
              to="/architect"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                isAgentActive
                  ? 'bg-white text-[#0047AB] border border-[rgba(26,26,26,0.14)] shadow-[0_1px_3px_rgba(26,26,26,0.08),inset_0_1px_0_#FFFFFF]'
                  : 'text-[#555555] hover:text-[#1A1A1A] hover:bg-white/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0047AB]" />
              <span>AI Agent</span>
            </Link>

            {/* MCP & API Docs Direct Navbar Item */}
            <Link
              to="/docs"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                isDocsActive
                  ? 'bg-white text-[#0047AB] border border-[rgba(26,26,26,0.14)] shadow-[0_1px_3px_rgba(26,26,26,0.08),inset_0_1px_0_#FFFFFF]'
                  : 'text-[#555555] hover:text-[#1A1A1A] hover:bg-white/60'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-[#0047AB]" />
              <span>MCP & Docs</span>
            </Link>

            {/* Governance Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('governance')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isGovernanceActive || openDropdown === 'governance'
                    ? 'bg-white text-[#0047AB] border border-[rgba(26,26,26,0.14)] shadow-[0_1px_3px_rgba(26,26,26,0.08),inset_0_1px_0_#FFFFFF]'
                    : 'text-[#555555] hover:text-[#1A1A1A] hover:bg-white/60'
                }`}
              >
                <span>Governance</span>
                <ChevronDown
                  className={`w-3 h-3 text-[#777777] transition-transform duration-200 ${
                    openDropdown === 'governance' ? 'rotate-180 text-[#0047AB]' : ''
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
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-60 rounded-2xl p-2 bg-white border border-[rgba(26,26,26,0.14)] shadow-[0_12px_32px_rgba(26,26,26,0.12),inset_0_1px_0_#FFFFFF] z-50"
                  >
                    <Link
                      to="/audit"
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-[#F7EFE5] transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-[#EBF7EE] text-[#0F8E52] border border-[#0F8E52]/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1A1A1A]">Audit Vault</div>
                        <div className="text-[10px] text-[#666666]">MST on-chain verification</div>
                      </div>
                    </Link>

                    <Link
                      to="/subscription"
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-[#F7EFE5] transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-[#F5F3FF] text-[#7C3AED] border border-[#7C3AED]/20">
                        <Gem className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1A1A1A]">Subscription Plans</div>
                        <div className="text-[10px] text-[#666666]">Web3 NFT token-gated tiers</div>
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
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F4EBE0] border border-[rgba(26,26,26,0.1)] text-[11px] shadow-[inset_0_1px_2px_rgba(26,26,26,0.05)]"
              title={`Cluster Status: ${healthStatus} (${latencyMs ?? '...'}ms)`}
            >
              <span className="skeuo-led skeuo-led-healthy animate-pulse" />
              <span className="text-[#555555] font-mono text-[10px] font-bold">
                {latencyMs !== null ? `${latencyMs}ms` : 'MST'}
              </span>
            </div>

            {/* BridgeKey Wallet Tactile Button */}
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="skeuo-btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer"
              title="BridgeKey Wallet — MST Testnet"
            >
              <Wallet className="w-3.5 h-3.5 text-white" />
              <span className="font-mono text-[11px] hidden sm:inline text-white">
                {walletBalance}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
            </button>

            {/* Operator Auth Profile / Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('profile')}
                  className="flex items-center gap-1.5 p-1 pl-2 rounded-full bg-[#F4EBE0] hover:bg-[#EDE1D2] border border-[rgba(26,26,26,0.12)] transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold text-[#1A1A1A] max-w-[80px] truncate hidden sm:inline">
                    {user.displayName || user.email.split('@')[0]}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-[#0047AB] border border-[#003680] flex items-center justify-center text-[10px] font-black text-white shadow-sm">
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
                      className="absolute top-full right-0 mt-2 w-56 rounded-2xl p-2 bg-white border border-[rgba(26,26,26,0.14)] shadow-[0_12px_32px_rgba(26,26,26,0.12),inset_0_1px_0_#FFFFFF] z-50"
                    >
                      <div className="p-2 border-b border-[rgba(26,26,26,0.08)] mb-1">
                        <div className="text-xs font-bold text-[#1A1A1A] truncate">
                          {user.displayName || 'Commander'}
                        </div>
                        <div className="text-[10px] font-mono text-[#666666] truncate">
                          {user.email}
                        </div>
                        <div className="mt-1 inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {user.role} Access
                        </div>
                      </div>

                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
              className="p-1.5 rounded-full bg-[#F4EBE0] border border-[rgba(26,26,26,0.12)] text-[#555555] hover:text-[#1A1A1A] md:hidden cursor-pointer"
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
            className="fixed inset-x-4 top-20 z-50 p-4 rounded-3xl bg-white border border-[rgba(26,26,26,0.14)] shadow-2xl space-y-2 md:hidden"
          >
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-[#FAF3EA]"
            >
              Overview
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-[#FAF3EA]"
            >
              Resilience Dashboard
            </Link>
            <Link
              to="/topology"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-[#FAF3EA]"
            >
              DAG Dependency Graph
            </Link>
            <Link
              to="/recovery"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-[#FAF3EA]"
            >
              Autonomous Recovery Engine
            </Link>
            <Link
              to="/architect"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-[#FAF3EA]"
            >
              AI Flow Architect
            </Link>
            <Link
              to="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-[#FAF3EA]"
            >
              MCP & API Documentation
            </Link>
            <Link
              to="/audit"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-[#FAF3EA]"
            >
              On-Chain Audit Vault
            </Link>
            <Link
              to="/subscription"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-[#FAF3EA]"
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
