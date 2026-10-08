import React, { useState } from 'react';
import { motion, type BezierDefinition } from 'framer-motion';
import { Link } from 'react-router';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  FileText,
  Download,
  ExternalLink,
  ShieldCheck,
  Network,
  Lock,
  CheckCircle2,
  BookOpen,
  Award,
  Users,
  Calendar,
  Layers,
  ArrowRight,
  Eye,
  FileCheck,
  KeyRound,
  RotateCcw,
} from 'lucide-react';

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

export const PatentsPage: React.FC = () => {
  const [showEmbeddedPdf, setShowEmbeddedPdf] = useState(false);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-8 font-sans w-full"
    >
      {/* Return Breadcrumb & Status */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#6E6258] hover:text-[#1A1A1A] transition-colors"
        >
          <span>&larr; Return to Home</span>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#0047AB] animate-pulse" />
          <span className="text-xs font-mono text-[#0047AB] font-bold">Research Paper &bull; research.pdf</span>
        </div>
      </motion.div>

      {/* Article Header & Metadata */}
      <motion.div variants={itemVariants} className="space-y-4 border-b border-[#EADCC9] pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#0047AB]/10 text-[#0047AB] border border-[#0047AB]/20">
            <Award className="w-3.5 h-3.5" />
            PATENT DISCLOSURE & RESEARCH ARTICLE
          </span>
          <span className="text-xs font-mono text-[#6E6258] px-2.5 py-1 rounded-full bg-[#FAF3EA] border border-[#E5D7C5]">
            October 2026
          </span>
          <span className="text-xs font-mono text-[#0F8E52] px-2.5 py-1 rounded-full bg-[#EBF7EE] border border-[#0F8E52]/20 font-bold">
            Patentability Assessment: NOVEL
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1A1A1A] leading-tight">
          Horizon: Dependency-Aware Autonomous Infrastructure Recovery
        </h1>

        <p className="text-base sm:text-lg text-[#5A4E44] font-medium leading-relaxed">
          Architecture, Prior-Art Analysis and Patentability Assessment — A Technical Research Paper in Support of an Invention Disclosure
        </p>

        {/* Authors & Institutional Affiliation */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-[#6E6258] border-t border-[#F0E4D5]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0047AB]" />
            <span className="font-bold text-[#1A1A1A]">
              Sarthak Tulsidas Patil, Karan Verma, Sneha Sharma, Sneha Patidar
            </span>
          </div>
          <div className="text-[11px] text-[#8A7B6D]">
            Independent Research &bull; Hackathon Prototype, India
          </div>
        </div>
      </motion.div>

      {/* PDF Download & Quick Actions Hero Strip */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 skeuo-card border-[#E5D7C5] bg-gradient-to-br from-white to-[#FAF4ED] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-[#0047AB] text-white shadow-md">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1A1A1A] flex items-center gap-2">
                  <span>research.pdf</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EBF1FA] text-[#0047AB] border border-[#0047AB]/20">
                    384 KB
                  </span>
                </h3>
                <p className="text-xs text-[#6E6258] mt-0.5 font-medium">
                  Official Technical Invention Disclosure & Prior-Art Paper stored in public directory.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setShowEmbeddedPdf((prev) => !prev)}
                className="skeuo-btn-secondary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#1A1A1A] cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#0047AB]" />
                <span>{showEmbeddedPdf ? 'Hide PDF Viewer' : 'View Embedded PDF'}</span>
              </button>

              <a
                href="/research.pdf"
                download="research.pdf"
                className="skeuo-btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download research.pdf</span>
              </a>

              <a
                href="/research.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white hover:bg-stone-100 border border-[#D5C5B2] text-[#6E6258] hover:text-[#1A1A1A] transition-colors"
                title="Open PDF in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Embedded PDF Viewer (Toggleable) */}
          {showEmbeddedPdf && (
            <div className="pt-4 border-t border-[#E5D7C5]">
              <div className="rounded-2xl overflow-hidden border border-[#D5C5B2] shadow-inner bg-[#1A1A1A]">
                <iframe
                  src="/research.pdf"
                  title="Horizon Research Paper & Patent Disclosure"
                  className="w-full h-[650px] border-0"
                />
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* ============================================================
          ARTICLE BODY: ACADEMIC & PATENT DISCLOSURE
          ============================================================ */}
      <motion.div variants={itemVariants} className="space-y-8 text-[#2C241E] leading-relaxed">
        {/* Section: Abstract */}
        <section className="space-y-3 p-6 rounded-2xl bg-white border border-[#E5D7C5] shadow-xs">
          <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-[#0047AB] flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>Abstract</span>
          </h2>
          <p className="text-sm font-serif sm:text-base leading-relaxed text-[#3A3027] italic">
            &ldquo;When distributed infrastructure breaks, restarting a single component rarely fixes anything. Failures travel along dependency chains, and bringing an application back before its database is healthy simply restarts the failure loop and stretches the mean time to recovery (MTTR). This paper presents Horizon, an offline-capable recovery platform that understands those dependencies. It keeps a directed graph of infrastructure nodes, works out the blast radius as soon as a failure is detected, builds a recovery sequence that respects the dependency order, runs low-risk steps automatically, holds high-risk steps for human or cryptographic approval, and records everything it does in an immutable audit trail.&rdquo;
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#6E6258]">
            <span className="font-bold text-[#1A1A1A]">Keywords:</span>
            <span>Autonomous SRE</span> &bull;
            <span>Directed Acyclic Graphs (DAG)</span> &bull;
            <span>Kahn’s Topological Sort</span> &bull;
            <span>EIP-712 Multi-Sig Gates</span> &bull;
            <span>Merkle Chain Auditing</span> &bull;
            <span>Zero MTTR</span>
          </div>
        </section>

        {/* Section 1: The Core Problem */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A] tracking-tight">
            1. The Technical Problem: Cascading Failure Loops
          </h2>
          <p className="text-sm sm:text-base text-[#4A3E34] leading-relaxed">
            Modern enterprise systems are directed graphs of interconnected microservices, queues, caches, and stateful databases. When a database cluster fails, existing self-healing frameworks (such as Kubernetes crash-loop backoff or basic supervisor daemons) repeatedly restart the application layer. This naive restart behavior inundates the recovering database with connection storms, producing cascading degradation and escalating MTTR.
          </p>
          <p className="text-sm sm:text-base text-[#4A3E34] leading-relaxed">
            Horizon introduces an architecture that treats infrastructure as an immutable mathematical graph $G = (V, E)$, ensuring no downstream service is ever scheduled for recovery until all foundational parent nodes satisfy strict cryptographic and telemetry readiness criteria.
          </p>
        </section>

        {/* Section 2: Four Core Patent Claims */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#EADCC9] pb-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A] tracking-tight">
              2. Core Patent Claims & Novelty Assessment
            </h2>
            <span className="text-xs font-mono font-bold text-[#0047AB]">
              Invention Disclosure Claims 1–4
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Claim 1 */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5D7C5] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#0047AB]">Claim 1</span>
                <span className="p-1.5 rounded-lg bg-[#EBF1FA] text-[#0047AB]">
                  <Network className="w-3.5 h-3.5" />
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                Dynamic Blast Radius Discovery
              </h3>
              <p className="text-xs text-[#5A4E44] leading-relaxed font-medium">
                A computer-implemented method executing reverse depth-first traversal across directed dependency edges to compute the full downstream failure set within sub-second thresholds of initial incident detection.
              </p>
            </div>

            {/* Claim 2 */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5D7C5] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#0047AB]">Claim 2</span>
                <span className="p-1.5 rounded-lg bg-[#EBF1FA] text-[#0047AB]">
                  <RotateCcw className="w-3.5 h-3.5" />
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                Topological Kahn Execution Plan
              </h3>
              <p className="text-xs text-[#5A4E44] leading-relaxed font-medium">
                Deterministic bottom-up scheduling guaranteeing zero cyclic recovery deadlocks ($O(V + E)$ complexity), guaranteeing foundational data stores restore before stateless workers or gateways are restarted.
              </p>
            </div>

            {/* Claim 3 */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5D7C5] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#0047AB]">Claim 3</span>
                <span className="p-1.5 rounded-lg bg-[#EBF1FA] text-[#0047AB]">
                  <KeyRound className="w-3.5 h-3.5" />
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                Cryptographic Approval Gating
              </h3>
              <p className="text-xs text-[#5A4E44] leading-relaxed font-medium">
                Dual-tier risk evaluation where low-risk tasks execute autonomously while destructive database schema migrations or DNS cutovers require EIP-712 typed data signatures from designated BridgeKey operator wallets.
              </p>
            </div>

            {/* Claim 4 */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5D7C5] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#0047AB]">Claim 4</span>
                <span className="p-1.5 rounded-lg bg-[#EBF1FA] text-[#0047AB]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                Immutable Blockchain Audit Ledger
              </h3>
              <p className="text-xs text-[#5A4E44] leading-relaxed font-medium">
                Every recovery action, playbook duration, and approval hash is anchored into a cryptographic SHA-256 Merkle chain and posted to MST Blockchain Testnet (Chain ID 91562037) for tamper-evident compliance.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Comparative Prior-Art Matrix */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A] tracking-tight">
            3. Prior-Art Comparative Matrix
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-[#E5D7C5] bg-white shadow-xs">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#FAF3EA] border-b border-[#E5D7C5] text-[#1A1A1A] font-bold">
                <tr>
                  <th className="p-3.5">Capability / Dimension</th>
                  <th className="p-3.5 text-[#0047AB]">Horizon Platform</th>
                  <th className="p-3.5">Kubernetes K8s</th>
                  <th className="p-3.5">AWS Systems Manager</th>
                  <th className="p-3.5">PagerDuty / SRE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2E8DC] text-[#403830]">
                <tr>
                  <td className="p-3.5 font-bold">Dependency-Aware Ordering</td>
                  <td className="p-3.5 text-[#0047AB] font-bold">Yes (Kahn DAG)</td>
                  <td className="p-3.5">No (Naive Pod restart)</td>
                  <td className="p-3.5">Manual Runbooks</td>
                  <td className="p-3.5">No (Alerts only)</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Blast Radius Calculation</td>
                  <td className="p-3.5 text-[#0047AB] font-bold">Automatic & Instant</td>
                  <td className="p-3.5">None</td>
                  <td className="p-3.5">Manual CloudWatch</td>
                  <td className="p-3.5">Manual Triage</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Cryptographic Human Gates</td>
                  <td className="p-3.5 text-[#0047AB] font-bold">EIP-712 Multi-Sig</td>
                  <td className="p-3.5">RBAC (Static)</td>
                  <td className="p-3.5">IAM Approval Button</td>
                  <td className="p-3.5">SMS / Webhook ACK</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Tamper-Proof Audit Vault</td>
                  <td className="p-3.5 text-[#0047AB] font-bold">MST Blockchain Merkle</td>
                  <td className="p-3.5">Ephemeral Logs</td>
                  <td className="p-3.5">CloudTrail (Centralized)</td>
                  <td className="p-3.5">SaaS Database</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Conclusion & Verdict */}
        <section className="space-y-3 p-6 rounded-2xl bg-white border border-[#E5D7C5] shadow-xs">
          <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A] tracking-tight">
            4. Conclusion & Patentability Assessment Verdict
          </h2>
          <p className="text-sm sm:text-base text-[#4A3E34] leading-relaxed">
            The prior-art analysis establishes that while graph analysis and automated runbooks have been examined independently in academic settings, Horizon’s unified integration of:
          </p>
          <ul className="space-y-1.5 text-xs sm:text-sm font-medium text-[#403830] pl-5 list-disc">
            <li>Sub-second reverse-depth blast radius computation;</li>
            <li>Cycle-safe bottom-up topological Kahn recovery orchestration;</li>
            <li>Cryptographic EIP-712 human-in-the-loop approval thresholds; and</li>
            <li>Immutable decentralized ledger anchoring</li>
          </ul>
          <p className="text-sm sm:text-base text-[#4A3E34] leading-relaxed pt-1 font-semibold text-[#0047AB]">
            constitutes a non-obvious, technologically distinct, and commercially patentable system for enterprise resilience.
          </p>
        </section>
      </motion.div>

      {/* Footer Navigation CTA */}
      <motion.div variants={itemVariants} className="pt-6 border-t border-[#EADCC9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/policies"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0047AB] hover:underline"
        >
          <span>Review Horizon Privacy, Security & Compliance Policies &rarr;</span>
        </Link>

        <a
          href="/research.pdf"
          download="research.pdf"
          className="skeuo-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Original PDF (384 KB)</span>
        </a>
      </motion.div>
    </motion.div>
  );
};

export default PatentsPage;
