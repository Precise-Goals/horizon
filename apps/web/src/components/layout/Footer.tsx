import React from 'react';
import { Link } from 'react-router';
import {
  Terminal,
  Sparkles,
  ShieldCheck,
  Gem,
  Network,
  RotateCcw,
  LayoutDashboard,
  ExternalLink,
  ArrowUpRight,
  Activity,
  Lock,
} from 'lucide-react';
import { MST_CONFIG } from '../../engine/mstBlockchain';

/**
 * Aesthetic Antigravity-Style Footer.
 * Deep black background (#0A0A0A) with crisp white typography,
 * top-left tagline, top-right categorized links, monumental "HORIZON" display title,
 * and small copyright line at the very bottom.
 */
export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0A0A0A] text-white border-t border-white/10 relative overflow-hidden font-sans z-20">
      {/* Ambient Lighting Accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(0,71,171,0.25),transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-15 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-10 sm:pb-12 space-y-12 sm:space-y-16">
        {/* ============================================================
            TOP SECTION: TAGLINE (LEFT) & LINKS (RIGHT)
            ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 items-start justify-between">
          {/* TOP LEFT: Brand & Tagline */}
          <div className="lg:col-span-5 space-y-5">
            

            {/* Main Tagline */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-snug">
              Deterministic infrastructure recovery orchestrated in topological dependency order.
            </h2>

            

            
          </div>

          {/* TOP RIGHT: Categorized Navigation Links */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10">
            {/* Column 1: Core Platform */}
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                Platform
              </span>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    to="/"
                    className="text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span>Home</span>
                    <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span>Dashboard</span>
                    <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/topology"
                    className="text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span>DAG Topology</span>
                    <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/recovery"
                    className="text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span>Recovery Engine</span>
                    <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/architect"
                    className="text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="text-[#60A5FA]">AI Flow Architect</span>
                    <ArrowUpRight className="w-3 h-3 text-[#60A5FA]" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Developer & AI */}
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                Developer & MCP
              </span>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    to="/docs"
                    className="text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span>MCP Server Hub</span>
                    <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/docs"
                    className="text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span>Slash Commands</span>
                    <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/docs"
                    className="text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span>@horizon/cli Tool</span>
                    <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                  </Link>
                </li>
                <li>
                  <a
                    href="/api/v1/health"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span>Serverless API</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Governance & Web3 */}
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                Governance & Web3
              </span>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    to="/audit"
                    className="text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span>Audit Vault</span>
                    <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/patents"
                    className="text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span>Patents & Research</span>
                    <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/policies"
                    className="text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span>Privacies & Policies</span>
                    <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/subscription"
                    className="text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span>Subscription Plans</span>
                    <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                  </Link>
                </li>
                <li>
                  <a
                    href={MST_CONFIG.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span>MSTScan Explorer</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                  </a>
                </li>
                <li>
                  <a
                    href={`${MST_CONFIG.explorerUrl}/token/${MST_CONFIG.subscriptionContractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span>ZXPASS Contract</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ============================================================
            MIDDLE SECTION: MONUMENTAL "HORIZON" DISPLAY TITLE
            ============================================================ */}
        <div className="pt-6 sm:pt-10 border-t border-white/10 select-none">
          <h1 className="text-[17vw] sm:text-[16vw] md:text-[15vw] lg:text-[14vw] font-black uppercase tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600/30 text-center sm:text-left drop-shadow-[0_4px_30px_rgba(255,255,255,0.06)]">
            Horizon
          </h1>
        </div>

        {/* ============================================================
            BOTTOM ROW: SMALL COPYRIGHT LINE BELOW THE BIG TEXT
            ============================================================ */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-400">
          <p className="text-zinc-400">
            2026 all rights reserved - horizon
          </p>

          <div className="flex flex-wrap items-center gap-4 text-zinc-400 text-[11px]">
            <Link to="/policies" className="hover:text-white transition-colors">
              Privacies & Policies
            </Link>
            <span>&bull;</span>
            <Link to="/patents" className="hover:text-white transition-colors">
              Patents & Research
            </Link>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Network: MST Testnet (Chain ID 91562037)</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
