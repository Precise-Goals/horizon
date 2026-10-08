import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Button } from '../common/Button';
import { AuthModal } from '../auth/AuthModal';
import { useAuth } from '../../context/AuthContext';
import { fetchHealth, fetchNodes } from '../../lib/api';
import {
  Activity,
  LayoutDashboard,
  Network,
  RotateCcw,
  ShieldCheck,
  Gem,
  ExternalLink,
  Wallet,
  AlertTriangle,
  User as UserIcon,
  CheckCircle2,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<'UP' | 'DEGRADED' | 'CHECKING'>('CHECKING');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [incidentCount, setIncidentCount] = useState<number>(0);
  const location = useLocation();

  // Poll real backend health and active nodes
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

  const handleWalletToggle = () => {
    if (walletConnected) {
      setWalletConnected(false);
      setWalletAddress(null);
    } else {
      setWalletConnected(true);
      setWalletAddress('0x71C...49A');
    }
  };

  const navLinks = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/topology', label: 'Topology', icon: Network },
    { to: '/recovery', label: 'Recovery', icon: RotateCcw, count: incidentCount },
    { to: '/audit', label: 'Audit Trail', icon: ShieldCheck },
    { to: '/subscription', label: 'Web3 Plans', icon: Gem },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-nav backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Brand & Health Pulse */}
          <div className="flex items-center gap-6">
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
                  <span className="text-lg font-bold tracking-tight text-[#FFF8F0] group-hover:text-blue-400 transition-colors">
                    Horizon
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    v1.0
                  </span>
                </div>
                <span className="text-[10px] text-[#A3ADC2] tracking-wider uppercase hidden sm:block">
                  Resilience Platform
                </span>
              </div>
            </Link>

            {/* Live Operational Status Pulse */}
            <div className="hidden lg:flex items-center gap-2.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
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
              <span className="text-xs font-medium text-[#E2D7CB]">
                {healthStatus === 'UP' ? 'All Systems Healthy' : 'Degraded Probe'}
              </span>
              {latencyMs !== null && (
                <span className="text-[10px] font-mono text-[#A3ADC2] border-l border-white/10 pl-2">
                  {latencyMs}ms
                </span>
              )}
            </div>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#1E6BFF]/15 text-[#FFF8F0] border border-blue-500/30 shadow-sm shadow-blue-500/15'
                      : 'text-[#A3ADC2] hover:text-[#FFF8F0] hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#1E6BFF]' : 'text-[#A3ADC2]'}`} />
                  <span>{link.label}</span>
                  {link.count !== undefined && link.count > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                      {link.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions, Web3, Auth */}
          <div className="flex items-center gap-2.5">
            
            {/* Incident Alert Pill */}
            {incidentCount > 0 ? (
              <Link
                to="/recovery"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold hover:bg-red-500/25 transition-colors animate-pulse"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>{incidentCount} Incident</span>
              </Link>
            ) : (
              <span className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>0 Outages</span>
              </span>
            )}

            {/* API Docs External Jump */}
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#A3ADC2] hover:text-[#FFF8F0] hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-colors"
              title="FastAPI Interactive Docs"
            >
              <span>API</span>
              <ExternalLink className="w-3 h-3 text-[#A3ADC2]" />
            </a>

            {/* Web3 Wallet Trigger */}
            <button
              onClick={handleWalletToggle}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                walletConnected
                  ? 'bg-blue-500/15 border-blue-500/30 text-blue-300 shadow-sm shadow-blue-500/15'
                  : 'bg-white/[0.04] border-white/10 text-[#FFF8F0] hover:bg-white/[0.08] hover:border-white/20'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-[#1E6BFF]" />
              <span className="font-mono">
                {walletConnected ? walletAddress : 'Connect Wallet'}
              </span>
              {walletConnected && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" />
              )}
            </button>

            {/* User Auth Profile Trigger */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#1E6BFF] to-[#0047AB] flex items-center justify-center text-[10px] font-bold text-[#FFF8F0]">
                    {user.email.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs text-[#E2D7CB] max-w-[100px] truncate hidden sm:inline">
                    {user.name || user.email.split('@')[0]}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAuthOpen(true)}
                className="gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
