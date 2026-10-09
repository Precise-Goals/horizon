import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthModal } from '../auth/AuthModal';
import { MSTWalletModal } from '../wallet/MSTWalletModal';
import { useAuth } from '../../context/useAuth';
import { fetchHealth, fetchNodes } from '../../lib/api';
import { mstBlockchain } from '../../engine/mstBlockchain';
import type { SystemNode } from '../../types';
import {
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
  BookOpen,
  Scale,
  Activity,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, wallet, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<string>('...');
  const [incidentCount, setIncidentCount] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active dropdown tracker: 'platform' | 'governance' | 'account' | null
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

  // Fetch and sync live MST balance with AuthContext wallet state
  useEffect(() => {
    if (wallet?.balanceMst) {
      setWalletBalance(`${wallet.balanceMst} MST`);
    } else {
      mstBlockchain.getBalance()
        .then((bal) => setWalletBalance(`${bal} MST`))
        .catch(() => setWalletBalance('0.00 MST'));
    }
  }, [wallet?.balanceMst]);

  // Incident polling for Platform badge
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      try {
        await fetchHealth();
        const nodes = await fetchNodes();
        if (!isMounted) return;
        const downCount = nodes.filter((n: SystemNode) => n.status === 'down' || n.status === 'degraded').length;
        setIncidentCount(downCount);
      } catch {
        // Silent catch for resilience
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

  const isPlatformActive = ['/dashboard', '/observability', '/detection', '/monitoring', '/topology', '/recovery'].includes(location.pathname);
  const isAgentActive = location.pathname === '/architect';
  const isDocsActive = ['/docs', '/mcp'].includes(location.pathname);
  const isGovernanceActive = ['/audit', '/subscription', '/patents', '/policies', '/governance/patents', '/governance/policies'].includes(location.pathname);

  return (
    <>
      {/* Spacious Skeuomorphic Porcelain Floating Dock Navbar */}
      <header className="sticky top-4 sm:top-5 z-50 w-full px-4 sm:px-8 pointer-events-none flex justify-center">
        <div
          ref={navRef}
          className="pointer-events-auto w-full max-w-6xl rounded-2xl sm:rounded-full bg-white/95 backdrop-blur-2xl border border-[rgba(26,26,26,0.14)] shadow-[inset_0_1px_0_#FFFFFF,0_8px_32px_-4px_rgba(26,26,26,0.10),0_2px_8px_rgba(0,71,171,0.06)] px-5 sm:px-7 py-3 sm:py-3.5 flex items-center justify-between gap-4 transition-all"
        >
          {/* Brand Left: logo.png Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="overflow-hidden rounded-xl h-9 sm:h-10 w-auto border border-[rgba(26,26,26,0.15)] shadow-[0_2px_4px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.25)] group-hover:scale-105 transition-all bg-[#0a1128] flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Horizon Logo"
                className="h-9 sm:h-10 w-auto object-contain"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-black tracking-wider text-[#1A1A1A] uppercase group-hover:text-[#0047AB] transition-colors">
                Horizon
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#EBF1FA] text-[#0047AB] border border-[#0047AB]/20 hidden sm:inline">
                SRE
              </span>
            </div>
          </Link>

          {/* Center: Tactile Dock Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 p-1.5 rounded-full bg-[#F4EBE0]/80 border border-[rgba(26,26,26,0.1)] shadow-[inset_0_1px_2px_rgba(26,26,26,0.06),0_1px_0_#FFFFFF] relative">
            {/* Home (renamed from Overview) */}
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                location.pathname === '/'
                  ? 'bg-white text-[#0047AB] border border-[rgba(26,26,26,0.14)] shadow-[0_1px_3px_rgba(26,26,26,0.08),inset_0_1px_0_#FFFFFF]'
                  : 'text-[#555555] hover:text-[#1A1A1A] hover:bg-white/60'
              }`}
            >
              Home
            </Link>

            {/* Platform Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('platform')}
                className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
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
                  className={`w-3.5 h-3.5 text-[#777777] transition-transform duration-200 ${
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
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-68 rounded-2xl p-2 bg-white border border-[rgba(26,26,26,0.14)] shadow-[0_12px_32px_rgba(26,26,26,0.12),inset_0_1px_0_#FFFFFF] z-50"
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
                      to="/observability"
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-[#F7EFE5] transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-[#FEE2E2] text-[#DC2626] border border-[#DC2626]/20">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5">
                          <span>Live Observability</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        </div>
                        <div className="text-[10px] text-[#666666]">Datadog APM & PagerDuty Alerts</div>
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

            {/* AI Agent Direct Link */}
            <Link
              to="/architect"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                isAgentActive
                  ? 'bg-white text-[#0047AB] border border-[rgba(26,26,26,0.14)] shadow-[0_1px_3px_rgba(26,26,26,0.08),inset_0_1px_0_#FFFFFF]'
                  : 'text-[#555555] hover:text-[#1A1A1A] hover:bg-white/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0047AB]" />
              <span>AI Agent</span>
            </Link>

            {/* MCP & Docs Direct Link */}
            <Link
              to="/docs"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
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
                className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isGovernanceActive || openDropdown === 'governance'
                    ? 'bg-white text-[#0047AB] border border-[rgba(26,26,26,0.14)] shadow-[0_1px_3px_rgba(26,26,26,0.08),inset_0_1px_0_#FFFFFF]'
                    : 'text-[#555555] hover:text-[#1A1A1A] hover:bg-white/60'
                }`}
              >
                <span>Governance</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#777777] transition-transform duration-200 ${
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
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-60 rounded-2xl p-2 bg-white border border-[rgba(26,26,26,0.14)] shadow-[0_12px_32px_rgba(26,26,26,0.12),inset_0_1px_0_#FFFFFF] z-50"
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

                    <Link
                      to="/patents"
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-[#F7EFE5] transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-[#FEF6E7] text-[#D97706] border border-[#D97706]/20">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1A1A1A]">Patents & Research</div>
                        <div className="text-[10px] text-[#666666]">Technical invention disclosure</div>
                      </div>
                    </Link>

                    <Link
                      to="/policies"
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-[#F7EFE5] transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-[#EBF1FA] text-[#0047AB] border border-[#0047AB]/20">
                        <Scale className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1A1A1A]">Privacies & Policies</div>
                        <div className="text-[10px] text-[#666666]">Zero-trust & security charter</div>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right: Consolidated Account Menu (Includes Connect Wallet & Sign Out) */}
          <div className="flex items-center gap-2.5">
            {user ? (
              /* Authenticated Operator Account Menu */
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('account')}
                  className="flex items-center gap-2 p-1.5 pl-3 rounded-full bg-[#F4EBE0] hover:bg-[#EDE1D2] border border-[rgba(26,26,26,0.12)] shadow-[inset_0_1px_0_#FFFFFF,0_1px_2px_rgba(26,26,26,0.05)] transition-all cursor-pointer"
                  title="Operator Account & Wallet"
                >
                  <span className="text-xs font-bold text-[#1A1A1A] max-w-[100px] truncate hidden sm:inline">
                    {user.displayName || user.email.split('@')[0]}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#0047AB] border border-[#003680] flex items-center justify-center text-[10px] font-black text-white shadow-sm">
                    {user.email.slice(0, 2).toUpperCase()}
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#555555] transition-transform duration-200 ${
                      openDropdown === 'account' ? 'rotate-180 text-[#0047AB]' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {openDropdown === 'account' && (
                    <motion.div
                      key="account-dropdown"
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className="absolute top-full right-0 mt-2.5 w-64 rounded-2xl p-2.5 bg-white border border-[rgba(26,26,26,0.14)] shadow-[0_16px_40px_rgba(26,26,26,0.14),inset_0_1px_0_#FFFFFF] z-50"
                    >
                      {/* Operator Identity Header */}
                      <div className="p-2.5 border-b border-[rgba(26,26,26,0.08)] mb-2">
                        <div className="text-xs font-bold text-[#1A1A1A] truncate">
                          {user.displayName || 'Operator Commander'}
                        </div>
                        <div className="text-[10px] font-mono text-[#666666] truncate mt-0.5">
                          {user.email}
                        </div>
                        <div className="mt-1.5 inline-block text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {user.role} Access
                        </div>
                      </div>

                      {/* BridgeKey Web3 Wallet Action in Menu */}
                      <button
                        onClick={() => {
                          setIsWalletModalOpen(true);
                          setOpenDropdown(null);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F7EFE5] transition-colors group cursor-pointer text-left border border-[rgba(26,26,26,0.06)] bg-[#FCF8F3] mb-1.5"
                        title="Manage BridgeKey MST Wallet"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#0047AB] text-white flex items-center justify-center shadow-sm">
                            <Wallet className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#0047AB] transition-colors flex items-center gap-1.5">
                              <span>BridgeKey Wallet</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
                            </div>
                            <div className="text-[11px] font-mono font-semibold text-[#0047AB]">
                              {walletBalance}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF1FA] text-[#0047AB] border border-[#0047AB]/20">
                          Manage
                        </span>
                      </button>

                      {/* Sign Out Action */}
                      <button
                        onClick={() => {
                          logout();
                          setOpenDropdown(null);
                        }}
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
              /* Guest Operator Account Dropdown (Sign In & Connect Wallet) */
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('account')}
                  className="skeuo-btn-primary flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-white" />
                  <span className="hidden sm:inline">Operator Access</span>
                  <span className="sm:hidden">Access</span>
                  <ChevronDown
                    className={`w-3 h-3 text-white/80 transition-transform duration-200 ${
                      openDropdown === 'account' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {openDropdown === 'account' && (
                    <motion.div
                      key="guest-account-dropdown"
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className="absolute top-full right-0 mt-2.5 w-64 rounded-2xl p-2.5 bg-white border border-[rgba(26,26,26,0.14)] shadow-[0_16px_40px_rgba(26,26,26,0.14),inset_0_1px_0_#FFFFFF] z-50"
                    >
                      <button
                        onClick={() => {
                          setIsAuthOpen(true);
                          setOpenDropdown(null);
                        }}
                        className="w-full flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-[#F7EFE5] text-left transition-colors cursor-pointer mb-1"
                      >
                        <div className="p-2 rounded-lg bg-[#EBF1FA] text-[#0047AB] border border-[#0047AB]/20">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#1A1A1A]">Sign In</div>
                          <div className="text-[10px] text-[#666666]">Authenticate operator identity</div>
                        </div>
                      </button>

                      <div className="my-1 border-t border-[rgba(26,26,26,0.08)]" />

                      <button
                        onClick={() => {
                          setIsWalletModalOpen(true);
                          setOpenDropdown(null);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F7EFE5] text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-[#FEF6E7] text-[#D97706] border border-[#D97706]/20">
                            <Wallet className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#1A1A1A]">Connect Wallet</div>
                            <div className="text-[10px] font-mono text-[#0047AB] font-semibold">{walletBalance}</div>
                          </div>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-full bg-[#F4EBE0] border border-[rgba(26,26,26,0.12)] text-[#555555] hover:text-[#1A1A1A] md:hidden cursor-pointer"
              aria-label="Toggle Navigation Menu"
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
            className="fixed inset-x-4 top-24 z-50 p-4 rounded-3xl bg-white border border-[rgba(26,26,26,0.14)] shadow-2xl space-y-2 md:hidden"
          >
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-[#FAF3EA]"
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-[#FAF3EA]"
            >
              Resilience Dashboard
            </Link>
            <Link
              to="/observability"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-[#FAF3EA] flex items-center justify-between"
            >
              <span>Live Observability & PagerDuty</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
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
            <Link
              to="/patents"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-[#FAF3EA]"
            >
              Patents & Research
            </Link>
            <Link
              to="/policies"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-[#FAF3EA]"
            >
              Privacies & Policies
            </Link>

            {/* Mobile Wallet & Auth Actions */}
            <div className="pt-2 border-t border-[rgba(26,26,26,0.1)] space-y-2">
              <button
                onClick={() => {
                  setIsWalletModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#F7EFE5] hover:bg-[#EFE3D5] text-[#1A1A1A] text-sm font-bold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#0047AB]" />
                  <span>BridgeKey Wallet</span>
                </div>
                <span className="font-mono text-xs text-[#0047AB] font-bold">{walletBalance}</span>
              </button>

              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 p-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out ({user.displayName || user.email})</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsAuthOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#0047AB] text-white text-sm font-bold hover:bg-[#003680] transition-colors cursor-pointer"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Operator Sign In</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <MSTWalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </>
  );
};
