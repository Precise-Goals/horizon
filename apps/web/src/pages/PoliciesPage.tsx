import React from 'react';
import { motion, type BezierDefinition } from 'framer-motion';
import { Link } from 'react-router';
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
      className="max-w-4xl mx-auto space-y-8 font-sans w-full text-[#0A0A0A]"
    >
      {/* Return Navigation & Badge */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors bg-white px-3.5 py-1.5 rounded-full border border-[#E5E5E5] shadow-xs"
        >
          <span>&larr; Return to Home</span>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5E5E5] text-[11px] font-mono shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse" />
          <span className="font-semibold text-[#0A0A0A]">SOC 2 & ISO 27001 Aligned</span>
        </div>
      </motion.div>

      {/* Signature Two-Line Header */}
      <motion.div variants={itemVariants} className="space-y-3 border-b border-[#E5E5E5] pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-medium bg-neutral-100 text-[#0A0A0A] border border-[#E5E5E5]">
            <Scale className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>GOVERNANCE, PRIVACY & COMPLIANCE</span>
          </span>
          <span className="text-[11px] font-mono text-[#6B6B6B] px-3 py-1 rounded-full bg-white border border-[#E5E5E5] shadow-xs">
            Effective Date: October 2026
          </span>
          <span className="text-[11px] font-mono text-[#0A0A0A] px-3 py-1 rounded-full bg-white border border-[#E5E5E5] font-semibold shadow-xs">
            Version 3.0.0
          </span>
        </div>

        <h1 className="tracking-tight leading-[1.02]">
          <span className="block font-['Instrument_Serif',serif] font-normal text-[#A3A3A3] text-4xl sm:text-5xl lg:text-6xl">
            Governance & Privacy,
          </span>
          <span className="block font-['Instrument_Serif',serif] italic font-normal text-[#0A0A0A] text-4xl sm:text-5xl lg:text-6xl">
            operational charter.
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed max-w-3xl">
          The comprehensive governance charter governing data sovereignty, zero-trust telemetry collection, cryptographic multi-sig approval protocols, and immutable on-chain audit retention across the Horizon platform.
        </p>
      </motion.div>

      {/* Policy Sections */}
      <motion.div variants={itemVariants} className="space-y-6 text-[#0A0A0A] leading-relaxed">
        {/* Policy 1: Zero-Trust Telemetry & Data Sovereignty */}
        <section className="bg-white p-6 sm:p-8 rounded-[20px] border border-[#E5E5E5] space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neutral-100 text-[#0A0A0A] border border-[#E5E5E5]">
              <EyeOff className="w-5 h-5 text-[#2DD4BF]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#0A0A0A]">
                1. Data Sovereignty & Zero-Trust Telemetry
              </h2>
              <span className="text-[11px] font-mono text-[#6B6B6B]">
                GDPR Article 32 &bull; SOC 2 Confidentiality Principle
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
            Horizon is architected on a fundamental privacy-by-design principle: <strong className="text-[#0A0A0A]">Horizon never ingests, transmits, or stores production customer payloads, user queries, database contents, or personally identifiable information (PII).</strong>
          </p>

          <div className="space-y-2 text-xs text-[#0A0A0A] bg-[#FAFAF9] p-4 rounded-xl border border-[#E5E5E5] font-mono">
            <span className="font-semibold text-[#0A0A0A] block">What Horizon Collects & Evaluates:</span>
            <ul className="list-disc pl-5 space-y-1 text-[#6B6B6B]">
              <li>Synthetic health status indicators (HTTP status codes, socket heartbeat pings).</li>
              <li>Network latency percentiles (p50, p95, p99) and rolling MTTR recovery durations.</li>
              <li>Topological directed acyclic graph definitions (node IDs, service names, dependency edges).</li>
              <li>Non-custodial operator wallet public keys for on-chain authorization checks.</li>
            </ul>
          </div>
        </section>

        {/* Policy 2: Cryptographic Security & BridgeKey Wallets */}
        <section className="bg-white p-6 sm:p-8 rounded-[20px] border border-[#E5E5E5] space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neutral-100 text-[#0A0A0A] border border-[#E5E5E5]">
              <KeyRound className="w-5 h-5 text-[#2DD4BF]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#0A0A0A]">
                2. Cryptographic Security & BridgeKey Multi-Sig
              </h2>
              <span className="text-[11px] font-mono text-[#6B6B6B]">
                EIP-712 Typed Data Signatures &bull; Non-Custodial Operations
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
            All human approval gates for critical infrastructure (such as primary database failovers, data replication cutovers, or DNS routing modifications) are governed by EIP-712 structured cryptographic signatures.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-xl border border-[#E5E5E5] bg-[#FAFAF9] space-y-1">
              <span className="font-semibold text-[#0A0A0A] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#2DD4BF]" />
                Non-Custodial Keys
              </span>
              <p className="text-[#6B6B6B] leading-relaxed">
                Private keys never leave the operator’s local browser sandbox. Horizon servers never store, proxy, or access wallet private keys.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#E5E5E5] bg-[#FAFAF9] space-y-1">
              <span className="font-semibold text-[#0A0A0A] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2DD4BF]" />
                Anti-Replay Nonces
              </span>
              <p className="text-[#6B6B6B] leading-relaxed">
                Every recovery authorization payload incorporates a cryptographic nonce and expiration timestamp to prevent signature replay attacks.
              </p>
            </div>
          </div>
        </section>

        {/* Policy 3: Immutable Audit Log Retention */}
        <section className="bg-white p-6 sm:p-8 rounded-[20px] border border-[#E5E5E5] space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neutral-100 text-[#0A0A0A] border border-[#E5E5E5]">
              <ShieldCheck className="w-5 h-5 text-[#2DD4BF]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#0A0A0A]">
                3. Immutable On-Chain Audit Retention Policy
              </h2>
              <span className="text-[11px] font-mono text-[#6B6B6B]">
                MST Blockchain Testnet (Chain ID {MST_CONFIG.chainId}) &bull; SHA-256 Merkle Chaining
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
            All incident lifecycles, autonomous recovery playbook steps, failover approvals, and operator overrides are cryptographically hashed and anchored into the MST Blockchain.
          </p>

          <p className="text-xs text-[#6B6B6B] leading-relaxed bg-[#FAFAF9] p-4 rounded-xl border border-[#E5E5E5] font-mono">
            <strong className="text-[#0A0A0A]">Permanent Tamper-Proof Audit:</strong> Because records are anchored to the blockchain, neither internal system administrators nor external actors possess the authority or technical capability to alter, backdate, or delete historical outage records.
          </p>
        </section>

        {/* Policy 4: Automated Recovery Safeguards & Circuit-Breakers */}
        <section className="bg-white p-6 sm:p-8 rounded-[20px] border border-[#E5E5E5] space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neutral-100 text-[#0A0A0A] border border-[#E5E5E5]">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#0A0A0A]">
                4. Automated Recovery Safeguards & Circuit-Breakers
              </h2>
              <span className="text-[11px] font-mono text-[#6B6B6B]">
                Infinite-Loop Prevention &bull; Maximum Consecutive Failures
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
            To prevent flapping services or runaway automated remediation loops, the Horizon Autonomous Recovery Engine enforces strict algorithmic limits:
          </p>

          <ul className="space-y-2 text-xs text-[#6B6B6B]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2DD4BF] shrink-0 mt-0.5" />
              <span><strong className="text-[#0A0A0A]">Circuit Breaker Tripping:</strong> If a microservice fails recovery 3 consecutive times, Horizon immediately disarms automated healing for that node and escalates an emergency page to human SRE teams.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2DD4BF] shrink-0 mt-0.5" />
              <span><strong className="text-[#0A0A0A]">Acyclic Verification Guarantee:</strong> Before any recovery sequence is committed, Kahn’s algorithm validates graph acyclicity. Topologies with circular dependencies are rejected to prevent infinite restart deadlocks.</span>
            </li>
          </ul>
        </section>

        {/* Policy 5: Web3 Token-Gated Subscription Terms */}
        <section className="bg-white p-6 sm:p-8 rounded-[20px] border border-[#E5E5E5] space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neutral-100 text-[#0A0A0A] border border-[#E5E5E5]">
              <Gem className="w-5 h-5 text-[#2DD4BF]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#0A0A0A]">
                5. Web3 NFT Subscription Terms (ZXPASS)
              </h2>
              <span className="text-[11px] font-mono text-[#6B6B6B]">
                ERC-721 Smart Contract &bull; Address: {MST_CONFIG.subscriptionContractAddress}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
            Access to higher-tier SRE capabilities (including automated chaos injection and unlimited node meshes) is token-gated via the ZXPASS ERC-721 smart contract minted on the MST Blockchain Testnet. Passes are non-custodial and verifiable via any Web3 client.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/subscription"
              className="px-4 py-2 rounded-full bg-white hover:bg-neutral-50 text-[#0A0A0A] border border-[#E5E5E5] text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs"
            >
              <Gem className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>View Subscription Tiers</span>
            </Link>

            <a
              href={`${MST_CONFIG.explorerUrl}/token/${MST_CONFIG.subscriptionContractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono font-semibold text-[#0A0A0A] hover:underline flex items-center gap-1"
            >
              <span>Verify Smart Contract on MSTScan</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </section>
      </motion.div>

      {/* Footer Navigation CTA */}
      <motion.div variants={itemVariants} className="pt-6 border-t border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/patents"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#0A0A0A] hover:underline"
        >
          <span>&larr; View Horizon Patent Disclosure & Research Paper (research.pdf)</span>
        </Link>

        <a
          href="/research.pdf"
          download="research.pdf"
          className="px-6 py-2.5 rounded-full bg-[#0A0A0A] text-white hover:bg-neutral-800 text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Download Technical Research PDF</span>
        </a>
      </motion.div>
    </motion.div>
  );
};

export default PoliciesPage;
