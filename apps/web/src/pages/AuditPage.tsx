import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { AuditTable } from '../components/audit/AuditTable';
import { Card } from '../components/common/Card';
import { MST_CONFIG } from '../engine/mstBlockchain';
import {
  ShieldCheck,
  FileCheck,
  Lock,
  ExternalLink,
} from 'lucide-react';

export const AuditPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 sm:space-y-7 font-sans"
    >
      {/* Return Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#6E6258] hover:text-[#1A1A1A] transition-colors"
        >
          <span>&larr; Return to Homepage</span>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#0047AB] animate-pulse" />
          <span className="text-xs font-mono text-[#0047AB] font-bold">MST Merkle Vault Anchored</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1A1A1A]">
              Cryptographic Audit Vault
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#0047AB]/10 text-[#0047AB] border border-[#0047AB]/20 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0047AB]" />
              IMMUTABLE MERKLE VAULT
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5A4E44] mt-1.5 max-w-3xl leading-relaxed font-medium">
            Real-time incident event log anchored on the MST Blockchain with cryptographic hash verification and tamper-evident timestamps.
          </p>
        </div>

        <a
          href={MST_CONFIG.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="skeuo-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer w-fit"
        >
          <span>MSTScan Explorer</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Bento Metric Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 space-y-1 skeuo-card border-[#E5D7C5]">
          <div className="flex items-center justify-between text-xs text-[#6E6258] font-medium">
            <span>Ledger Integrity</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700">100%</div>
          <div className="text-[11px] text-[#6E6258] font-mono font-medium">Tamper-Evident History</div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-1 skeuo-card border-[#E5D7C5]">
          <div className="flex items-center justify-between text-xs text-[#6E6258] font-medium">
            <span>Blockchain Network</span>
            <Lock className="w-4 h-4 text-[#0047AB]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#0047AB]">MST Testnet</div>
          <div className="text-[11px] text-[#6E6258] font-mono font-medium">Chain ID: {MST_CONFIG.chainId}</div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-1 skeuo-card border-[#E5D7C5]">
          <div className="flex items-center justify-between text-xs text-[#6E6258] font-medium">
            <span>Hash Mechanism</span>
            <FileCheck className="w-4 h-4 text-[#0047AB]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#1A1A1A]">SHA-256</div>
          <div className="text-[11px] text-[#0047AB] font-mono font-bold">Merkle Root Chained</div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-1 skeuo-card border-[#E5D7C5]">
          <div className="flex items-center justify-between text-xs text-[#6E6258] font-medium">
            <span>Signer Protocol</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-700">BridgeKey</div>
          <div className="text-[11px] text-[#6E6258] font-mono font-medium">Cryptographic Multi-Sig</div>
        </Card>
      </div>

      {/* Audit Log Table Component */}
      <AuditTable />
    </motion.div>
  );
};
