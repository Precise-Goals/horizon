import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
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
  GitBranch,
} from 'lucide-react';
import { cn } from '../lib/utils';

/* ─── Reusable motion props factory ─── */
const fadeUpProps = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 } as const,
  animate:    { opacity: 1, y: 0 }  as const,
  transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

const fadeUpInView = (delay = 0) => ({
  initial:    { opacity: 0, y: 16 } as const,
  whileInView:{ opacity: 1, y: 0 }  as const,
  viewport:   { once: true }         as const,
  transition: { duration: 0.5,  delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

const FAQS = [
  {
    q: 'How does Horizon compute recovery order across dependent microservices?',
    a: "Horizon builds an in-memory DAG of your cluster. When a parent service (like PostgreSQL Primary) fails, Kahn's topological sort determines the exact reverse dependency traversal — databases and cache layers recover and pass health checks before downstream application pods restart.",
  },
  {
    q: 'Why store incident audit trails on MST Blockchain Testnet?',
    a: "Traditional cloud logging (CloudWatch, Datadog) can be edited or deleted by rogue credentials during a compromise. By anchoring cryptographic Merkle roots of every state change on MST Blockchain (Chain ID 91562037), Horizon delivers immutable, mathematically verifiable audit trails compliant with SOC 2 and ISO 27001.",
  },
  {
    q: 'What is the BridgeKey Wallet integration used for?',
    a: "BridgeKey is the cryptographic signing mechanism for high-privilege SRE actions. High-risk DR operations (cross-region DB failover, gateway route shifts) pause at a Human Approval Gate until authenticated SRE engineers cryptographically sign the authorization payload with BridgeKey.",
  },
  {
    q: 'Can Horizon operate in serverless environments like Vercel?',
    a: "Yes. Horizon is a monolithic Edge-ready architecture using TypeScript, Bun, and Hono serverless endpoints. Telemetry probing, state transitions, and Sarvam AI synthesis run with sub-millisecond cold starts on edge runtimes.",
  },
  {
    q: 'How does Sarvam AI interact with the recovery engine?',
    a: 'Sarvam AI acts as an autonomous SRE copilot. When outages are detected, it evaluates telemetry streams, generates incident postmortems in natural language, computes blast radius scores, and proposes targeted recovery actions that operators can execute in one click.',
  },
];

const TECH_SPECS = [
  { label: 'Autonomous MTTR', value: '< 3.8 min', detail: 'Deterministic topological rollout' },
  { label: 'Dependency Order',  value: 'O(V + E)',  detail: 'Cycle-free topological sorting'  },
  { label: 'On-Chain Ledger',   value: 'MST Chain', detail: 'Chain ID: 91562037'              },
  { label: 'AI Reasoning',      value: 'Sarvam 105B', detail: 'Hybrid deterministic + LLM'    },
  { label: 'Auth & Access',     value: 'Firebase + BridgeKey', detail: 'Web2 + Web3 dual verification' },
  { label: 'Runtime Target',    value: 'Vercel Edge / Bun', detail: 'Zero external daemon'   },
];

const PHASES = [
  { step: '01', title: 'Telemetry Detection',  desc: 'Sub-second TCP/HTTP probes detect latency degradation or socket termination.',      icon: Activity,  color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20'    },
  { step: '02', title: 'DAG Blast Radius',     desc: 'Topological analysis maps dependent blast radius and locks downstream callers.',     icon: Network,   color: 'text-indigo-400',  bg: 'bg-indigo-500/10 border-indigo-500/20'  },
  { step: '03', title: 'Sarvam AI Synthesis',  desc: 'Dual-speed reasoning generates optimal multi-tier playbook with risk scoring.',      icon: Sparkles,  color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20'    },
  { step: '04', title: 'Cryptographic Gate',   desc: 'High-risk commands pause for BridgeKey wallet signature from authorized SRE.',       icon: Lock,      color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20'   },
  { step: '05', title: 'On-Chain Attestation', desc: 'Execution completes; Merkle audit root anchored permanently on MST Blockchain.',    icon: FileCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
];

/* ─── Bento cards for architectural pillars ─── */
const PILLARS = [
  {
    id: 'dag',
    title: 'Directed Acyclic Graph Engine',
    desc: 'Unlike naive restart loops that crash pods concurrently, Horizon computes upstream and downstream blast radius. Primary databases and caching layers are restored and verified before application gateways route traffic, eliminating cascading connection storms.',
    badge: 'O(V + E) Traversal',
    badgeColor: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
    icon: Network,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10 border-blue-500/20',
    hoverBorder: 'hover:border-blue-500/30 hover:shadow-blue-500/8',
    stats: [
      { val: '0 ms',  label: 'Cycle Deadlock' },
      { val: '100%',  label: 'Order Determinism', highlight: 'text-emerald-400' },
      { val: '7 Nodes', label: 'Real-time Probes', highlight: 'text-blue-400' },
    ],
    colSpan: 'md:col-span-2',
  },
  {
    id: 'blockchain',
    title: 'BridgeKey & On-Chain Audit',
    desc: 'Cryptographic attestation on MST Blockchain Testnet. Every failover step and SRE signature is hashed into an immutable Merkle tree.',
    badge: 'Chain ID 91562037',
    badgeColor: 'text-purple-300 bg-purple-500/10 border-purple-500/20',
    icon: ShieldCheck,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10 border-purple-500/20',
    hoverBorder: 'hover:border-purple-500/30 hover:shadow-purple-500/8',
    colSpan: 'md:col-span-1',
  },
  {
    id: 'ai',
    title: 'Sarvam AI Autonomous Copilot',
    desc: 'SRE copilot continuously analyzing error signatures, interpreting natural language prompts, and synthesizing targeted recovery playbooks.',
    badge: 'sarvam-105b',
    badgeColor: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
    icon: Sparkles,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    hoverBorder: 'hover:border-cyan-500/30 hover:shadow-cyan-500/8',
    colSpan: 'md:col-span-1',
    terminal: true,
  },
  {
    id: 'gates',
    title: 'Cryptographic Human Approval Gates',
    desc: "Full autonomy does not mean unchecked risk. High-impact operations — promoting a standby database to primary, purging distributed cache pools, or rerouting edge DNS — automatically pause awaiting multi-signature approval from SRE commanders via BridgeKey.",
    badge: 'Zero-Trust Authorization',
    badgeColor: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
    icon: Lock,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    hoverBorder: 'hover:border-amber-500/30 hover:shadow-amber-500/8',
    colSpan: 'md:col-span-2',
  },
];

export const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div className="horizon-landing relative min-h-screen bg-[#07090E] text-[#FFF8F0] selection:bg-[#1E6BFF]/25 selection:text-white overflow-x-hidden">

      {/* ── Background atmosphere ── */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        {/* Radial top glow */}
        <div className="absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(30,107,255,0.14),transparent_70%)]" />
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_0%,#000_60%,transparent_100%)]" />
      </div>

      {/* ── Navbar ── */}
      <Navbar />

      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section
        className="horizon-hero relative pt-28 sm:pt-40 md:pt-52 pb-24 md:pb-36 flex flex-col items-center justify-center text-center overflow-hidden"
        aria-label="Hero"
      >
        {/* Earth curve backdrop */}
        <div
          className="absolute inset-x-0 bottom-0 h-[320px] md:h-[420px] pointer-events-none overflow-hidden select-none"
          aria-hidden="true"
        >
          <img
            src="/horizon.jpg"
            alt=""
            className="w-full h-full object-cover object-top opacity-40 mix-blend-screen scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8">
          {/* Status pill */}
          <motion.div
            {...fadeUpProps(0)}
            className="inline-flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.09] backdrop-blur-xl"
          >
            <span className="status-dot status-dot-healthy animate-pulse" />
            <span className="text-[11px] font-semibold text-[#C8D0DE] tracking-widest uppercase">
              Autonomous Cloud Resilience
            </span>
            <span className="horizon-badge text-blue-300 bg-blue-500/10 border-blue-500/20 text-[10px]">
              MST Testnet
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div {...fadeUpProps(0.06)}>
            <h1
              className="text-display text-[#FFF8F0] uppercase select-none mb-3"
              style={{ filter: 'drop-shadow(0 0 40px rgba(30,107,255,0.2))' }}
            >
              Horizon
            </h1>
            <p className="text-label text-[#8896A8] tracking-[0.15em] mb-6">
              Autonomous Self-Healing Infrastructure Platform
            </p>
          </motion.div>

          {/* Description */}
          <motion.p
            {...fadeUpProps(0.12)}
            className="text-base md:text-lg text-[#8896A8] max-w-2xl mx-auto leading-relaxed mb-9"
          >
            Detect systemic outages, compute topological blast radius in real time, and orchestrate
            deterministic recovery in strict dependency order — with cryptographic on-chain verification.
          </motion.p>

          {/* CTAs */}
          <motion.div
            {...fadeUpProps(0.18)}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
          >
            <Link to="/dashboard">
              <Button
                size="lg"
                className="horizon-cta-primary w-full sm:w-auto gap-2.5 px-8 rounded-2xl font-semibold shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] transition-all"
              >
                Launch Command Center
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/topology">
              <Button
                variant="secondary"
                size="lg"
                className="horizon-cta-secondary w-full sm:w-auto gap-2 px-7 rounded-2xl hover:border-blue-500/30"
              >
                <Network className="w-4 h-4 text-cyan-400" />
                Explore Dependency DAG
              </Button>
            </Link>
          </motion.div>

          {/* Live status dock */}
          <motion.div
            {...fadeUpProps(0.24)}
            className="flex flex-wrap items-center justify-center gap-5 text-[11px] font-mono text-[#8896A8]"
          >
            <span className="flex items-center gap-1.5">
              <span className="status-dot status-dot-healthy animate-pulse" />
              7 Services Monitored
            </span>
            <span aria-hidden="true">·</span>
            <span>Target MTTR: <strong className="text-emerald-400">&lt; 3.8m</strong></span>
            <span aria-hidden="true">·</span>
            <span>Consensus: <strong className="text-blue-400">MST (91562037)</strong></span>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          ARCHITECTURAL PILLARS — BENTO GRID
          ============================================================ */}
      <section
        className="horizon-pillars relative py-24 md:py-32 border-t border-white/[0.05]"
        aria-labelledby="pillars-heading"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 space-y-14">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto space-y-3"
          >
            <p className="text-label text-cyan-400">Core Architectural Pillars</p>
            <h2 id="pillars-heading" className="text-hero text-[#FFF8F0]">
              Engineered for Zero-Downtime Resilience
            </h2>
            <p className="text-base text-[#8896A8] leading-relaxed">
              Every subsystem is designed to eliminate cascading outages without manual firefighting.
            </p>
          </motion.div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.article
                  key={pillar.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.06 }}
                  whileHover={{ y: -3, transition: { duration: 0.18 } }}
                  className={cn(
                    'horizon-pillar-card bento-card p-7 md:p-8 flex flex-col gap-5 group transition-shadow',
                    pillar.colSpan,
                    pillar.hoverBorder
                  )}
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className={cn('p-2.5 rounded-xl border flex-shrink-0 group-hover:scale-105 transition-transform', pillar.iconBg)}>
                      <Icon className={cn('w-5 h-5', pillar.iconColor)} aria-hidden="true" />
                    </div>
                    <span className={cn('horizon-badge', pillar.badgeColor)}>
                      {pillar.badge}
                    </span>
                  </div>

                  {/* Body */}
                  <div>
                    <h3 className="text-base font-bold text-[#FFF8F0] mb-2">{pillar.title}</h3>
                    <p className="text-sm text-[#8896A8] leading-relaxed">{pillar.desc}</p>
                  </div>

                  {/* Stats row (DAG card) */}
                  {pillar.stats && (
                    <div className="pt-4 border-t border-white/[0.05] grid grid-cols-3 gap-3 text-center font-mono">
                      {pillar.stats.map((s) => (
                        <div key={s.label} className="p-3 rounded-xl bg-black/30 border border-white/[0.04]">
                          <div className={cn('text-lg font-bold', s.highlight || 'text-[#FFF8F0]')}>{s.val}</div>
                          <div className="text-[10px] text-[#8896A8] mt-0.5">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Terminal snippet (AI card) */}
                  {pillar.terminal && (
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.05] font-mono text-[11px] space-y-1">
                      <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
                        <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
                        sarvam.diagnose()
                      </div>
                      <div className="text-emerald-400">&gt; Root cause: DB pool exhaustion (port 5432)</div>
                      <div className="text-[#6B7A8D]">&gt; Sequence: Playbook #04 Standby Failover</div>
                    </div>
                  )}

                  {/* Gate footer (approval gates card) */}
                  {pillar.id === 'gates' && (
                    <div className="pt-4 border-t border-white/[0.05] flex flex-wrap items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-xs font-mono text-[#C8D0DE]">
                        <span className="status-dot status-dot-degraded animate-ping" />
                        Approval Gate: Awaiting EIP-712 Signature
                      </span>
                      <Link to="/recovery">
                        <Button variant="secondary" size="sm" className="text-xs gap-1.5 rounded-xl hover:border-amber-500/30">
                          Inspect Gate <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* AI card CTA */}
                  {pillar.id === 'ai' && (
                    <Link
                      to="/architect"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Launch Agentic Flow Architect →
                    </Link>
                  )}
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          5-PHASE LIFECYCLE
          ============================================================ */}
      <section
        className="horizon-lifecycle relative py-24 md:py-32 border-t border-white/[0.05] bg-[#060811]/60"
        aria-labelledby="lifecycle-heading"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 space-y-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto space-y-3"
          >
            <p className="text-label text-purple-400">System Architecture & Methodology</p>
            <h2 id="lifecycle-heading" className="text-hero text-[#FFF8F0]">
              5-Phase Autonomous Recovery Lifecycle
            </h2>
            <p className="text-base text-[#8896A8] leading-relaxed">
              How Horizon transforms an uncontained production crisis into a verified recovery in under 4 minutes.
            </p>
          </motion.div>

          {/* Phase cards — horizontal flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PHASES.map((phase, idx) => {
              const Icon = phase.icon;
              return (
                <motion.article
                  key={phase.step}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.07 }}
                  whileHover={{ y: -2, transition: { duration: 0.18 } }}
                  className="horizon-phase-card bento-card p-5 flex flex-col gap-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-label text-[#6B7A8D] group-hover:text-[#8896A8] transition-colors">
                      Phase {phase.step}
                    </span>
                    <div className={cn('p-1.5 rounded-lg border', phase.bg)}>
                      <Icon className={cn('w-3.5 h-3.5', phase.color)} aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#FFF8F0] mb-1.5">{phase.title}</h4>
                    <p className="text-[12px] text-[#8896A8] leading-relaxed">{phase.desc}</p>
                  </div>
                </motion.article>
              );
            })}
          </div>

          {/* Tech spec matrix */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bento-card p-7 md:p-9"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.05] mb-6">
              <div>
                <h3 className="text-base font-bold text-[#FFF8F0]">Horizon Technical Specifications</h3>
                <p className="text-sm text-[#8896A8] mt-0.5">Performance benchmarks for mission-critical infrastructure.</p>
              </div>
              <span className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold">
                <span className="status-dot status-dot-healthy" />
                MST TESTNET VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {TECH_SPECS.map((spec) => (
                <div
                  key={spec.label}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1.5"
                >
                  <div className="text-label text-[#8896A8]">{spec.label}</div>
                  <div className="text-lg font-bold font-mono text-[#FFF8F0] leading-tight">{spec.value}</div>
                  <div className="text-[11px] text-[#6B7A8D] leading-snug">{spec.detail}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          FAQ SECTION
          ============================================================ */}
      <section
        className="horizon-faq relative py-24 md:py-32 border-t border-white/[0.05]"
        aria-labelledby="faq-heading"
      >
        <div className="max-w-3xl mx-auto px-5 sm:px-8 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-3"
          >
            <p className="text-label text-blue-400">Technical Clarity</p>
            <h2 id="faq-heading" className="text-hero text-[#FFF8F0]">Frequently Asked Questions</h2>
            <p className="text-sm text-[#8896A8]">
              In-depth operational details for site reliability engineers and infrastructure leaders.
            </p>
          </motion.div>

          <div className="space-y-2.5">
            {FAQS.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.04 }}
                className="bento-card overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq((p) => (p === idx ? null : idx))}
                  className="w-full px-6 py-5 flex items-start justify-between gap-4 text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
                  aria-expanded={activeFaq === idx}
                >
                  <span className="text-sm font-semibold text-[#FFF8F0] leading-relaxed">{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5 transition-transform duration-200',
                      activeFaq === idx && 'rotate-180'
                    )}
                    aria-hidden="true"
                  />
                </button>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      key={`faq-${idx}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm text-[#8896A8] leading-relaxed border-t border-white/[0.04] pt-4">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          BOTTOM CTA
          ============================================================ */}
      <section className="horizon-cta relative py-24 md:py-32 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="relative bento-card overflow-hidden p-10 md:p-16 text-center"
            style={{ borderColor: 'rgba(30,107,255,0.2)', background: 'linear-gradient(135deg,rgba(30,107,255,0.06) 0%,rgba(15,20,32,0.8) 50%,rgba(99,102,241,0.06) 100%)' }}
          >
            {/* Glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
              style={{ background: 'radial-gradient(ellipse at top, rgba(30,107,255,0.1) 0%, transparent 65%)' }}
            />

            <div className="relative z-10 max-w-2xl mx-auto space-y-3 mb-8">
              <h2 className="text-hero text-[#FFF8F0]">
                Ready for Deterministic Self-Healing?
              </h2>
              <p className="text-base text-[#8896A8] leading-relaxed">
                Step into the command center, simulate outages across multi-tier topologies, and verify on-chain cryptographic audit anchoring live.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/dashboard">
                <Button size="lg" className="gap-2 px-8 rounded-2xl font-semibold shadow-xl shadow-blue-500/20">
                  Enter Command Center <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/recovery">
                <Button variant="secondary" size="lg" className="gap-2 px-7 rounded-2xl">
                  <RotateCcw className="w-4 h-4 text-cyan-400" />
                  Simulate Chaos Incident
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="horizon-footer border-t border-white/[0.05] py-8 px-5 text-center">
        <p className="text-sm text-[#8896A8] mb-1">
          Horizon Autonomous Enterprise Infrastructure Recovery
        </p>
        <p className="text-[11px] font-mono text-[#6B7A8D]">
          Protected by BridgeKey Cryptographic Signatures · MST Blockchain Testnet (Chain ID 91562037)
        </p>
      </footer>
    </div>
  );
};
