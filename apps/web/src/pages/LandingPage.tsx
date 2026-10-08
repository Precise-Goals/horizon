import React, { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../components/common/Button';
import {
  ShieldCheck,
  Network,
  RotateCcw,
  ArrowRight,
  Lock,
  CheckCircle2,
  Terminal,
  ChevronDown,
  Sparkles,
  Activity,
  FileCheck,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq((prev) => (prev === index ? null : index));
  };

  const faqs = [
    {
      q: 'How does Horizon compute the recovery order across dependent microservices?',
      a: 'Horizon builds an in-memory Directed Acyclic Graph (DAG) of your entire cluster. When a parent service (like PostgreSQL Primary) fails, Kahn’s topological sorting algorithm determines the exact reverse dependency traversal, ensuring databases and cache layers recover and pass health checks before downstream application pods restart.',
    },
    {
      q: 'Why does Horizon store incident audit trails on the MST Blockchain Testnet?',
      a: 'Traditional cloud logging (CloudWatch, Datadog) can be edited or deleted by rogue credentials during an infrastructure compromise. By anchoring cryptographic Merkle roots of every state change onto MST Blockchain (Chain ID 91562037), Horizon delivers immutable, mathematically verifiable audit trails compliant with SOC 2 and ISO 27001.',
    },
    {
      q: 'What is the BridgeKey Wallet integration used for?',
      a: 'BridgeKey serves as the cryptographic signing mechanism for high-privilege SRE actions. High-risk disaster recovery actions (e.g., cross-region database failover or gateway route shifts) pause at a Human Approval Gate until authenticated SRE engineers cryptographically sign the authorization payload with BridgeKey.',
    },
    {
      q: 'Can Horizon operate in serverless environments like Vercel without a persistent Python daemon?',
      a: 'Yes. Horizon has been engineered as a monolithic Edge-ready architecture using TypeScript, Bun, and Hono serverless endpoints (/api/v1/*). Telemetry probing, state transitions, and Sarvam AI synthesis run with sub-millisecond cold starts on edge runtimes.',
    },
    {
      q: 'How does Sarvam AI interact with the recovery engine?',
      a: 'Sarvam AI (sarvam-105b) acts as an autonomous SRE copilot. When outages are detected, it evaluates telemetry streams, generates incident postmortems in natural language, computes blast radius scores, and proposes targeted recovery actions that operators can execute in one click.',
    },
  ];

  const techSpecs = [
    { label: 'Autonomous MTTR', value: '< 3.8 minutes', detail: 'Deterministic topological rollout' },
    { label: 'Dependency Ordering', value: 'O(V + E) DAG', detail: 'Cycle-free topological sorting' },
    { label: 'On-Chain Ledger', value: 'MST Testnet', detail: 'Chain ID: 91562037' },
    { label: 'AI Reasoning Core', value: 'Sarvam 105B', detail: 'Hybrid deterministic & LLM' },
    { label: 'Auth & Access', value: 'Firebase & BridgeKey', detail: 'Web2 + Web3 Dual Verification' },
    { label: 'Runtime Target', value: 'Vercel Edge / Bun', detail: 'Zero external daemon dependencies' },
  ];

  return (
    <div className="relative min-h-screen bg-[#07090E] text-[#FFF8F0] overflow-hidden">
      {/* Aceternity Ambient Spotlight Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,107,255,0.22),rgba(255,255,255,0))] pointer-events-none z-0" />
      <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-2/3 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none z-0" />

      {/* Subtle Aceternity Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293712_1px,transparent_1px),linear-gradient(to_bottom,#1f293712_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10 pb-24 space-y-24">
        
        {/* ===================== HERO SECTION ===================== */}
        <section className="text-center space-y-8 max-w-4xl mx-auto pt-4 sm:pt-10">
          {/* Top Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] backdrop-blur-xl shadow-xl hover:border-blue-500/40 transition-colors">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E6BFF]" />
            </span>
            <span className="text-xs font-semibold text-[#E2D7CB] tracking-wider uppercase">
              Autonomous Infrastructure Resilience v1.0
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              MST Testnet Ready
            </span>
          </div>

          {/* Hero Typography */}
          <div className="space-y-5">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#FFF8F0] leading-[1.06]">
              Self-Healing <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#1E6BFF] via-[#60A5FA] to-[#FFF8F0] bg-clip-text text-transparent">
                Cloud Infrastructure
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-[#A3ADC2] max-w-2xl mx-auto leading-relaxed">
              Detect systemic outages, compute topological blast radius in real time, and orchestrate deterministic recovery in strict dependency order with cryptographic on-chain verification.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/dashboard">
              <Button size="lg" className="w-full sm:w-auto text-sm font-semibold gap-2.5 px-8 py-3.5 shadow-2xl shadow-blue-500/30 hover:scale-[1.02] transition-transform">
                <span>Launch Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/topology">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto text-sm px-6 py-3.5 gap-2 hover:border-blue-500/40">
                <Network className="w-4 h-4 text-blue-400" />
                <span>Explore Dependency DAG</span>
              </Button>
            </Link>
          </div>

          {/* Hero Visual Mockup Container (Aceternity style with glowing borders) */}
          <div className="relative mt-12 rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-2 sm:p-3 shadow-2xl shadow-blue-500/20 group hover:border-blue-500/40 transition-all duration-500">
            <div className="relative rounded-2xl overflow-hidden bg-[#07090E]">
              <img
                src="/hero.jpg"
                alt="Horizon Autonomous Cloud Resilience Network Nexus"
                className="w-full h-auto max-h-[520px] object-cover object-center transform group-hover:scale-[1.01] transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-transparent to-transparent opacity-80" />

              {/* Holographic HUD Overlay Bar */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#0B0F19]/85 backdrop-blur-2xl border border-white/10 text-left">
                <div className="space-y-0.5">
                  <span className="text-xs sm:text-sm font-bold text-[#FFF8F0] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Autonomous Resilience Engine Active</span>
                  </span>
                  <p className="text-[11px] sm:text-xs text-[#A3ADC2]">
                    7 Mission-critical nodes monitored across PostgreSQL, Redis, Edge Gateways & Auth services.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link to="/recovery">
                    <Button variant="primary" size="sm" className="text-xs gap-1.5 shadow-md shadow-blue-500/20">
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Simulate Outage Recovery</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== ACETERNITY BENTO GRID FEATURES ===================== */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-400">
              Core Architectural Pillars
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#FFF8F0]">
              Engineered for Zero-Downtime Resilience
            </h2>
            <p className="text-xs sm:text-sm text-[#A3ADC2]">
              Every subsystem is designed to eliminate cascading outages without manual firefighting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: DAG Engine (Spans 2 columns) */}
            <div className="md:col-span-2 relative group overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0D121D]/80 to-[#07090E] p-6 sm:p-8 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-[#1E6BFF] group-hover:scale-110 transition-transform">
                    <Network className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                    O(V + E) Topological Traversal
                  </span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#FFF8F0]">
                    Directed Acyclic Graph (DAG) Blast-Radius Computation
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A3ADC2] mt-2 leading-relaxed">
                    Unlike naive Kubernetes restart loops that crash pods concurrently, Horizon computes the upstream and downstream blast radius. In an outage, primary databases and caching layers are restored and verified before application gateways route traffic, eliminating cascading connection storm crashes.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/[0.08] grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04]">
                  <div className="text-lg font-bold font-mono text-[#FFF8F0]">0 ms</div>
                  <div className="text-[10px] text-[#A3ADC2]">Cycle Deadlock</div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04]">
                  <div className="text-lg font-bold font-mono text-emerald-400">100%</div>
                  <div className="text-[10px] text-[#A3ADC2]">Order Determinism</div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04]">
                  <div className="text-lg font-bold font-mono text-blue-400">7 Nodes</div>
                  <div className="text-[10px] text-[#A3ADC2]">Real-time Probes</div>
                </div>
              </div>
            </div>

            {/* Bento Card 2: BridgeKey Blockchain Security (Spans 1 column with vault.jpg) */}
            <div className="md:col-span-1 relative group overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-purple-500/[0.05] via-[#0D121D]/80 to-[#07090E] p-6 sm:p-8 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    Chain ID 91562037
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#FFF8F0]">
                    BridgeKey & On-Chain Audit
                  </h3>
                  <p className="text-xs text-[#A3ADC2] mt-2 leading-relaxed">
                    Cryptographic attestation on the MST Blockchain Testnet. Every failover step and SRE signature is hashed into an immutable Merkle tree.
                  </p>
                </div>
              </div>

              {/* Vault Thumbnail Art */}
              <div className="mt-6 rounded-2xl overflow-hidden border border-white/10 relative">
                <img
                  src="/vault.jpg"
                  alt="Cryptographic Recovery Mesh Vault"
                  className="w-full h-36 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-[10px] font-mono text-purple-300 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    MST Vault Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Bento Card 3: Sarvam AI Copilot (Spans 1 column) */}
            <div className="md:col-span-1 relative group overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-blue-500/[0.05] via-[#0D121D]/80 to-[#07090E] p-6 sm:p-8 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                    sarvam-105b
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#FFF8F0]">
                    Sarvam AI Autonomous Copilot
                  </h3>
                  <p className="text-xs text-[#A3ADC2] mt-2 leading-relaxed">
                    Multi-agent SRE intelligence continuously analyzing error signatures, interpreting natural language prompts, and synthesizing targeted recovery playbooks.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-3 rounded-xl bg-black/50 border border-white/[0.06] text-[11px] font-mono text-[#A3ADC2] space-y-1">
                <div className="flex items-center gap-1.5 text-blue-400">
                  <Terminal className="w-3 h-3" />
                  <span>sarvam.diagnose()</span>
                </div>
                <div className="text-emerald-400 text-[10px]">
                  &gt; Root cause: DB pool exhaustion (port 5432)
                </div>
                <div className="text-[10px] text-[#6E7A94]">
                  &gt; Recommended: Sequence Playbook #04
                </div>
              </div>
            </div>

            {/* Bento Card 4: Human Approval Gates (Spans 2 columns) */}
            <div className="md:col-span-2 relative group overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-[#0D121D]/80 to-[#07090E] p-6 sm:p-8 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <Lock className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Zero-Trust Authorization
                  </span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#FFF8F0]">
                    Cryptographic Human Approval Gates
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A3ADC2] mt-2 leading-relaxed">
                    Full autonomy does not mean unchecked risk. High-impact operations—such as promoting a standby database to primary, purging distributed cache pools, or rerouting edge DNS—automatically pause execution awaiting multi-signature approval from SRE commanders via BridgeKey.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-xs font-mono text-[#E2D7CB]">
                    Approval Gate: Awaiting EIP-712 Signature
                  </span>
                </div>
                <Link to="/recovery">
                  <Button variant="secondary" size="sm" className="text-xs gap-1.5 hover:border-amber-500/40">
                    <span>Inspect Gate Mechanism</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== ABOUT HORIZON & ARCHITECTURE DEEP DIVE ===================== */}
        <section className="space-y-12 pt-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-400">
              System Architecture & Methodology
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#FFF8F0]">
              The 5-Phase Autonomous Self-Healing Lifecycle
            </h2>
            <p className="text-xs sm:text-sm text-[#A3ADC2]">
              How Horizon transforms an uncontained production crisis into a closed, mathematically verified recovery in under 4 minutes.
            </p>
          </div>

          {/* 5-Phase Horizontal Timeline Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'Telemetry Detection',
                desc: 'Sub-second TCP and HTTP probes identify node latency degradation or socket termination.',
                icon: Activity,
                color: 'text-blue-400',
              },
              {
                step: '02',
                title: 'DAG Blast Radius',
                desc: 'Topological analysis computes dependent blast radius and locks downstream callers.',
                icon: Network,
                color: 'text-cyan-400',
              },
              {
                step: '03',
                title: 'Sarvam AI Synthesis',
                desc: 'Dual-speed reasoning generates optimal multi-tier playbook with risk scoring.',
                icon: Sparkles,
                color: 'text-purple-400',
              },
              {
                step: '04',
                title: 'Cryptographic Gate',
                desc: 'High-risk commands pause for BridgeKey wallet signature from authorized SRE.',
                icon: Lock,
                color: 'text-amber-400',
              },
              {
                step: '05',
                title: 'On-Chain Attestation',
                desc: 'Deterministic execution completes; Merkle audit root anchored on MST Blockchain.',
                icon: FileCheck,
                color: 'text-emerald-400',
              },
            ].map((phase) => {
              const Icon = phase.icon;
              return (
                <div
                  key={phase.step}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-3 relative group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold text-[#6E7A94] group-hover:text-blue-400 transition-colors">
                        PHASE {phase.step}
                      </span>
                      <Icon className={`w-4 h-4 ${phase.color}`} />
                    </div>
                    <h4 className="text-sm font-bold text-[#FFF8F0]">
                      {phase.title}
                    </h4>
                    <p className="text-[11px] text-[#A3ADC2] mt-1.5 leading-relaxed">
                      {phase.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Technical Specifications Matrix */}
          <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="text-lg font-bold text-[#FFF8F0]">
                  Horizon Enterprise Technical Specifications
                </h3>
                <p className="text-xs text-[#A3ADC2]">
                  Rigorous performance benchmarks for mission-critical production infrastructure.
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                TESTNET PRODUCTION READY
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {techSpecs.map((spec) => (
                <div
                  key={spec.label}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1"
                >
                  <div className="text-[11px] font-medium text-[#A3ADC2] uppercase tracking-wider">
                    {spec.label}
                  </div>
                  <div className="text-xl font-bold font-mono text-[#FFF8F0]">
                    {spec.value}
                  </div>
                  <div className="text-[11px] text-[#6E7A94]">
                    {spec.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== FREQUENTLY ASKED QUESTIONS ===================== */}
        <section className="space-y-8 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-400">
              Technical Clarity
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#FFF8F0]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#A3ADC2]">
              In-depth operational details for site reliability engineers and infrastructure leaders.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.03] transition-colors"
                >
                  <span className="text-sm font-semibold text-[#FFF8F0] pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-blue-400 shrink-0 transition-transform duration-200 ${
                      activeFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs text-[#A3ADC2] leading-relaxed border-t border-white/[0.04] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ===================== BOTTOM CTA BANNER ===================== */}
        <section className="relative rounded-3xl overflow-hidden border border-blue-500/30 bg-gradient-to-r from-blue-900/30 via-[#0B0F19] to-purple-900/30 p-8 sm:p-12 text-center space-y-6 shadow-2xl shadow-blue-500/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(30,107,255,0.15),transparent_70%)] pointer-events-none" />
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#FFF8F0] tracking-tight">
              Ready for Deterministic Self-Healing?
            </h2>
            <p className="text-xs sm:text-sm text-[#A3ADC2] leading-relaxed">
              Step into the command center, simulate outages across multi-tier topologies, and verify on-chain cryptographic audit anchoring live.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
            <Link to="/dashboard">
              <Button size="lg" className="w-full sm:w-auto text-sm font-semibold gap-2 px-8 py-3.5 shadow-xl shadow-blue-500/30">
                <span>Enter Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/recovery">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto text-sm px-6 py-3.5 gap-2">
                <RotateCcw className="w-4 h-4 text-blue-400" />
                <span>Simulate Chaos Incident</span>
              </Button>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
};
