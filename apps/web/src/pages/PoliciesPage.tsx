import React from 'react';
import { motion, type BezierDefinition } from 'framer-motion';
import { Link } from 'react-router';
import { Card } from '../components/common/Card';
import {
  ShieldCheck,
  Lock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Gem,
  ExternalLink,
  Scale,
  EyeOff,
  Server,
  Zap,
} from 'lucide-react';
import { MST_CONFIG } from '../engine/mstBlockchain';

const EASE: BezierDefinition = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, duration: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: EASE },
  },
};

export const PoliciesPage: React.FC = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-8 font-sans w-full"
    >
      {/* Return Navigation & Badge */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#6E6258] hover:text-[#1A1A1A] transition-colors"
        >
          <span>&larr; Return to Home</span>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono text-emerald-800 font-bold">SOC 2 & ISO 27001 Aligned</span>
        </div>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-3 border-b border-[#EADCC9] pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#0047AB]/10 text-[#0047AB] border border-[#0047AB]/20">
            <Scale className="w-3.5 h-3.5" />
            GOVERNANCE, PRIVACY & COMPLIANCE
          </span>
          <span className="text-xs font-mono text-[#6E6258] px-2.5 py-1 rounded-full bg-[#FAF3EA] border border-[#E5D7C5]">
            Effective Date: October 2026
          </span>
          <span className="text-xs font-mono text-[#0047AB] px-2.5 py-1 rounded-full bg-[#EBF1FA] border border-[#0047AB]/20 font-bold">
            Version 2.4.0
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1A1A1A]">
          Horizon Privacy, Security & Operational Policies
        </h1>

        <p className="text-base text-[#5A4E44] font-medium leading-relaxed max-w-3xl">
          The comprehensive governance charter governing data sovereignty, zero-trust telemetry collection, cryptographic multi-sig approval protocols, and immutable on-chain audit retention across the Horizon platform.
        </p>
      </motion.div>

      {/* Policy Sections */}
      <motion.div variants={itemVariants} className="space-y-8 text-[#2C241E] leading-relaxed">
        {/* Policy 1: Zero-Trust Telemetry & Data Sovereignty */}
        <section className="p-6 rounded-2xl bg-white border border-[#E5D7C5] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EBF1FA] text-[#0047AB]">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">
                1. Data Sovereignty & Zero-Trust Telemetry
              </h2>
              <span className="text-[11px] font-mono text-[#6E6258]">
                GDPR Article 32 &bull; SOC 2 Confidentiality Principle
              </span>
            </div>
          </div>

          <p className="text-sm text-[#4A3E34] leading-relaxed">
            Horizon is architected on a fundamental privacy-by-design principle: <strong>Horizon never ingests, transmits, or stores production customer payloads, user queries, database contents, or personally identifiable information (PII).</strong>
          </p>

          <div className="space-y-2 text-xs text-[#5A4E44] bg-[#FAF3EA] p-4 rounded-xl border border-[#E5D7C5]">
            <span className="font-bold text-[#1A1A1A] block">What Horizon Collects & Evaluates:</span>
            <ul className="list-disc pl-5 space-y-1">
              <li>Synthetic health status indicators (HTTP status codes, socket heartbeat pings).</li>
              <li>Network latency percentiles (p50, p95, p99) and rolling MTTR recovery durations.</li>
              <li>Topological directed acyclic graph definitions (node IDs, service names, dependency edges).</li>
              <li>Non-custodial operator wallet public keys for on-chain authorization checks.</li>
            </ul>
          </div>
        </section>

        {/* Policy 2: Cryptographic Security & BridgeKey Wallets */}
        <section className="p-6 rounded-2xl bg-white border border-[#E5D7C5] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FEF6E7] text-[#D97706]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">
                2. Cryptographic Security & BridgeKey Multi-Sig
              </h2>
              <span className="text-[11px] font-mono text-[#6E6258]">
                EIP-712 Typed Data Signatures &bull; Non-Custodial Operations
              </span>
            </div>
          </div>

          <p className="text-sm text-[#4A3E34] leading-relaxed">
            All human approval gates for critical infrastructure (such as primary database failovers, data replication cutovers, or DNS routing modifications) are governed by EIP-712 structured cryptographic signatures.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-[#E5D7C5] bg-[#FFFBF7] space-y-1">
              <span className="font-bold text-[#1A1A1A] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#0047AB]" />
                Non-Custodial Keys
              </span>
              <p className="text-[#6E6258]">
                Private keys never leave the operator’s local browser sandbox. Horizon servers never store, proxy, or access wallet private keys.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E5D7C5] bg-[#FFFBF7] space-y-1">
              <span className="font-bold text-[#1A1A1A] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Anti-Replay Nonces
              </span>
              <p className="text-[#6E6258]">
                Every recovery authorization payload incorporates a cryptographic nonce and expiration timestamp to prevent signature replay attacks.
              </p>
            </div>
          </div>
        </section>

        {/* Policy 3: Immutable Audit Log Retention */}
        <section className="p-6 rounded-2xl bg-white border border-[#E5D7C5] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EBF7EE] text-[#0F8E52]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">
                3. Immutable On-Chain Audit Retention Policy
              </h2>
              <span className="text-[11px] font-mono text-[#6E6258]">
                MST Blockchain Testnet (Chain ID 91562037) &bull; SHA-256 Merkle Chaining
              </span>
            </div>
          </div>

          <p className="text-sm text-[#4A3E34] leading-relaxed">
            All incident lifecycles, autonomous recovery playbook steps, failover approvals, and operator overrides are cryptographically hashed and anchored into the MST Blockchain.
          </p>

          <p className="text-xs text-[#5A4E44] leading-relaxed bg-[#FAF3EA] p-3.5 rounded-xl border border-[#E5D7C5]">
            <strong>Permanent Tamper-Proof Audit:</strong> Because records are anchored to the blockchain, neither internal system administrators nor external actors possess the authority or technical capability to alter, backdate, or delete historical outage records.
          </p>
        </section>

        {/* Policy 4: Autonomous Playbook Safety & Circuit-Breakers */}
        <section className="p-6 rounded-2xl bg-white border border-[#E5D7C5] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">
                4. Automated Recovery Safeguards & Circuit-Breakers
              </h2>
              <span className="text-[11px] font-mono text-[#6E6258]">
                Infinite-Loop Prevention &bull; Maximum Consecutive Failures
              </span>
            </div>
          </div>

          <p className="text-sm text-[#4A3E34] leading-relaxed">
            To prevent flapping services or runaway automated remediation loops, the Horizon Autonomous Recovery Engine enforces strict algorithmic limits:
          </p>

          <ul className="space-y-2 text-xs text-[#5A4E44]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Circuit Breaker Tripping:</strong> If a microservice fails recovery 3 consecutive times, Horizon immediately disarms automated healing for that node and escalates an emergency page to human SRE teams.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Acyclic Verification Guarantee:</strong> Before any recovery sequence is committed, Kahn’s algorithm validates graph acyclicity. Topologies with circular dependencies are rejected to prevent infinite restart deadlocks.</span>
            </li>
          </ul>
        </section>

        {/* Policy 5: Web3 Token-Gated Subscription Terms */}
        <section className="p-6 rounded-2xl bg-white border border-[#E5D7C5] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Gem className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">
                5. Web3 NFT Subscription Terms (ZXPASS)
              </h2>
              <span className="text-[11px] font-mono text-[#6E6258]">
                ERC-721 Smart Contract &bull; Address: {MST_CONFIG.subscriptionContractAddress}
              </span>
            </div>
          </div>

          <p className="text-sm text-[#4A3E34] leading-relaxed">
            Access to higher-tier SRE capabilities (including automated chaos injection and unlimited node meshes) is token-gated via the ZXPASS ERC-721 smart contract minted on the MST Blockchain Testnet. Passes are non-custodial and verifiable via any Web3 client.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/subscription"
              className="skeuo-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold"
            >
              <Gem className="w-3.5 h-3.5 text-[#0047AB]" />
              <span>View Subscription Tiers</span>
            </Link>

            <a
              href={`${MST_CONFIG.explorerUrl}/token/${MST_CONFIG.subscriptionContractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono font-bold text-[#0047AB] hover:underline flex items-center gap-1"
            >
              <span>Verify Smart Contract on MSTScan</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </section>
      </motion.div>

      {/* Footer Navigation CTA */}
      <motion.div variants={itemVariants} className="pt-6 border-t border-[#EADCC9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/patents"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0047AB] hover:underline"
        >
          <span>&larr; View Horizon Patent Disclosure & Research Paper (research.pdf)</span>
        </Link>

        <a
          href="/research.pdf"
          download="research.pdf"
          className="skeuo-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Download Technical Research PDF</span>
        </a>
      </motion.div>
    </motion.div>
  );
};

export default PoliciesPage;
