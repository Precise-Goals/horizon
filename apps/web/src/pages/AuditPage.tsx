import React, { useState } from 'react';
import { motion, type BezierDefinition } from 'framer-motion';
import { Link } from 'react-router';
import { AuditTable } from '../components/audit/AuditTable';
import { Card } from '../components/common/Card';
import { MST_CONFIG } from '../engine/mstBlockchain';
import {
  ShieldCheck,
  FileCheck,
  Lock,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Cpu,
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

export const AuditPage: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 sm:space-y-8 font-sans w-full"
    >
      {/* Return Navigation & Ledger Pill */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#6E6258] hover:text-[#1A1A1A] transition-colors"
        >
          <span>&larr; Return to Home</span>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#0047AB] animate-pulse" />
          <span className="text-xs font-mono text-[#0047AB] font-bold">MST Merkle Vault Anchored</span>
        </div>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
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
      </motion.div>

      {/* Bento Metric Summary Strip */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <div className="text-[11px] text-[#6E6258] font-mono font-medium flex items-center justify-between">
            <span>Chain ID: {MST_CONFIG.chainId}</span>
            <a
              href={MST_CONFIG.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0047AB] hover:underline font-bold inline-flex items-center gap-0.5"
            >
              <span>MSTScan</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
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
      </motion.div>

      {/* MST Testnet Smart Contract & Explorer Endpoints Section */}
      <motion.div variants={itemVariants}>
        <Card className="p-5 sm:p-6 skeuo-card border-[#E5D7C5] bg-[#FFF8F0]/80">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#EADCC9]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0047AB]/10 border border-[#0047AB]/20 flex items-center justify-center text-[#0047AB] shrink-0">
                <Globe className="w-5 h-5 text-[#0047AB]" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-[#1A1A1A] tracking-tight">
                    MST Blockchain Testnet: Verified Contract Endpoints
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    CHAIN ID {MST_CONFIG.chainId}
                  </span>
                </div>
                <p className="text-xs text-[#5A4E44] font-medium mt-0.5">
                  Decentralized audit vault and subscription contracts hosted on the MST Testnet EVM runtime.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={MST_CONFIG.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="skeuo-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#0047AB]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open MSTScan</span>
              </a>
              <a
                href={MST_CONFIG.rpcUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="skeuo-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#5A4E44]"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>RPC Gateway</span>
              </a>
            </div>
          </div>

          {/* Contracts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {/* HorizonAuditVault Contract */}
            <div className="p-4 rounded-xl bg-white border border-[#E5D7C5] shadow-xs flex flex-col justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1A1A1A]">
                    <ShieldCheck className="w-4 h-4 text-[#0047AB]" />
                    HorizonAuditVault.sol
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-[#0047AB] border border-blue-200">
                    Merkle Audit Vault
                  </span>
                </div>
                <p className="text-[11px] text-[#6E6258] leading-relaxed">
                  Anchors cryptographic SHA-256 Merkle root hashes for automated incident resolutions and multi-sig failover approvals.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A7B6D] font-bold">
                  Contract Address
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF3EA] border border-[#E5D7C5]">
                  <code className="text-[11px] font-mono font-bold text-[#0047AB] truncate select-all">
                    {MST_CONFIG.auditVaultContractAddress}
                  </code>
                  <button
                    onClick={() => handleCopy(MST_CONFIG.auditVaultContractAddress, 'audit-vault')}
                    className="p-1 text-[#6E6258] hover:text-[#1A1A1A] transition-colors ml-2 cursor-pointer"
                    title="Copy Address"
                  >
                    {copiedKey === 'audit-vault' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <a
                    href={`${MST_CONFIG.explorerUrl}/address/${MST_CONFIG.auditVaultContractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono font-bold text-[#0047AB] hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Address on MSTScan</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-[10px] font-mono text-[#8A7B6D]">Solidity v0.8.20</span>
                </div>
              </div>
            </div>

            {/* HorizonSubscriptionNFT Contract */}
            <div className="p-4 rounded-xl bg-white border border-[#E5D7C5] shadow-xs flex flex-col justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1A1A1A]">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    HorizonSubscriptionNFT.sol
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    ERC-721 (ZXPASS)
                  </span>
                </div>
                <p className="text-[11px] text-[#6E6258] leading-relaxed">
                  Mint and verify operator NFT subscription tiers (Free, Explorer, Guardian) with on-chain rate limit metadata.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A7B6D] font-bold">
                  Contract Address
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF3EA] border border-[#E5D7C5]">
                  <code className="text-[11px] font-mono font-bold text-[#0047AB] truncate select-all">
                    {MST_CONFIG.subscriptionContractAddress}
                  </code>
                  <button
                    onClick={() => handleCopy(MST_CONFIG.subscriptionContractAddress, 'sub-nft')}
                    className="p-1 text-[#6E6258] hover:text-[#1A1A1A] transition-colors ml-2 cursor-pointer"
                    title="Copy Address"
                  >
                    {copiedKey === 'sub-nft' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <a
                    href={`${MST_CONFIG.explorerUrl}/token/${MST_CONFIG.subscriptionContractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono font-bold text-[#0047AB] hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Token on MSTScan</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-[10px] font-mono text-[#8A7B6D]">ERC-721 Enumerable</span>
                </div>
              </div>
            </div>
          </div>

          {/* Network Parameter Strip */}
          <div className="mt-4 pt-3 border-t border-[#EADCC9] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-4 text-[#5A4E44]">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="font-bold text-[#1A1A1A]">RPC URL:</span>
                <a
                  href={MST_CONFIG.rpcUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0047AB] hover:underline"
                >
                  {MST_CONFIG.rpcUrl}
                </a>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="font-bold text-[#1A1A1A]">Explorer URL:</span>
                <a
                  href={MST_CONFIG.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0047AB] hover:underline"
                >
                  {MST_CONFIG.explorerUrl}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#6E6258] font-medium">Authorized Wallets:</span>
              <div className="flex items-center gap-1">
                {MST_CONFIG.authorizedAddresses.slice(0, 3).map((addr, idx) => (
                  <a
                    key={addr}
                    href={`${MST_CONFIG.explorerUrl}/address/${addr}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-0.5 rounded bg-white border border-[#E5D7C5] font-mono text-[10px] text-[#0047AB] hover:bg-blue-50 transition-colors"
                    title={`Commander Wallet ${idx + 1}: ${addr}`}
                  >
                    {addr.slice(0, 6)}...{addr.slice(-4)}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Audit Log Table Component */}
      <motion.div variants={itemVariants}>
        <AuditTable />
      </motion.div>
    </motion.div>
  );
};
