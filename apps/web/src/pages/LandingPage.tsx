import React from 'react';
import { Link } from 'react-router';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import {
  ShieldCheck,
  Network,
  RotateCcw,
  ArrowRight,
  Lock,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#07090E] text-[#FFF8F0] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-6xl w-full text-center space-y-10 relative z-10 pt-8 pb-16">
        
        {/* Top Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] backdrop-blur-xl shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E6BFF]" />
          </span>
          <span className="text-xs font-semibold text-[#E2D7CB] tracking-wider uppercase">
            Autonomous Resilience Platform v1.0
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
            Sepolia Web3 Ready
          </span>
        </div>

        {/* Hero Title with Cream Typography & Cobalt Gradient */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#FFF8F0] leading-[1.08]">
            Self-Healing <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#1E6BFF] via-[#4A8CFF] to-[#FFF8F0] bg-clip-text text-transparent">
              Enterprise Infrastructure
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[#A3ADC2] max-w-2xl mx-auto leading-relaxed">
            Detect systemic outages, compute topological blast radius in real time, and orchestrate deterministic recovery in strict dependency order.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link to="/dashboard">
            <Button size="lg" className="w-full sm:w-auto text-sm font-semibold gap-2 px-8 py-3.5 shadow-xl shadow-blue-500/25">
              <span>Launch Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/topology">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto text-sm px-6 py-3.5 gap-2">
              <Network className="w-4 h-4 text-blue-400" />
              <span>Explore Dependency DAG</span>
            </Button>
          </Link>
        </div>

        {/* Visual Hero Dashboard Graphic */}
        <div className="relative mt-8 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-500/10">
          <img
            src="/hero.jpg"
            alt="Horizon Autonomous Cloud Resilience Network"
            className="w-full h-auto max-h-[480px] object-cover object-center"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#0B0F19]/80 backdrop-blur-xl border border-white/10 text-left">
            <div>
              <span className="text-xs font-semibold text-[#FFF8F0] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Live Telemetry Active
              </span>
              <span className="text-[11px] text-[#A3ADC2]">
                7 Microservices & Databases monitored with zero manual coordination overhead.
              </span>
            </div>
            <Link to="/recovery">
              <Button variant="primary" size="sm" className="text-xs gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Simulate Outage Recovery</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Bento Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[#1E6BFF]">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#FFF8F0]">
              Topological Dependency Mapping
            </h3>
            <p className="text-xs text-[#A3ADC2] leading-relaxed">
              Computes downstream cascade impact through directed acyclic graphs. Restores database and caches before app pods to avoid crash loops.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#FFF8F0]">
              Human Approval Gates
            </h3>
            <p className="text-xs text-[#A3ADC2] leading-relaxed">
              High-risk actions like regional database failovers automatically pause execution awaiting cryptographic authorization from SRE commanders.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#FFF8F0]">
              On-Chain Audit Vault
            </h3>
            <p className="text-xs text-[#A3ADC2] leading-relaxed">
              Every recovery state transition and human decision is cryptographically hashed and anchored on-chain for tamper-proof compliance audits.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
