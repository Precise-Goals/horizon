import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Lenis from 'lenis';
import { KindredNavbar } from '../components/layout/KindredNavbar';
import { KindredFooter } from '../components/layout/KindredFooter';
import { DotMatrixGlobe } from '../components/3d/DotMatrixGlobe';
import { BrandLogos } from '../components/common/BrandLogos';
import { CountUp } from '../components/common/CountUp';
import {
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Cpu,
  Layers,
  Database,
  Lock,
  GitBranch,
  ExternalLink,
  ChevronRight,
  Network,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../lib/utils';

// Headline word-by-word reveal split
const LINE_1_WORDS = ['Recover', 'in', 'minutes,'];
const LINE_2_WORDS = ['with', 'cryptographic', 'proof.'];

export const LandingPage: React.FC = () => {
  // Page scroll progress for the 2px ink scroll-progress bar
  const { scrollYProgress: pageScrollYProgress } = useScroll();

  // Hero reference for scroll-linked globe
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const [heroScrollVal, setHeroScrollVal] = useState(0);
  useEffect(() => {
    return heroScrollProgress.on('change', (val) => setHeroScrollVal(val));
  }, [heroScrollProgress]);

  // Smooth inertial scrolling with Lenis (lerp: 0.08, disabled on prefers-reduced-motion)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Pinned Scrollytelling Setup (300vh container)
  // ─────────────────────────────────────────────────────────────
  type TabType = 'dag' | 'blast' | 'gate' | 'audit';
  const TAB_KEYS: TabType[] = ['dag', 'blast', 'gate', 'audit'];
  const [activeTab, setActiveTab] = useState<TabType>('dag');
  const [tabProgress, setTabProgress] = useState(0);
  const isManualTabClick = useRef(false);
  const manualTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const scrollyContainerRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: scrollyProgress } = useScroll({
    target: scrollyContainerRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    return scrollyProgress.on('change', (progress) => {
      setTabProgress(progress);
      if (isManualTabClick.current) return;

      if (progress < 0.25) {
        setActiveTab('dag');
      } else if (progress < 0.5) {
        setActiveTab('blast');
      } else if (progress < 0.75) {
        setActiveTab('gate');
      } else {
        setActiveTab('audit');
      }
    });
  }, [scrollyProgress]);

  const handleSelectTab = (tab: TabType) => {
    isManualTabClick.current = true;
    setActiveTab(tab);
    clearTimeout(manualTimerRef.current);
    manualTimerRef.current = setTimeout(() => {
      isManualTabClick.current = false;
    }, 1200);
  };

  // ─────────────────────────────────────────────────────────────
  // Topology Simulation: Split-Brain Spike Sequence
  // ─────────────────────────────────────────────────────────────
  type SimPhase = 'nominal' | 'degraded' | 'isolated' | 'recovered';
  const [simPhase, setSimPhase] = useState<SimPhase>('nominal');
  const [ledgerEntries, setLedgerEntries] = useState<Array<{ id: string; action: string; hash: string; status: string; time: string }>>([
    {
      id: 'TX-4819200',
      action: 'HEARTBEAT_CONSENSUS_REACHED',
      hash: '0x3de5...9936',
      status: 'VERIFIED',
      time: '12s ago',
    },
  ]);
  const simTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearSimTimers = () => {
    simTimerRef.current.forEach(clearTimeout);
    simTimerRef.current = [];
  };

  const resetSimulation = () => {
    clearSimTimers();
    setSimPhase('nominal');
  };

  const triggerSplitBrainSimulation = () => {
    if (simPhase !== 'nominal' && simPhase !== 'recovered') return;
    clearSimTimers();

    // 1. Degraded phase (Split-Brain spike detected)
    setSimPhase('degraded');

    // 2. Isolated phase (Kahn DAG isolates primary tier, routes to standby hot replica)
    const t1 = setTimeout(() => {
      setSimPhase('isolated');
      setLedgerEntries((prev) => [
        {
          id: `TX-${Math.floor(4819200 + Math.random() * 50)}`,
          action: 'KAHN_DAG_ISOLATE_AND_FAILOVER(tier_1)',
          hash: '0x8f2a...c4b1',
          status: 'COMMITTED',
          time: 'just now',
        },
        ...prev.slice(0, 3),
      ]);

      // 3. Recovered phase (Sarvam AI autonomous consensus & EIP-712 cryptographic gate)
      const t2 = setTimeout(() => {
        setSimPhase('recovered');
        setLedgerEntries((prev) => [
          {
            id: `TX-${Math.floor(4819250 + Math.random() * 50)}`,
            action: 'SARVAM_AI_HEAL_ATTESTED(standby_active)',
            hash: '0xba20...0f0f',
            status: 'ANCHORED_MST',
            time: 'just now',
          },
          ...prev.slice(0, 3),
        ]);
      }, 2000);
      simTimerRef.current.push(t2);
    }, 1400);

    simTimerRef.current.push(t1);
  };

  useEffect(() => () => clearSimTimers(), []);

  return (
    <div className="relative min-h-screen bg-[#FAFAF9] text-[#0A0A0A] font-sans selection:bg-[#0A0A0A] selection:text-white overflow-x-hidden">
      
      {/* 2px ink scroll-progress bar at the very top of the page */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#0A0A0A] z-[100] origin-left pointer-events-none"
        style={{ scaleX: pageScrollYProgress }}
      />

      {/* ═════════════════════════════════════════════════════════════
          ACT I: EDITORIAL HERO WITH FIBONACCI SPHERE GLOBE
          ═════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative w-full min-h-[760px] lg:h-[920px] xl:h-[980px] flex flex-col justify-between overflow-hidden bg-[#FAFAF9]"
      >
        {/* Navbar with auto-hide on scroll down and return on scroll up */}
        <KindredNavbar />

        {/* Center Editorial Copy Block with Word-by-Word Reveal */}
        <div className="relative z-20 max-w-4xl mx-auto px-6 sm:px-8 pt-8 sm:pt-10 pb-4 text-center space-y-5">
          
          {/* Main Large Editorial Serif Headline with word-by-word reveal */}
          <h1 className="tracking-tight leading-[1.01] [text-wrap:balance]">
            <span className="block font-['Instrument_Serif',serif] font-normal text-[#A3A3A3] text-5xl sm:text-6xl md:text-7xl lg:text-[5.75rem]">
              {LINE_1_WORDS.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                    duration: 0.65,
                    delay: i * 0.04,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="inline-block mr-[0.24em] last:mr-0"
                >
                  {word}
                </motion.span>
              ))}
            </span>
            <span className="block font-['Instrument_Serif',serif] italic font-normal text-[#0A0A0A] text-5xl sm:text-6xl md:text-7xl lg:text-[5.75rem]">
              {LINE_2_WORDS.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                    duration: 0.65,
                    delay: (LINE_1_WORDS.length + i) * 0.04,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="inline-block mr-[0.24em] last:mr-0"
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </h1>

          {/* Clean Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-[#6B6B6B] leading-relaxed font-normal"
          >
            Topological dependency resolution, Sarvam-105B AI root-cause reasoning, and BridgeKey EIP-712 human commander gates — orchestrating deterministic self-healing with an immutable on-chain audit vault.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2"
          >
            <Link
              to="/dashboard"
              className="px-8 py-3.5 rounded-full bg-[#0A0A0A] text-white text-xs font-semibold hover:bg-neutral-800 active:scale-95 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center gap-2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4BF] focus-visible:ring-offset-2"
            >
              <span>Launch Command Center</span>
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>

            <a
              href="#showcase"
              className="px-7 py-3.5 rounded-full bg-white border border-[#E5E5E5] text-[#0A0A0A] text-xs font-semibold hover:bg-neutral-50 hover:border-[#D4D4D4] active:scale-95 transition-all shadow-sm flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4BF] focus-visible:ring-offset-2"
            >
              <svg className="w-4 h-4 stroke-[#2DD4BF] fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="2.5" />
                <circle cx="6" cy="18" r="2.5" />
                <circle cx="18" cy="18" r="2.5" />
                <line x1="12" y1="7.5" x2="6" y2="15.5" />
                <line x1="12" y1="7.5" x2="18" y2="15.5" />
              </svg>
              <span>Explore Live Showcase</span>
            </a>
          </motion.div>

        </div>

        {/* Centerpiece: Halftone Fibonacci-Sphere Earth Globe Canvas */}
        <div className="relative flex-1 w-full min-h-[380px] -mt-2 sm:-mt-6 z-10 pointer-events-none">
          <DotMatrixGlobe theme="light" scrollProgress={heroScrollVal} className="w-full h-full" />
        </div>

        {/* Bottom Logo Strip */}
        <div className="relative z-20 pb-8 pt-2 bg-gradient-to-t from-[#FAFAF9] via-[#FAFAF9]/90 to-transparent">
          <BrandLogos />
        </div>

      </section>

      {/* ═════════════════════════════════════════════════════════════
          ACT II: PINNED SCROLLYTELLING TOPOLOGY ORCHESTRATION CARD
          Pinned for ~300vh with automated tab progression
          ═════════════════════════════════════════════════════════════ */}
      <section
        id="showcase"
        ref={scrollyContainerRef}
        className="relative h-[300vh] bg-[#FAFAF9] border-t border-[#E5E5E5]"
      >
        {/* Sticky viewport frame pinned in center of viewport */}
        <div className="sticky top-16 lg:top-20 min-h-[calc(100vh-4rem)] flex flex-col justify-center py-6 sm:py-8">
          
          <div className="max-w-[1120px] w-full mx-auto px-6 overflow-hidden space-y-6">
            
            {/* Centered Balanced Headline with Eyebrow */}
            <div className="text-center max-w-[820px] mx-auto space-y-2.5 [text-wrap:balance]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5E5E5] text-[#0A0A0A] text-[11px] font-sans font-medium uppercase tracking-[0.12em] shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse" />
                <span>Live Autonomous Orchestration</span>
              </div>
              
              <h2 className="text-3xl sm:text-5xl font-['Instrument_Serif',serif] tracking-tight text-[#0A0A0A] leading-tight">
                <span className="text-[#A3A3A3] font-normal">Topological resilience, </span>
                <span className="italic font-normal text-[#0A0A0A]">rendered in real time.</span>
              </h2>
              
              <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed max-w-xl mx-auto">
                Scroll to traverse failure graphs bottom-up. Watch Horizon isolate degraded tiers with Kahn DAG ordering while unaffected pipelines process at wire speed.
              </p>
            </div>

            {/* Live Metrics Strip with Count-Up and Ink Sparklines */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-white border border-[#E5E5E5] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="space-y-1 px-3 py-1">
                <div className="text-[10px] uppercase font-mono tracking-wider text-[#A3A3A3]">p99 Recovery Latency</div>
                <div className="text-base font-semibold font-mono text-[#0A0A0A] flex items-center justify-between">
                  <CountUp end={24.8} decimals={1} suffix="s" />
                  <svg className="w-16 h-5 stroke-[#0A0A0A] fill-none" viewBox="0 0 64 20">
                    <path d="M0,16 Q16,14 28,18 T44,8 T64,6" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>

              <div className="space-y-1 px-3 py-1 border-l border-[#E5E5E5]">
                <div className="text-[10px] uppercase font-mono tracking-wider text-[#A3A3A3]">Healthy Nodes</div>
                <div className="text-base font-semibold font-mono text-[#0A0A0A] flex items-center justify-between">
                  <span><CountUp end={14} /> / 14</span>
                  <svg className="w-16 h-5 stroke-[#0A0A0A] fill-none" viewBox="0 0 64 20">
                    <path d="M0,10 L16,10 L24,4 L32,16 L40,10 L64,10" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>

              <div className="space-y-1 px-3 py-1 border-l border-[#E5E5E5]">
                <div className="text-[10px] uppercase font-mono tracking-wider text-[#A3A3A3]">Audit Roots Anchored</div>
                <div className="text-base font-semibold font-mono text-[#0A0A0A] flex items-center justify-between">
                  <CountUp end={4819203} prefix="#" />
                  <svg className="w-16 h-5 stroke-[#0A0A0A] fill-none" viewBox="0 0 64 20">
                    <path d="M0,16 L20,16 L20,10 L42,10 L42,4 L64,4" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>

              <div className="space-y-1 px-3 py-1 border-l border-[#E5E5E5]">
                <div className="text-[10px] uppercase font-mono tracking-wider text-[#A3A3A3]">Acyclic Guarantee</div>
                <div className="text-base font-semibold font-mono text-[#0A0A0A] flex items-center justify-between">
                  <span>100% Kahn</span>
                  <svg className="w-16 h-5 stroke-[#0A0A0A] fill-none" viewBox="0 0 64 20">
                    <path d="M0,12 L64,12" strokeWidth="1.5" strokeDasharray="3 3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* The Main Showcase Card with Faint Dotted Background Texture */}
            <div className="relative rounded-[20px] bg-white border border-[#E5E5E5] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300">
              
              {/* Faint Dotted Texture (4% opacity, behind card only) */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none rounded-[20px] opacity-[0.04] bg-[radial-gradient(#0A0A0A_1px,transparent_1px)] [background-size:16px_16px]"
              />

              {/* Window Controls & Pill Segmented Control Tab Bar */}
              <div className="relative z-10 px-6 py-4 border-b border-[#E5E5E5] bg-[#FAFAF9]/80 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Traffic Dot Controls & Route Label */}
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5] border border-[#D4D4D4]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5] border border-[#D4D4D4]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5] border border-[#D4D4D4]" />
                  <span className="ml-2 font-mono text-[11px] text-[#6B6B6B]">
                    horizon://cluster-frankfurt-core.topology
                  </span>
                </div>

                {/* Pill Segmented Control with Sliding White Indicator */}
                <div className="relative p-1 bg-[#F5F5F4] rounded-full border border-[#E5E5E5] flex items-center gap-1 self-start md:self-auto overflow-x-auto max-w-full">
                  {TAB_KEYS.map((tab) => {
                    const isCurrent = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => handleSelectTab(tab)}
                        className={cn(
                          'relative px-3.5 py-1.5 rounded-full text-[13px] font-sans font-semibold uppercase tracking-[0.08em] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4BF]',
                          isCurrent ? 'text-[#0A0A0A]' : 'text-[#6B6B6B] hover:text-[#0A0A0A]'
                        )}
                      >
                        {isCurrent && (
                          <motion.div
                            layoutId="topology-active-tab-indicator"
                            className="absolute inset-0 bg-white rounded-full border border-[#E5E5E5] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                            transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                          />
                        )}
                        <span className="relative z-10">
                          {tab === 'dag' && 'KAHN DAG'}
                          {tab === 'blast' && 'BLAST RADIUS'}
                          {tab === 'gate' && 'EIP-712 GATE'}
                          {tab === 'audit' && 'MERKLE LEDGER'}
                        </span>
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* Thin Scroll Progress Line along bottom edge of tab bar */}
              <div className="relative w-full h-[2px] bg-[#E5E5E5] overflow-hidden">
                <div
                  className="h-full bg-[#0A0A0A] transition-all duration-150 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, tabProgress * 100))}%` }}
                />
              </div>

              {/* Showcase Stage Content */}
              <div className="relative z-10 p-6 sm:p-7 space-y-6">
                
                {/* Simulation Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E5E5]">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-colors',
                        simPhase === 'nominal' && 'bg-emerald-50 text-emerald-800 border border-emerald-200',
                        simPhase === 'degraded' && 'bg-red-50 text-red-700 border border-red-200',
                        simPhase === 'isolated' && 'bg-amber-50 text-amber-800 border border-amber-200',
                        simPhase === 'recovered' && 'bg-teal-50 text-teal-800 border border-teal-200'
                      )}
                    >
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full',
                          simPhase === 'nominal' && 'bg-emerald-500',
                          simPhase === 'degraded' && 'bg-red-500 animate-ping',
                          simPhase === 'isolated' && 'bg-amber-500',
                          simPhase === 'recovered' && 'bg-[#2DD4BF]'
                        )}
                      />
                      <span>
                        {simPhase === 'nominal' && 'STATE: NOMINAL // 0.4ms'}
                        {simPhase === 'degraded' && 'STATE: DEGRADED // SPLIT-BRAIN (840ms)'}
                        {simPhase === 'isolated' && 'STATE: ISOLATED // TRAFFIC RE-ROUTED'}
                        {simPhase === 'recovered' && 'STATE: RECOVERED // ATTESTED ON-CHAIN'}
                      </span>
                    </span>

                    <span className="hidden sm:inline font-mono text-[11px] text-[#A3A3A3]">
                      Kahn Traversal: O(V + E)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {simPhase !== 'nominal' && (
                      <button
                        type="button"
                        onClick={resetSimulation}
                        className="px-3.5 py-1.5 rounded-full bg-white border border-[#E5E5E5] text-[#0A0A0A] hover:bg-neutral-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4BF]"
                      >
                        <RefreshCw className="w-3 h-3 text-[#6B6B6B]" />
                        <span>Reset</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={triggerSplitBrainSimulation}
                      className={cn(
                        'px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4BF] active:scale-95',
                        simPhase === 'nominal' || simPhase === 'recovered'
                          ? 'bg-[#0A0A0A] text-white hover:bg-neutral-800'
                          : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                      )}
                    >
                      <Zap className="w-3.5 h-3.5 text-[#2DD4BF]" />
                      <span>Simulate Split-Brain Spike</span>
                    </button>
                  </div>
                </div>

                {/* Animated Cross-Fading Tab Views */}
                <AnimatePresence mode="wait">
                  
                  {/* TAB 1: Real Node Graph Kahn DAG */}
                  {activeTab === 'dag' && (
                    <motion.div
                      key="dag"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      {/* Real Node Graph with Hairline SVG Connectors */}
                      <div className="relative">
                        
                        {/* SVG Hairline Connectors with Animated Teal Traveling Dots */}
                        <svg
                          className="absolute inset-0 w-full h-full pointer-events-none hidden md:block z-0"
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <linearGradient id="lineGradPrimary" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#E5E5E5" />
                              <stop offset="50%" stopColor={simPhase === 'degraded' ? '#EF4444' : '#2DD4BF'} />
                              <stop offset="100%" stopColor="#E5E5E5" />
                            </linearGradient>
                          </defs>

                          {/* Line 1: Tier 0 to Tier 1 Active */}
                          <path
                            d="M 320,80 C 350,80 370,80 400,80"
                            stroke={simPhase === 'degraded' ? '#EF4444' : '#E5E5E5'}
                            strokeWidth="1.5"
                            strokeDasharray={simPhase === 'isolated' ? '4 4' : 'none'}
                            fill="none"
                          />

                          {/* Line 2: Tier 0 to Tier 1 Standby Hot Replica */}
                          <path
                            d="M 320,110 C 360,110 360,190 400,190"
                            stroke={simPhase === 'isolated' || simPhase === 'recovered' ? '#2DD4BF' : '#E5E5E5'}
                            strokeWidth={simPhase === 'isolated' || simPhase === 'recovered' ? '2' : '1'}
                            strokeDasharray={simPhase === 'nominal' ? '3 3' : 'none'}
                            fill="none"
                          />

                          {/* Line 3: Tier 1 to Tier 2 Ingress */}
                          <path
                            d="M 700,80 C 730,80 750,80 780,80"
                            stroke={simPhase === 'isolated' ? '#E5E5E5' : '#2DD4BF'}
                            strokeWidth="1.5"
                            fill="none"
                          />
                        </svg>

                        {/* Staggered Parallax Tier Cards */}
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                          
                          {/* TIER 0: Roots */}
                          <div className="rounded-[20px] p-5 bg-white border border-[#E5E5E5] shadow-xs hover:-translate-y-1 hover:border-[#D4D4D4] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] text-[#0A0A0A] font-bold uppercase tracking-wider">
                                Tier 0 // Roots
                              </span>
                              <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2DD4BF] opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2DD4BF]" />
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-[#0A0A0A]">PostgreSQL Primary + Redis</div>
                              <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
                                Autonomous write replication with zero-dataloss WAL streaming lock.
                              </p>
                            </div>
                            <div className="font-mono text-[11px] text-emerald-700 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100 flex items-center justify-between">
                              <span>Healthy</span>
                              <span>0.4ms</span>
                            </div>
                          </div>

                          {/* TIER 1: Middlewares (Target of Spike) */}
                          <div
                            className={cn(
                              'rounded-[20px] p-5 bg-white border transition-all duration-300 space-y-3 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]',
                              simPhase === 'degraded' && 'border-red-400 bg-red-50/30',
                              simPhase === 'isolated' && 'border-amber-400 bg-amber-50/20',
                              simPhase === 'recovered' && 'border-[#2DD4BF] bg-teal-50/20',
                              simPhase === 'nominal' && 'border-[#E5E5E5]'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] text-[#0A0A0A] font-bold uppercase tracking-wider">
                                Tier 1 // Middlewares
                              </span>
                              
                              {/* Status Indicator */}
                              {simPhase === 'degraded' ? (
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full border-2 border-[#0A0A0A] opacity-80" />
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#EF4444]" />
                                </span>
                              ) : (
                                <span className="flex h-2 w-2 relative">
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2DD4BF]" />
                                </span>
                              )}
                            </div>

                            <div>
                              <div className="font-semibold text-sm text-[#0A0A0A]">Auth Gateway + Order RPC</div>
                              <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
                                Kahn topological ordering isolates circular deadlocks before cascading.
                              </p>
                            </div>

                            <div
                              className={cn(
                                'font-mono text-[11px] p-2 rounded-lg border flex items-center justify-between transition-colors',
                                simPhase === 'nominal' && 'text-emerald-700 bg-emerald-50/70 border-emerald-100',
                                simPhase === 'degraded' && 'text-red-700 bg-red-100/80 border-red-200 font-bold',
                                simPhase === 'isolated' && 'text-amber-800 bg-amber-100/70 border-amber-200 font-bold',
                                simPhase === 'recovered' && 'text-teal-800 bg-teal-100/70 border-teal-200'
                              )}
                            >
                              <span>
                                {simPhase === 'nominal' && 'Healthy'}
                                {simPhase === 'degraded' && 'Degraded // Split-Brain'}
                                {simPhase === 'isolated' && 'Isolated // Kahn Pruned'}
                                {simPhase === 'recovered' && 'Recovered // 0.8ms'}
                              </span>
                              <span>
                                {simPhase === 'nominal' && '4.2ms'}
                                {simPhase === 'degraded' && '840ms'}
                                {simPhase === 'isolated' && '0.6ms (Standby)'}
                                {simPhase === 'recovered' && '0.8ms'}
                              </span>
                            </div>

                            {/* Standby Hot Replica notice when failover engages */}
                            {(simPhase === 'isolated' || simPhase === 'recovered') && (
                              <div className="text-[10px] font-mono text-teal-800 bg-teal-50 p-2 rounded-lg border border-teal-200 flex items-center gap-1.5 animate-fadeIn">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]" />
                                <span>Traffic visibly re-routed to Standby Hot Replica</span>
                              </div>
                            )}
                          </div>

                          {/* TIER 2: Edge Ingress */}
                          <div className="rounded-[20px] p-5 bg-white border border-[#E5E5E5] shadow-xs hover:-translate-y-1 hover:border-[#D4D4D4] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] text-[#0A0A0A] font-bold uppercase tracking-wider">
                                Tier 2 // Edge
                              </span>
                              <span className="flex h-2 w-2 relative">
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2DD4BF]" />
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-[#0A0A0A]">GraphQL Ingress + CDN</div>
                              <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
                                Edge traffic preserved at wire-speed during upstream partition containment.
                              </p>
                            </div>
                            <div className="font-mono text-[11px] text-emerald-700 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100 flex items-center justify-between">
                              <span>Healthy</span>
                              <span>12.1ms</span>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Mini Ledger of Recent On-Chain State Mutations */}
                      <div className="p-3.5 rounded-xl bg-[#FAFAF9] border border-[#E5E5E5] space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#A3A3A3]">
                          <span>On-Chain Cryptographic Recovery Ledger</span>
                          <span>MST Testnet Chain ID 91562037</span>
                        </div>
                        <div className="space-y-1 font-mono text-[11px]">
                          {ledgerEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className="flex items-center justify-between py-1 px-2.5 rounded bg-white border border-[#E5E5E5] text-[#0A0A0A]"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-[#6B6B6B] font-semibold">{entry.id}:</span>
                                <span className="truncate">{entry.action}</span>
                                <span className="text-[#A3A3A3] text-[10px]">[{entry.hash}]</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                <span className="text-[10px] text-[#2DD4BF] font-semibold">{entry.status}</span>
                                <span className="text-[10px] text-[#A3A3A3]">{entry.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </motion.div>
                  )}

                  {/* TAB 2: Blast Radius Containment */}
                  {activeTab === 'blast' && (
                    <motion.div
                      key="blast"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25 }}
                      className="p-6 rounded-[20px] bg-white border border-[#E5E5E5] space-y-5"
                    >
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="font-bold text-[#0A0A0A]">Downstream Blast Radius Isolation Matrix</span>
                        <span className="text-teal-700 font-semibold">Strict Determinism: 100%</span>
                      </div>
                      <p className="text-xs text-[#6B6B6B] leading-relaxed">
                        When Frankfurt Core trips, downstream dependants are isolated within 80ms while healthy parallel pipelines continue processing uninterrupted. Zero cascading collapse.
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono text-[#6B6B6B]">
                          <span>Containment Envelope</span>
                          <span>{simPhase === 'degraded' ? '75% Isolated' : '25% Isolated'}</span>
                        </div>
                        <div className="h-3 w-full bg-[#F5F5F4] rounded-full overflow-hidden border border-[#E5E5E5]">
                          <div
                            className={cn(
                              'h-full transition-all duration-700 ease-out',
                              simPhase === 'degraded' ? 'w-3/4 bg-red-500' : 'w-1/4 bg-[#2DD4BF]'
                            )}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                        <div className="p-3 rounded-lg bg-[#FAFAF9] border border-[#E5E5E5]">
                          <div className="text-[#A3A3A3] text-[10px]">CONTAINMENT TIME</div>
                          <div className="text-sm font-semibold text-[#0A0A0A] mt-0.5">80ms MTTC</div>
                        </div>
                        <div className="p-3 rounded-lg bg-[#FAFAF9] border border-[#E5E5E5]">
                          <div className="text-[#A3A3A3] text-[10px]">PARALLEL LANES</div>
                          <div className="text-sm font-semibold text-[#0A0A0A] mt-0.5">6/6 Preserved</div>
                        </div>
                        <div className="p-3 rounded-lg bg-[#FAFAF9] border border-[#E5E5E5] col-span-2 sm:col-span-1">
                          <div className="text-[#A3A3A3] text-[10px]">CASCADE RISK</div>
                          <div className="text-sm font-semibold text-emerald-700 mt-0.5">0.00% Zero Risk</div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: EIP-712 Governance Gate */}
                  {activeTab === 'gate' && (
                    <motion.div
                      key="gate"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25 }}
                      className="p-6 rounded-[20px] bg-white border border-[#E5E5E5] space-y-4"
                    >
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="font-bold text-[#0A0A0A]">EIP-712 Structured Governance Approval Gate</span>
                        <span className="text-teal-700 font-semibold">ECDSA secp256k1</span>
                      </div>
                      <p className="text-xs text-[#6B6B6B] leading-relaxed">
                        High-blast recovery operations require cryptographic human commander approval before execution. Rogue actions mathematically impossible.
                      </p>
                      
                      {/* Dark Code Block (#0A0A0A, Mono font) */}
                      <div className="p-4 rounded-xl bg-[#0A0A0A] text-white font-mono text-xs overflow-x-auto shadow-inner leading-relaxed">
                        <code className="text-[#5EEAD4]">
                          {`{
  "domain": {
    "name": "HorizonResilienceEngine",
    "version": "3.1.0",
    "chainId": 91562037,
    "verifyingContract": "0x4B0DE152565276AEBD38CAD85B217D87045AED50"
  },
  "message": {
    "action": "KAHN_DAG_TOPOLOGICAL_FAILOVER",
    "targetTier": "tier_1_middlewares",
    "authorizedSigner": "0x7351A2...92FB",
    "nonce": 4819203,
    "timestamp": 1793468000
  },
  "primaryType": "RecoveryApproval",
  "status": "CRYPTOGRAPHICALLY_VERIFIED_ON_MST"
}`}
                        </code>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 4: Merkle Audit Vault */}
                  {activeTab === 'audit' && (
                    <motion.div
                      key="audit"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25 }}
                      className="p-6 rounded-[20px] bg-white border border-[#E5E5E5] space-y-4"
                    >
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="font-bold text-[#0A0A0A]">On-Chain Merkle Audit Root Proof</span>
                        <span className="text-emerald-700 font-bold">ATTESTED</span>
                      </div>
                      
                      <div className="p-3.5 rounded-xl bg-[#FAFAF9] border border-[#E5E5E5] space-y-2 font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[#6B6B6B]">MERKLE ROOT HASH:</span>
                          <span className="text-[#0A0A0A] font-semibold truncate max-w-sm ml-2">
                            0x40275ec7d4ea2c22ce11f5e3cdbd0df66850b769405438719e2f5bc9c9aecb60
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#A3A3A3] pt-1 border-t border-[#E5E5E5]">
                          <span>MST Testnet Block #4819203</span>
                          <span>Gas: 0.00018 MST &bull; Confirmed 1 sec ago</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                        <div className="p-3 rounded-lg bg-white border border-[#E5E5E5]">
                          <div className="text-[#A3A3A3] text-[10px]">IMMUTABILITY GUARANTEE</div>
                          <div className="text-sm font-semibold text-[#0A0A0A] mt-0.5">Tamper-Proof Ledger</div>
                        </div>
                        <div className="p-3 rounded-lg bg-white border border-[#E5E5E5]">
                          <div className="text-[#A3A3A3] text-[10px]">CONSENSUS MODEL</div>
                          <div className="text-sm font-semibold text-[#0A0A0A] mt-0.5">PoA Validator Set</div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          ACT III: KAHN TOPOLOGICAL BLUEPRINT RAIL
          Section padding: 120px desktop / 72px mobile
          Fade reveal with 16px upward movement on entry
          ═════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 py-[72px] lg:py-[120px] bg-white border-t border-[#E5E5E5]"
      >
        <div className="max-w-[1120px] mx-auto px-6 space-y-12">
          
          <div className="text-center max-w-[820px] mx-auto space-y-3 [text-wrap:balance]">
            <span className="text-xs font-mono font-semibold text-[#0A0A0A] uppercase tracking-[0.12em]">
              Mathematical Foundation
            </span>
            <h2 className="text-3xl sm:text-5xl font-['Instrument_Serif',serif] tracking-tight text-[#0A0A0A] leading-tight">
              <span className="text-[#A3A3A3] font-normal">Deterministic recovery, </span>
              <span className="italic font-normal text-[#0A0A0A]">guaranteed by Kahn DAG.</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed max-w-xl mx-auto">
              Zero heuristic guessing. Infrastructure is formally compiled into a directed acyclic graph, ensuring bottom-up restoration without cycle deadlocks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            
            <div className="p-6 rounded-[20px] bg-white border border-[#E5E5E5] space-y-3 hover:-translate-y-1 hover:border-[#D4D4D4] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-[#0A0A0A] font-bold">STAGE 01</span>
                <span className="text-[#A3A3A3]">
                  <CountUp end={120} suffix="Hz" />
                </span>
              </div>
              <h3 className="font-semibold text-sm text-[#0A0A0A]">eBPF Telemetry Ingestion</h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                Kernel-level probe stream tracking socket health, thread pools, and process tripwires with zero sidecar overhead.
              </p>
              <div className="font-mono text-[10px] p-2 rounded-lg bg-[#FAFAF9] text-[#6B6B6B] border border-[#E5E5E5]">
                tripwire_latency &gt; 500ms
              </div>
            </div>

            <div className="p-6 rounded-[20px] bg-white border border-[#E5E5E5] space-y-3 hover:-translate-y-1 hover:border-[#D4D4D4] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-[#0A0A0A] font-bold">STAGE 02</span>
                <span className="text-[#A3A3A3]">O(V+E)</span>
              </div>
              <h3 className="font-semibold text-sm text-[#0A0A0A]">Topological Blast Isolation</h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                Kahn topological sort isolates degraded upstream services while preserving independent traffic lanes to prevent outages.
              </p>
              <div className="font-mono text-[10px] p-2 rounded-lg bg-[#FAFAF9] text-[#6B6B6B] border border-[#E5E5E5]">
                Kahn: in_degree[v] == 0
              </div>
            </div>

            <div className="p-6 rounded-[20px] bg-white border border-[#E5E5E5] space-y-3 hover:-translate-y-1 hover:border-[#D4D4D4] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-[#0A0A0A] font-bold">STAGE 03</span>
                <span className="text-[#A3A3A3]">EIP-712</span>
              </div>
              <h3 className="font-semibold text-sm text-[#0A0A0A]">Cryptographic Human Gate</h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                Critical blast actions require ECDSA secp256k1 signatures from authorized BridgeKey commanders. Zero rogue actions.
              </p>
              <div className="font-mono text-[10px] p-2 rounded-lg bg-[#FAFAF9] text-[#6B6B6B] border border-[#E5E5E5]">
                verify(domain, actionHash, sig)
              </div>
            </div>

            <div className="p-6 rounded-[20px] bg-white border border-[#E5E5E5] space-y-3 hover:-translate-y-1 hover:border-[#D4D4D4] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-[#0A0A0A] font-bold">STAGE 04</span>
                <span className="text-[#A3A3A3]">SHA-256</span>
              </div>
              <h3 className="font-semibold text-sm text-[#0A0A0A]">On-Chain Merkle Vault</h3>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                Every state transition, AI diagnosis, and command execution is hashed into an immutable Merkle root anchored to MST Testnet.
              </p>
              <div className="font-mono text-[10px] p-2 rounded-lg bg-[#FAFAF9] text-[#6B6B6B] border border-[#E5E5E5]">
                merkleRoot.attest(blockNum)
              </div>
            </div>

          </div>

        </div>
      </motion.section>

      {/* ═════════════════════════════════════════════════════════════
          ACT IV: TELEMETRY DECK & PERFORMANCE WAVEFORMS
          Section padding: 120px desktop / 72px mobile
          Fade reveal with 16px upward movement on entry
          ═════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 py-[72px] lg:py-[120px] bg-[#FAFAF9] border-t border-[#E5E5E5]"
      >
        <div className="max-w-[1120px] mx-auto px-6 space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-semibold text-[#0A0A0A] uppercase tracking-[0.12em]">
                Telemetry Deck
              </span>
              <h2 className="text-3xl sm:text-4xl font-['Instrument_Serif',serif] tracking-tight text-[#0A0A0A] mt-1">
                <span className="text-[#A3A3A3] font-normal">Real-Time Instrument </span>
                <span className="italic font-normal text-[#0A0A0A]">Performance Metrics</span>
              </h2>
            </div>
            
            <div className="font-mono text-xs text-[#6B6B6B] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse" />
              <span>CLUSTER: ACTIVE (7 NODES)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            <div className="p-6 rounded-[20px] bg-white border border-[#E5E5E5] space-y-4 hover:-translate-y-1 hover:border-[#D4D4D4] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300">
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-[#6B6B6B]">p99 Recovery Latency</span>
                <span className="text-[#0A0A0A] font-bold text-sm">
                  <CountUp end={24.8} decimals={1} suffix="s" />
                </span>
              </div>
              <svg className="w-full h-14 stroke-[#0A0A0A] fill-none" viewBox="0 0 300 60">
                <path
                  d="M0,45 Q20,40 40,48 T80,30 T120,42 T160,25 T200,38 T240,15 T280,22 T300,18"
                  strokeWidth="1.8"
                />
              </svg>
              <div className="flex justify-between font-mono text-[10px] text-[#A3A3A3]">
                <span>T-60m</span>
                <span>Current: 24.8s MTTR</span>
              </div>
            </div>

            <div className="p-6 rounded-[20px] bg-white border border-[#E5E5E5] space-y-4 hover:-translate-y-1 hover:border-[#D4D4D4] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300">
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-[#6B6B6B]">Blast Radius Containment</span>
                <span className="text-[#0A0A0A] font-bold text-sm">100% Deterministic</span>
              </div>
              <svg className="w-full h-14 stroke-[#0A0A0A] fill-none" viewBox="0 0 300 60">
                <path
                  d="M0,50 L50,50 L80,20 L120,20 L140,50 L200,50 L230,15 L260,15 L280,50 L300,50"
                  strokeWidth="1.8"
                />
              </svg>
              <div className="flex justify-between font-mono text-[10px] text-[#A3A3A3]">
                <span>Acyclic Guarantee</span>
                <span>Zero Cycles Detected</span>
              </div>
            </div>

            <div className="p-6 rounded-[20px] bg-white border border-[#E5E5E5] space-y-4 hover:-translate-y-1 hover:border-[#D4D4D4] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300">
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-[#6B6B6B]">Audit Proof Anchoring</span>
                <span className="text-[#0A0A0A] font-bold text-sm">
                  <CountUp end={4819203} prefix="Block #" />
                </span>
              </div>
              <div className="h-14 font-mono text-[11px] text-[#0A0A0A] p-2.5 rounded-lg bg-[#FAFAF9] border border-[#E5E5E5] space-y-1 overflow-hidden">
                <div className="truncate text-[#0A0A0A] font-semibold">ROOT: 0x40275ec7d4ea2c22ce11f5e3cd...</div>
                <div className="text-[10px] text-[#6B6B6B]">MST Testnet &bull; Confirmed 1 sec ago</div>
              </div>
              <div className="flex justify-between font-mono text-[10px] text-[#A3A3A3]">
                <span>Gas: 0.00018 MST</span>
                <span>Immutable Proof</span>
              </div>
            </div>

          </div>

        </div>
      </motion.section>

      {/* ═════════════════════════════════════════════════════════════
          ACT V: FINAL EDITORIAL CALL TO ACTION
          Section padding: 120px desktop / 72px mobile
          Fade reveal with 16px upward movement on entry
          ═════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 py-[72px] lg:py-[120px] bg-white border-t border-[#E5E5E5]"
      >
        <div className="max-w-[820px] mx-auto px-6 text-center space-y-6 [text-wrap:balance]">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAFAF9] border border-[#E5E5E5] text-[#0A0A0A] text-xs font-mono">
            <Terminal className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>ENTERPRISE AIR-GAPPED &amp; CLOUD NATIVE</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-['Instrument_Serif',serif] tracking-tight leading-[1.04] text-[#0A0A0A]">
            <span className="text-[#A3A3A3] font-normal">Ready to eliminate downtime, </span>
            <span className="italic font-normal text-[#0A0A0A]">with mathematical certainty?</span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-[#6B6B6B] max-w-xl mx-auto leading-relaxed">
            Deploy Horizon Resilience in your cluster today. Zero telemetry export required; runs air-gapped inside your Kubernetes VPC.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/dashboard"
              className="px-8 py-3.5 rounded-full bg-[#0A0A0A] text-white text-xs font-semibold hover:bg-neutral-800 active:scale-95 transition-all shadow-md flex items-center gap-2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4BF] focus-visible:ring-offset-2"
            >
              <span>Launch Command Center</span>
              <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>
            
            <Link
              to="/docs"
              className="px-7 py-3.5 rounded-full bg-white border border-[#E5E5E5] text-[#0A0A0A] text-xs font-semibold hover:bg-neutral-50 active:scale-95 transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4BF] focus-visible:ring-offset-2"
            >
              Read Architectural Whitepaper
            </Link>
          </div>

        </div>
      </motion.section>

      {/* Footer */}
      <KindredFooter />

    </div>
  );
};

export default LandingPage;
