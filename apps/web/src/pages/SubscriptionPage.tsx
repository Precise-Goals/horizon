import React from 'react';
import { motion } from 'framer-motion';
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

export const SubscriptionPage: React.FC = () => {
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
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#94A3B8] hover:text-[#FFF8F0] transition-colors"
        >
          <span>&larr; Return to Homepage</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs font-mono text-purple-300 font-semibold">ZXPASS Contract Verified</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#FFF8F0]">
              Web3 Platform Subscriptions
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/25">
              <Gem className="w-3.5 h-3.5 text-purple-400" />
              ERC-721 TOKEN-GATED
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1.5 max-w-3xl leading-relaxed">
            Decentralized subscription passes minted as ERC-721 smart contract tokens on MST Blockchain Testnet (Chain ID 91562037) with BridgeKey wallet verification.
          </p>
        </div>

        <a
          href={`${MST_CONFIG.explorerUrl}/token/${MST_CONFIG.subscriptionContractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs sm:text-sm font-bold text-purple-300 hover:bg-purple-500/25 transition-all shadow-lg shadow-purple-500/10 cursor-pointer w-fit"
        >
          <span>ZXPASS Contract</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Bento Metric Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8E9DB8]">
            <span>Smart Contract</span>
            <Gem className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-purple-300">ZXPASS</div>
          <div className="text-[11px] text-[#8E9DB8] font-mono">Zentrix Pass ERC-721</div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8E9DB8]">
            <span>Blockchain Network</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#FFF8F0]">MST Testnet</div>
          <div className="text-[11px] text-[#8E9DB8] font-mono">Chain ID: {MST_CONFIG.chainId}</div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8E9DB8]">
            <span>Verification Standard</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">EIP-747</div>
          <div className="text-[11px] text-emerald-400 font-mono">BridgeKey Asset Watching</div>
        </Card>

        <Card className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8E9DB8]">
            <span>Operator Requirement</span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">&ge; 0.05 MST</div>
          <div className="text-[11px] text-[#8E9DB8] font-mono">Testnet Gas Collateral</div>
        </Card>
      </div>

      {/* Subscription Plans & Minting Engine */}
      <SubscriptionPlans />
    </motion.div>
  );
};
