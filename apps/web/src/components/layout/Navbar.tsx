import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthModal } from '../auth/AuthModal';
import { MSTWalletModal } from '../wallet/MSTWalletModal';
import { CommandPalette } from './CommandPalette';
import { HorizonLogo } from '../common/HorizonLogo';
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
  Search,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const Navbar: React.FC = () => {
  const { user, wallet, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<string>('...');
  const [incidentCount, setIncidentCount] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (wallet?.balanceMst) {
      setWalletBalance(`${wallet.balanceMst} MST`);
    } else {
      mstBlockchain
        .getBalance()
        .then((bal) => setWalletBalance(`${bal} MST`))
        .catch(() => setWalletBalance('0.00 MST'));
    }
  }, [wallet?.balanceMst]);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        await fetchHealth();
        const nodes = await fetchNodes();
        if (!mounted) return;
        setIncidentCount(
          nodes.filter((n: SystemNode) => n.status === 'down' || n.status === 'degraded').length
        );
      } catch {
        /* silent */
      }
    };
    check();
    const id = setInterval(check, 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const toggle = (name: string) => setOpenDropdown((p) => (p === name ? null : name));

  const isPlatformActive = [
    '/dashboard',
    '/observability',
    '/detection',
    '/monitoring',
    '/topology',
    '/recovery',
  ].includes(location.pathname);
  const isAgentActive = location.pathname === '/architect';
  const isDocsActive = ['/docs', '/mcp'].includes(location.pathname);
  const isGovernanceActive = [
    '/audit',
    '/subscription',
    '/patents',
    '/policies',
    '/governance/patents',
    '/governance/policies',
  ].includes(location.pathname);

  const navLinkCls = (active: boolean) =>
    cn(
      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[14px] font-medium transition-colors select-none cursor-pointer',
      active
        ? 'text-[#0A0A0A] font-semibold'
        : 'text-[#6B6B6B] hover:text-[#0A0A0A]'
    );

  const dropdownItemCls =
    'flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer w-full text-left';

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-200 border-b',
          scrolled
            ? 'bg-[#FAFAF9]/90 backdrop-blur-md border-[#E5E5E5] shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
            : 'bg-transparent border-transparent'
        )}
      >
        <div
          ref={navRef}
          className="w-full max-w-[1120px] mx-auto px-6 h-20 flex items-center justify-between gap-4"
        >
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <HorizonLogo size={32} className="transition-transform group-hover:scale-105" />
            <span className="text-lg font-bold tracking-tight text-[#0A0A0A] font-sans">
              Horizon
            </span>
          </Link>

          {/* Center nav links */}
          <nav className="hidden md:flex items-center gap-2" aria-label="Main navigation">
            <Link to="/" className={navLinkCls(location.pathname === '/')}>
              Home
            </Link>

            {/* Platform dropdown */}
            <div className="relative">
              <button
                id="nav-platform-btn"
                onClick={() => toggle('platform')}
                className={navLinkCls(isPlatformActive || openDropdown === 'platform')}
                aria-expanded={openDropdown === 'platform'}
                aria-haspopup="true"
              >
                Platform
                {incidentCount > 0 && (
                  <span
                    className="ml-1 h-3.5 min-w-[0.9rem] px-1 rounded-full text-[9px] font-bold bg-[#EF4444] text-white flex items-center justify-center animate-pulse"
                    aria-label={`${incidentCount} active incidents`}
                  >
                    {incidentCount}
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    'w-3 h-3 transition-transform duration-150 text-[#A3A3A3]',
                    openDropdown === 'platform' && 'rotate-180'
                  )}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence>
                {openDropdown === 'platform' && (
                  <motion.div
                    key="platform-dropdown"
                    role="menu"
                    aria-labelledby="nav-platform-btn"
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-72 rounded-[20px] p-2 bg-white border border-[#E5E5E5] shadow-[0_12px_36px_rgba(0,0,0,0.06)]"
                  >
                    {[
                      { to: '/dashboard', Icon: LayoutDashboard, label: 'Command Center', sub: 'Real-time MTTR & health matrix' },
                      { to: '/observability', Icon: Activity, label: 'Live Observability', sub: 'APM telemetry & P1 tripwire', dot: incidentCount > 0 },
                      { to: '/topology', Icon: Network, label: 'Dependency DAG', sub: 'Kahn sort & blast radius' },
                      { to: '/recovery', Icon: RotateCcw, label: 'Recovery Orchestrator', sub: 'Deterministic playbooks' },
                    ].map(({ to, Icon, label, sub, dot }) => (
                      <Link key={to} to={to} role="menuitem" className={dropdownItemCls}>
                        <div className="p-2 rounded-lg bg-neutral-100 text-[#0A0A0A] shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[#0A0A0A] flex items-center gap-1.5">
                            {label}
                            {dot && <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" aria-label="Active incidents" />}
                          </div>
                          <div className="text-[11px] text-[#6B6B6B] mt-0.5">{sub}</div>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/architect" className={navLinkCls(isAgentActive)}>
              AI Agent
            </Link>

            <Link to="/docs" className={navLinkCls(isDocsActive)}>
              Resources &amp; MCP
            </Link>

            {/* Governance dropdown */}
            <div className="relative">
              <button
                id="nav-governance-btn"
                onClick={() => toggle('governance')}
                className={navLinkCls(isGovernanceActive || openDropdown === 'governance')}
                aria-expanded={openDropdown === 'governance'}
                aria-haspopup="true"
              >
                Governance
                <ChevronDown
                  className={cn(
                    'w-3 h-3 transition-transform duration-150 text-[#A3A3A3]',
                    openDropdown === 'governance' && 'rotate-180'
                  )}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence>
                {openDropdown === 'governance' && (
                  <motion.div
                    key="governance-dropdown"
                    role="menu"
                    aria-labelledby="nav-governance-btn"
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-72 rounded-[20px] p-2 bg-white border border-[#E5E5E5] shadow-[0_12px_36px_rgba(0,0,0,0.06)]"
                  >
                    {[
                      { to: '/audit', Icon: ShieldCheck, label: 'Audit Vault', sub: 'MST on-chain verification' },
                      { to: '/subscription', Icon: Gem, label: 'Subscription Plans', sub: 'Web3 NFT token-gated tiers' },
                      { to: '/patents', Icon: BookOpen, label: 'Patents & Research', sub: 'Technical invention disclosure' },
                      { to: '/policies', Icon: Scale, label: 'Privacies & Policies', sub: 'Zero-trust security charter' },
                    ].map(({ to, Icon, label, sub }) => (
                      <Link key={to} to={to} role="menuitem" className={dropdownItemCls}>
                        <div className="p-2 rounded-lg bg-neutral-100 text-[#0A0A0A] shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[#0A0A0A]">{label}</div>
                          <div className="text-[11px] text-[#6B6B6B] mt-0.5">{sub}</div>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right action group */}
          <div className="flex items-center gap-3">
            {/* Command Palette Trigger (⌘K) */}
            <button
              onClick={() => setIsCmdOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-[#6B6B6B] hover:text-[#0A0A0A] hover:border-[#D4D4D4] transition-colors cursor-pointer text-xs"
              title="Open Command Palette (⌘K)"
              aria-label="Open Command Palette"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-[12px]">Search</span>
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-100 border border-[#E5E5E5] text-[#A3A3A3]">
                ⌘K
              </kbd>
            </button>

            {user ? (
              <div className="relative">
                <button
                  id="nav-account-btn"
                  onClick={() => toggle('account')}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-expanded={openDropdown === 'account'}
                  aria-haspopup="true"
                >
                  <span className="text-xs font-medium text-[#0A0A0A] max-w-[96px] truncate hidden sm:inline">
                    {user.displayName || user.email.split('@')[0]}
                  </span>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white bg-[#0A0A0A]">
                    {user.email.slice(0, 2).toUpperCase()}
                  </div>
                  <ChevronDown
                    className={cn(
                      'w-3 h-3 text-[#A3A3A3] transition-transform duration-150',
                      openDropdown === 'account' && 'rotate-180'
                    )}
                    aria-hidden="true"
                  />
                </button>

                <AnimatePresence>
                  {openDropdown === 'account' && (
                    <motion.div
                      key="account-dropdown"
                      role="menu"
                      aria-labelledby="nav-account-btn"
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-64 rounded-[20px] p-2 bg-white border border-[#E5E5E5] shadow-[0_12px_36px_rgba(0,0,0,0.06)]"
                    >
                      <div className="p-3 mb-1 border-b border-[#E5E5E5]">
                        <div className="text-xs font-semibold text-[#0A0A0A] truncate">
                          {user.displayName || 'Operator Commander'}
                        </div>
                        <div className="text-[11px] font-mono text-[#6B6B6B] truncate mt-0.5">
                          {user.email}
                        </div>
                      </div>

                      <button
                        role="menuitem"
                        onClick={() => {
                          setIsWalletModalOpen(true);
                          setOpenDropdown(null);
                        }}
                        className={dropdownItemCls}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-neutral-100 text-[#0A0A0A] shrink-0">
                          <Wallet className="w-3.5 h-3.5" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-[#0A0A0A] flex items-center gap-1.5">
                            BridgeKey Wallet
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                          </div>
                          <div className="text-[10px] font-mono text-[#6B6B6B]">{walletBalance}</div>
                        </div>
                      </button>

                      <button
                        role="menuitem"
                        onClick={() => {
                          logout();
                          setOpenDropdown(null);
                        }}
                        className="flex items-center gap-2 p-2.5 w-full rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="px-6 py-2.5 rounded-full bg-[#0A0A0A] text-white text-xs font-semibold hover:bg-neutral-800 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen((p) => !p)}
              className="p-2 rounded-full text-[#0A0A0A] hover:bg-neutral-100 md:hidden transition-colors"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen off-white mobile menu with large serif links */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-nav"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#FAFAF9] flex flex-col justify-between p-8 md:hidden overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-8 border-b border-[#E5E5E5]">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0A0A0A] flex items-center justify-center text-white font-bold text-sm">
                  <span>H</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-[#0A0A0A]">Horizon</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full text-[#0A0A0A] hover:bg-neutral-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="py-8 space-y-4">
              {[
                { to: '/', label: 'Home' },
                { to: '/dashboard', label: 'Command Center' },
                { to: '/observability', label: 'Observability' },
                { to: '/topology', label: 'Topology DAG' },
                { to: '/recovery', label: 'Recovery Engine' },
                { to: '/architect', label: 'AI Copilot' },
                { to: '/docs', label: 'Resources' },
                { to: '/audit', label: 'Audit Vault' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-['Instrument_Serif',serif] text-3xl text-[#0A0A0A] hover:text-[#2DD4BF] transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="pt-6 border-t border-[#E5E5E5] space-y-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsAuthOpen(true);
                }}
                className="w-full py-3.5 rounded-full bg-[#0A0A0A] text-white text-sm font-semibold"
              >
                Sign In
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <MSTWalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </>
  );
};

export default Navbar;
