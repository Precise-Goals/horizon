import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/common/Button';
import {
  ShieldCheck,
  Network,
  RotateCcw,
  ArrowRight,
  Lock,
  ChevronDown,
  Sparkles,
  Activity,
  FileCheck,
  Terminal,
  Zap,
  Server,
  Layers,
  Database,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { cn } from '../lib/utils';

/* ─── Motion Helpers ─── */
const fadeUpProps = (delay = 0) => ({
  initial:    { opacity: 0, y: 18 } as const,
  animate:    { opacity: 1, y: 0 }  as const,
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

const FAQS = [
  {
    q: 'How does Horizon compute recovery order across dependent microservices?',
    a: "Horizon constructs an in-memory Directed Acyclic Graph (DAG) of the entire infrastructure mesh. When a root service (like PostgreSQL Primary) experiences failure, Kahn’s topological sort calculates the deterministic reverse dependency traversal: databases and cache pools recover and satisfy readiness health-probes before application pods route ingress traffic.",
  },
  {
    q: 'Why anchor incident audit trails on the MST Blockchain Testnet?',
    a: "Traditional cloud log aggregators (Datadog, CloudWatch) can be purged or altered during an infrastructure compromise. By anchoring cryptographic Merkle roots of every state change onto MST Blockchain (Chain ID 91562037), Horizon establishes an immutable, legally verifiable ledger compliant with SOC 2, HIPAA, and ISO 27001.",
  },
  {
    q: 'What role does the BridgeKey Wallet play in autonomous recovery?',
    a: "BridgeKey serves as the cryptographic signing mechanism for high-privilege SRE actions. High-blast-radius failovers (such as cross-region DB cutover or BGP route shift) halt at a Human Approval Gate until authorized SRE engineers sign the EIP-712 payload with their hardware-backed wallet.",
  },
  {
    q: 'Can Horizon operate on serverless platforms like Vercel without persistent daemons?',
    a: "Yes. Horizon is architected as an Edge-ready monolithic engine utilizing TypeScript, Bun, and Hono serverless endpoints. Telemetry probes, state transitions, and Sarvam AI synthesis execute with sub-millisecond cold starts on Edge runtimes with zero external background daemons required.",
  },
  {
    q: 'How does Sarvam AI interact with the recovery engine?',
    a: "Sarvam AI (sarvam-105b) functions as an autonomous SRE copilot. During active incidents, it analyzes real-time error telemetry, generates incident postmortems in natural language, calculates blast radius scores, and synthesizes targeted recovery playbooks that operators can verify and execute.",
  },
];

const TECH_SPECS = [
  { label: 'Autonomous MTTR', value: '< 3.8 min', detail: 'Deterministic topological rollout' },
  { label: 'Dependency Ordering', value: 'O(V + E)', detail: 'Acyclic topological sorting' },
  { label: 'On-Chain Ledger', value: 'MST Testnet', detail: 'Chain ID: 91562037' },
  { label: 'AI Reasoning Core', value: 'Sarvam 105B', detail: 'Hybrid deterministic + LLM' },
  { label: 'Auth & Access', value: 'Firebase + BridgeKey', detail: 'Web2 + Web3 dual authentication' },
  { label: 'Runtime Target', value: 'Vercel Edge / Bun', detail: 'Zero external daemon' },
];

const PHASES = [
  { step: '01', title: 'Telemetry Probing', desc: 'Sub-second TCP/HTTP probes detect node degradation or socket termination.', icon: Activity },
  { step: '02', title: 'DAG Blast Radius', desc: 'Topological analysis maps downstream blast radius and locks dependent callers.', icon: Network },
  { step: '03', title: 'Sarvam AI Synthesis', desc: 'Dual-speed reasoning generates optimal multi-tier playbook with risk scoring.', icon: Sparkles },
  { step: '04', title: 'Cryptographic Gate', desc: 'High-risk actions pause for BridgeKey wallet EIP-712 signature from SRE.', icon: Lock },
  { step: '05', title: 'On-Chain Attestation', desc: 'Deterministic execution concludes; Merkle audit root anchored on MST Blockchain.', icon: FileCheck },
];

export const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div className="horizon-landing relative min-h-screen bg-[#FFF8F0] text-[#1A1A1A] selection:bg-[#0047AB]/20 selection:text-[#0047AB] overflow-x-hidden font-sans">
      {/* Porcelain Floating Dock Navbar */}
      <Navbar />

      {/* Subtle Tactile Blueprint Grid on Cream */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-40 bg-[linear-gradient(to_right,rgba(26,26,26,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(26,26,26,0.04)_1px,transparent_1px)] bg-[size:4rem_4rem]"
      />

      {/* ============================================================
          HERO SECTION — DOMINATING CREAM WITH TACTILE DEPTH
          ============================================================ */}
      <section
        className="horizon-hero relative pt-24 sm:pt-36 md:pt-44 pb-16 sm:pb-24 flex flex-col items-center justify-center text-center z-10"
        aria-label="Horizon Hero"
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8 space-y-7">
          {/* Tactile Hardware Status Pill */}
          <motion.div
            {...fadeUpProps(0)}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-[rgba(26,26,26,0.14)] shadow-[inset_0_1px_0_#FFFFFF,0_2px_6px_rgba(26,26,26,0.06)]"
          >
            <span className="skeuo-led skeuo-led-healthy animate-pulse" />
            <span className="text-[11px] font-bold text-[#1A1A1A] tracking-wider uppercase">
              Autonomous Cloud Resilience
            </span>
            <span className="horizon-badge text-[10px] text-[#0047AB] bg-[#EBF1FA] border-[#0047AB]/20">
              MST Testnet (91562037)
            </span>
          </motion.div>

          {/* Monumental Inky Black Typography */}
          <motion.div {...fadeUpProps(0.06)} className="space-y-3">
            <h1 className="text-display font-black text-[#1A1A1A] uppercase tracking-tight leading-none drop-shadow-sm select-none">
              Horizon
            </h1>
            <p className="text-xs sm:text-sm md:text-base font-mono font-bold tracking-[0.2em] uppercase text-[#0047AB]">
              Autonomous Infrastructure Recovery Platform
            </p>
          </motion.div>

          {/* Value Proposition Description */}
          <motion.p
            {...fadeUpProps(0.12)}
            className="text-base sm:text-lg md:text-xl text-[#444444] max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Detect systemic outages, compute topological blast radius in real time, and orchestrate
            deterministic recovery in strict dependency order — with cryptographic on-chain verification.
          </motion.p>

          {/* Tactile Buttons */}
          <motion.div
            {...fadeUpProps(0.18)}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2"
          >
            <Link to="/dashboard">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto text-sm font-bold gap-2 px-8 py-3.5 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_12px_rgba(0,71,171,0.3)] hover:scale-[1.02] transition-transform"
              >
                <span>Launch Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/topology">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto text-sm font-bold gap-2 px-7 py-3.5 rounded-xl"
              >
                <Network className="w-4 h-4 text-[#0047AB]" />
                <span>Explore Dependency DAG</span>
              </Button>
            </Link>
          </motion.div>

          {/* Hardware Telemetry Strip Well */}
          <motion.div
            {...fadeUpProps(0.24)}
            className="skeuo-well inline-flex flex-wrap items-center justify-center gap-5 px-5 py-2.5 text-xs font-mono text-[#555555]"
          >
            <div className="flex items-center gap-2">
              <span className="skeuo-led skeuo-led-healthy" />
              <span className="font-bold text-[#1A1A1A]">7 Services Monitored</span>
            </div>
            <span>&bull;</span>
            <div>
              Target MTTR: <span className="text-[#0F8E52] font-black">&lt; 3.8m</span>
            </div>
            <span>&bull;</span>
            <div>
              Consensus: <span className="text-[#0047AB] font-bold">MST Testnet</span>
            </div>
          </motion.div>
        </div>

        {/* ============================================================
            HERO COBALT BLUE PATCH: TACTICAL RECOVERY TERMINAL HUD
            ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16"
        >
          <div className="cobalt-patch p-6 sm:p-9 text-left">
            {/* Top Tactical Bezel */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/15">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 border border-red-500 shadow-sm" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-500 shadow-sm" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-500 shadow-sm" />
                </div>
                <div className="h-4 w-px bg-white/20" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E0ECFF]">
                  Live Autonomous Engine Preview &bull; Kahn Topo Sort
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#D0E2FF]">
                <Radio className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                <span>PROBING: 7/7 NODES SYNCED</span>
              </div>
            </div>

            {/* Tactical Grid Inside Cobalt Patch */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
              {/* Left Column: DAG Live State */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Network className="w-4 h-4 text-cyan-300" />
                    <span>Active Multi-Tier Dependency Graph</span>
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
                    Cycle-Free O(V + E)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md">
                    <div className="text-[10px] text-[#C8DCFF] uppercase font-bold">Tier 0 (Root Data)</div>
                    <div className="text-white font-bold mt-1">PostgreSQL Primary</div>
                    <div className="text-[11px] text-emerald-300 mt-0.5">● Port 5432 HEALTHY</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md">
                    <div className="text-[10px] text-[#C8DCFF] uppercase font-bold">Tier 1 (Cache)</div>
                    <div className="text-white font-bold mt-1">Redis Cluster</div>
                    <div className="text-[11px] text-emerald-300 mt-0.5">● Port 6379 HEALTHY</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md">
                    <div className="text-[10px] text-[#C8DCFF] uppercase font-bold">Tier 2 (Gateway)</div>
                    <div className="text-white font-bold mt-1">API Edge Gateway</div>
                    <div className="text-[11px] text-emerald-300 mt-0.5">● Port 8080 HEALTHY</div>
                  </div>
                </div>

                <p className="text-xs text-[#E0ECFF] leading-relaxed">
                  When parent nodes degrade, downstream traffic locks automatically. Primary databases recover and pass TCP/HTTP health probes before downstream application pods restart.
                </p>
              </div>

              {/* Right Column: Live Terminal Diagnostic */}
              <div className="p-4 rounded-xl bg-[#002259] border border-white/20 font-mono text-[11px] text-[#C8DCFF] flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-cyan-300 font-bold border-b border-white/10 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>sarvam-105b</span>
                    </span>
                    <span className="text-[10px] text-emerald-300">WATCHDOG ACTIVE</span>
                  </div>
                  <div className="text-white">&gt; Telemetry: All 7 probes responding</div>
                  <div className="text-emerald-300">&gt; Rolling MTTR: 18.2s (optimal SLA)</div>
                  <div className="text-amber-200">&gt; Approval Gate: EIP-712 Arm Ready</div>
                  <div className="text-[#A0C4FF]">&gt; MST Block: #1,042,912 Verified</div>
                </div>

                <Link
                  to="/recovery"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-colors border border-white/20"
                >
                  <span>Simulate Chaos Incident &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ============================================================
          ARCHITECTURAL PILLARS — SKEUOMORPHIC BENTO ON CREAM
          ============================================================ */}
      <section
        className="horizon-pillars relative py-20 sm:py-28 border-t border-[rgba(26,26,26,0.1)] bg-[#FFF8F0]"
        aria-labelledby="pillars-heading"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-2.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0047AB]">
              Core Architectural Pillars
            </span>
            <h2 id="pillars-heading" className="text-hero text-[#1A1A1A]">
              Engineered for Zero-Downtime Resilience
            </h2>
            <p className="text-sm sm:text-base text-[#666666]">
              Every subsystem is designed to eliminate cascading outages without manual firefighting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: DAG Engine (Spans 2 columns) */}
            <div className="md:col-span-2 skeuo-card p-7 sm:p-9 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#EBF1FA] border border-[#0047AB]/25 flex items-center justify-center text-[#0047AB]">
                    <Network className="w-6 h-6" />
                  </div>
                  <span className="horizon-badge text-[#0047AB] bg-[#EBF1FA] border-[#0047AB]/20">
                    O(V + E) Topological Traversal
                  </span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
                    Directed Acyclic Graph (DAG) Blast-Radius Computation
                  </h3>
                  <p className="text-sm text-[#555555] mt-2.5 leading-relaxed">
                    Unlike naive restart loops that crash pods concurrently, Horizon computes upstream and downstream blast radius. Primary databases and caching layers are restored and verified before application gateways route traffic, eliminating cascading connection storm crashes.
                  </p>
                </div>
              </div>

              {/* Inset debossed well stats */}
              <div className="skeuo-well p-4 grid grid-cols-3 gap-3 text-center font-mono">
                <div>
                  <div className="text-2xl font-black text-[#1A1A1A]">0 ms</div>
                  <div className="text-[11px] text-[#777777] mt-0.5">Cycle Deadlock</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#0F8E52]">100%</div>
                  <div className="text-[11px] text-[#777777] mt-0.5">Order Determinism</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#0047AB]">7 Nodes</div>
                  <div className="text-[11px] text-[#777777] mt-0.5">Real-time Probes</div>
                </div>
              </div>
            </div>

            {/* Bento Card 2: BridgeKey Blockchain Security */}
            <div className="md:col-span-1 skeuo-card p-7 sm:p-9 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#F5F3FF] border border-[#7C3AED]/25 flex items-center justify-center text-[#7C3AED]">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="horizon-badge text-[#7C3AED] bg-[#F5F3FF] border-[#7C3AED]/20">
                    Chain 91562037
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1A1A1A]">
                    BridgeKey & On-Chain Audit
                  </h3>
                  <p className="text-xs sm:text-sm text-[#555555] mt-2 leading-relaxed">
                    Cryptographic attestation on MST Blockchain Testnet. Every failover step and SRE signature is hashed into an immutable Merkle tree.
                  </p>
                </div>
              </div>

              <div className="skeuo-well p-3.5 space-y-1 font-mono text-xs">
                <div className="flex items-center justify-between text-[#7C3AED] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>MST Vault</span>
                  </span>
                  <span>TESTNET VERIFIED</span>
                </div>
                <div className="text-[#555555] truncate text-[11px]">
                  Contract: 0x8192...19284756
                </div>
              </div>
            </div>

            {/* Bento Card 3: Sarvam AI Copilot */}
            <div className="md:col-span-1 skeuo-card p-7 sm:p-9 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#EBF1FA] border border-[#0047AB]/25 flex items-center justify-center text-[#0047AB]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="horizon-badge text-[#0047AB] bg-[#EBF1FA] border-[#0047AB]/20">
                    sarvam-105b
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1A1A1A]">
                    Sarvam AI Autonomous Copilot
                  </h3>
                  <p className="text-xs sm:text-sm text-[#555555] mt-2 leading-relaxed">
                    Continuous telemetry reasoning core synthesizing targeted recovery playbooks in natural language.
                  </p>
                </div>
              </div>

              <div className="skeuo-well p-3 space-y-1 font-mono text-[11px]">
                <div className="text-[#0047AB] font-bold">&gt; sarvam.diagnose()</div>
                <div className="text-[#0F8E52] font-semibold">&gt; Pool exhaustion (5432)</div>
                <div className="text-[#777777]">&gt; Sequence #04 Failover</div>
              </div>

              <Link
                to="/architect"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0047AB] hover:underline"
              >
                Launch AI Flow Architect &rarr;
              </Link>
            </div>

            {/* Bento Card 4: Human Approval Gates (Spans 2 columns) */}
            <div className="md:col-span-2 skeuo-card p-7 sm:p-9 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#FEF6E7] border border-[#D97706]/25 flex items-center justify-center text-[#D97706]">
                    <Lock className="w-6 h-6" />
                  </div>
                  <span className="horizon-badge text-[#D97706] bg-[#FEF6E7] border-[#D97706]/20">
                    Zero-Trust Authorization
                  </span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
                    Cryptographic Human Approval Gates
                  </h3>
                  <p className="text-sm text-[#555555] mt-2 leading-relaxed">
                    Full autonomy does not mean unchecked risk. High-impact operations—such as promoting a standby database to primary, purging distributed cache pools, or rerouting edge DNS—automatically pause awaiting multi-signature approval from SRE commanders via BridgeKey.
                  </p>
                </div>
              </div>

              <div className="skeuo-well p-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="skeuo-led skeuo-led-degraded animate-ping" />
                  <span className="text-xs font-mono font-bold text-[#1A1A1A]">
                    Approval Gate: Awaiting EIP-712 SRE Signature
                  </span>
                </div>
                <Link to="/recovery">
                  <Button variant="secondary" size="sm" className="text-xs font-bold">
                    Inspect Gate Mechanism &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          COBALT BLUE BACKGROUND PATCH: 5-PHASE LIFECYCLE & SPECS
          ============================================================ */}
      <section
        className="horizon-lifecycle relative py-20 sm:py-28 bg-[#0047AB] text-[#FFF8F0]"
        aria-labelledby="lifecycle-heading"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-2.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
              System Architecture & Methodology
            </span>
            <h2 id="lifecycle-heading" className="text-hero text-white">
              The 5-Phase Autonomous Recovery Lifecycle
            </h2>
            <p className="text-sm sm:text-base text-[#D0E2FF]">
              How Horizon transforms an uncontained production crisis into a verified recovery in under 4 minutes.
            </p>
          </div>

          {/* 5 Phase Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PHASES.map((phase) => {
              const Icon = phase.icon;
              return (
                <div
                  key={phase.step}
                  className="p-5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex flex-col justify-between space-y-3 shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        PHASE {phase.step}
                      </span>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      {phase.title}
                    </h4>
                    <p className="text-xs text-[#D8E6FF] mt-1.5 leading-relaxed">
                      {phase.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Technical Specifications Matrix Inside Cobalt Patch */}
          <div className="rounded-3xl border border-white/20 bg-[#003680]/90 p-7 sm:p-9 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/15">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Horizon Enterprise Technical Specifications
                </h3>
                <p className="text-xs sm:text-sm text-[#C8DCFF] mt-0.5">
                  Rigorous performance benchmarks for mission-critical production infrastructure.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-300 flex items-center gap-2 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_6px_#6EE7B7]" />
                MST TESTNET VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TECH_SPECS.map((spec) => (
                <div
                  key={spec.label}
                  className="p-4 sm:p-5 rounded-2xl bg-white/10 border border-white/15 space-y-1 font-mono"
                >
                  <div className="text-[11px] font-bold text-[#C8DCFF] uppercase tracking-wider">
                    {spec.label}
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white">
                    {spec.value}
                  </div>
                  <div className="text-xs text-[#A8C8FF]">
                    {spec.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FREQUENTLY ASKED QUESTIONS — PORCELAIN ON CREAM
          ============================================================ */}
      <section
        className="horizon-faq relative py-20 sm:py-28 border-t border-[rgba(26,26,26,0.1)] bg-[#FFF8F0]"
        aria-labelledby="faq-heading"
      >
        <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-10">
          <div className="text-center space-y-2.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0047AB]">
              Technical Clarity
            </span>
            <h2 id="faq-heading" className="text-hero text-[#1A1A1A]">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[#666666]">
              In-depth operational details for site reliability engineers and infrastructure leaders.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="skeuo-card overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq((p) => (p === idx ? null : idx))}
                  className="w-full p-5 sm:p-6 flex items-center justify-between text-left cursor-pointer hover:bg-[#FAF3EA] transition-colors"
                  aria-expanded={activeFaq === idx}
                >
                  <span className="text-sm sm:text-base font-bold text-[#1A1A1A] pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-[#0047AB] shrink-0 transition-transform duration-200',
                      activeFaq === idx && 'rotate-180'
                    )}
                  />
                </button>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      key={`faq-${idx}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-[#555555] leading-relaxed border-t border-[rgba(26,26,26,0.08)] pt-3.5 bg-[#FAF4ED]">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          FINAL WAR ROOM CTA — COBALT BLUE PATCH
          ============================================================ */}
      <section className="horizon-cta relative py-20 sm:py-28 border-t border-[rgba(26,26,26,0.1)] bg-[#FAF3EA]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="cobalt-patch p-8 sm:p-14 md:p-16 text-center space-y-6">
            <div className="max-w-2xl mx-auto space-y-2.5 relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                Ready for Deterministic Self-Healing?
              </h2>
              <p className="text-sm sm:text-base text-[#D0E2FF] leading-relaxed">
                Step into the resilience command center, simulate outages across multi-tier topologies, and verify on-chain cryptographic audit anchoring live.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 relative z-10 pt-2">
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-sm font-bold gap-2 px-8 py-3.5 rounded-xl bg-white text-[#0047AB] hover:bg-[#F0F5FF] shadow-xl hover:scale-[1.02]"
                >
                  <span>Enter Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/recovery">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-sm font-bold gap-2 px-7 py-3.5 rounded-xl bg-transparent border-2 border-white text-white hover:bg-white/10"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Simulate Chaos Incident</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          ANTIGRAVITY-STYLE MONUMENTAL FOOTER
          ============================================================ */}
      <Footer />
    </div>
  );
};
