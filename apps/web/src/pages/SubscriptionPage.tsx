import React from 'react';
import { motion, type BezierDefinition } from 'framer-motion';
import { Link } from 'react-router';
import { SubscriptionPlans } from '../components/subscription/SubscriptionPlans';
import { Card } from '../components/common/Card';
import { MST_CONFIG } from '../engine/mstBlockchain';
import {
  Gem,
  ShieldCheck,
  Wallet,
  ExternalLink,
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

export const SubscriptionPage: React.FC = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 sm:space-y-8 font-sans w-full"
    >
      {/* Return Navigation & Badge */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#6E6258] hover:text-[#1A1A1A] transition-colors"
        >
          <span>&larr; Return to Home</span>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#0047AB] animate-pulse" />
          <span className="text-xs font-mono text-[#0047AB] font-bold">ZXPASS Contract Verified</span>
        </div>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1A1A1A]">
              Web3 Platform Subscriptions
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#0047AB]/10 text-[#0047AB] border border-[#0047AB]/20 shadow-xs">
              <Gem className="w-3.5 h-3.5 text-[#0047AB]" />
              ERC-721 TOKEN-GATED
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5A4E44] mt-1.5 max-w-3xl leading-relaxed font-medium">
            Decentralized subscription passes minted as ERC-721 smart contract tokens on MST Blockchain Testnet (Chain ID 91562037) with BridgeKey wallet verification.
          </p>
        </div>

        <a
          href={`${MST_CONFIG.explorerUrl}/token/${MST_CONFIG.subscriptionContractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="skeuo-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer w-fit"
        >
          <span>ZXPASS Contract</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </motion.div>

      {/* Bento Metric Summary Strip */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 space-y-1 skeuo-card border-[#E5D7C5]">
          <div className="flex items-center justify-between text-xs text-[#6E6258] font-medium">
            <span>Smart Contract</span>
            <Gem className="w-4 h-4 text-[#0047AB]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#0047AB]">ZXPASS</div>
          <div className="text-[11px] text-[#6E6258] font-mono font-medium">ERC-721 on MST Testnet ({MST_CONFIG.chainId})</div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-1 skeuo-card border-[#E5D7C5]">
          <div className="flex items-center justify-between text-xs text-[#6E6258] font-medium">
            <span>AutoLogging Rate Limits</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700">5 → 20 /min</div>
          <div className="text-[11px] text-emerald-800 font-mono font-bold">Tiered: 5, 10, 15, 20 events/min</div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-1 skeuo-card border-[#E5D7C5]">
          <div className="flex items-center justify-between text-xs text-[#6E6258] font-medium">
            <span>Design Theme Color</span>
            <span className="w-3.5 h-3.5 rounded-full bg-[#0047AB] border border-white shadow-xs" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#0047AB]">#0047AB</div>
          <div className="text-[11px] text-[#6E6258] font-mono font-medium">Cobalt Blue &bull; Cream #FFF8F0</div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-1 skeuo-card border-[#E5D7C5]">
          <div className="flex items-center justify-between text-xs text-[#6E6258] font-medium">
            <span>NFT Canonical Image</span>
            <Wallet className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-base sm:text-lg font-black font-mono text-[#1A1A1A] truncate">
            horizon.jpg
          </div>
          <a
            href="https://horizon-aiops.vercel.app/horizon.jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[#0047AB] font-mono font-bold hover:underline flex items-center gap-1"
          >
            <span>View Image Asset</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </Card>
      </motion.div>

      {/* Subscription Plans & Minting Engine */}
      <motion.div variants={itemVariants}>
        <SubscriptionPlans />
      </motion.div>
    </motion.div>
  );
};
