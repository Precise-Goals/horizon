import React from 'react';
import { motion, type BezierDefinition } from 'framer-motion';
import { Link } from 'react-router';
import { SubscriptionPlans } from '../components/subscription/SubscriptionPlans';
import { Card } from '../components/common/Card';
import { Globe } from '../components/common/Globe';
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
    transition: { staggerChildren: 0.06, duration: 0.25 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE },
  },
};

export const SubscriptionPage: React.FC = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 font-sans w-full text-[#0A0A0A] relative"
    >
      {/* Return Navigation & Badge */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors bg-white px-3.5 py-1.5 rounded-full border border-[#E5E5E5] shadow-xs"
        >
          <span>&larr; Return to Overview</span>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5E5E5] text-[11px] font-mono text-[#0A0A0A] shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse" />
          <span className="font-semibold">ZXPASS Contract Verified</span>
        </div>
      </motion.div>

      {/* Signature Two-Line Header */}
      <motion.div variants={itemVariants} className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-[10px] font-mono font-medium text-[#0A0A0A] border border-[#E5E5E5]">
            <Gem className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>ERC-721 TOKEN-GATED RESILIENCE TIERS</span>
          </div>

          <h1 className="tracking-tight leading-[1.02]">
            <span className="block font-['Instrument_Serif',serif] font-normal text-[#A3A3A3] text-4xl sm:text-5xl lg:text-6xl">
              Subscription Plans,
            </span>
            <span className="block font-['Instrument_Serif',serif] italic font-normal text-[#0A0A0A] text-4xl sm:text-5xl lg:text-6xl">
              token-gated resilience tiers.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-[#6B6B6B] max-w-xl leading-relaxed">
            Decentralized subscription passes minted as ERC-721 smart contract tokens on MST Blockchain Testnet (Chain ID {MST_CONFIG.chainId}) with BridgeKey wallet verification.
          </p>
        </div>

        <a
          href={`${MST_CONFIG.explorerUrl}/token/${MST_CONFIG.subscriptionContractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="z-10 h-11 px-6 rounded-full bg-[#0A0A0A] text-white hover:bg-neutral-800 text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm w-fit"
        >
          <span>ZXPASS Contract</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Faint Stipple Globe Side-Peek Motif */}
        <div className="absolute right-0 top-0 pointer-events-none opacity-20 hidden lg:block -mr-16 -mt-8">
          <Globe size="200px" crop="side-peek" />
        </div>
      </motion.div>

      {/* Metric Summary Strip */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-1 bg-white border border-[#E5E5E5] rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-xs text-[#6B6B6B] font-mono uppercase tracking-wider">
            <span>Smart Contract</span>
            <Gem className="w-4 h-4 text-[#0A0A0A]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0A0A0A]">ZXPASS</div>
          <div className="text-[11px] text-[#6B6B6B] font-mono">ERC-721 &bull; MST Chain {MST_CONFIG.chainId}</div>
        </Card>

        <Card className="p-5 space-y-1 bg-white border border-[#E5E5E5] rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-xs text-[#6B6B6B] font-mono uppercase tracking-wider">
            <span>AutoLogging Rate Limits</span>
            <ShieldCheck className="w-4 h-4 text-[#2DD4BF]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0A0A0A]">5 &rarr; 20 /min</div>
          <div className="text-[11px] text-[#2DD4BF] font-mono">Tiered: 5, 10, 15, 20 logs/min</div>
        </Card>

        <Card className="p-5 space-y-1 bg-white border border-[#E5E5E5] rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-xs text-[#6B6B6B] font-mono uppercase tracking-wider">
            <span>Contract Trait Color</span>
            <span className="w-3.5 h-3.5 rounded-full bg-[#0047AB] border border-black/10" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0A0A0A]">#0047AB</div>
          <div className="text-[11px] text-[#6B6B6B] font-mono">ERC-721 Metadata Trait</div>
        </Card>

        <Card className="p-5 space-y-1 bg-white border border-[#E5E5E5] rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-xs text-[#6B6B6B] font-mono uppercase tracking-wider">
            <span>NFT Canonical Image</span>
            <Wallet className="w-4 h-4 text-[#0A0A0A]" />
          </div>
          <div className="text-base font-bold font-mono text-[#0A0A0A] truncate">
            horizon.jpg
          </div>
          <div className="text-[11px] text-[#6B6B6B] font-mono">IPFS / Cloudflare Pin</div>
        </Card>
      </motion.div>

      {/* Subscription Tier Cards */}
      <motion.div variants={itemVariants}>
        <SubscriptionPlans />
      </motion.div>
    </motion.div>
  );
};
export default SubscriptionPage;
