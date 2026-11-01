import React from 'react';
import { motion, type BezierDefinition } from 'framer-motion';
import { Link } from 'react-router';
import { SubscriptionPlans } from '../components/subscription/SubscriptionPlans';
import { MST_CONFIG } from '../engine/mstBlockchain';
import { Gem, ExternalLink } from 'lucide-react';

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
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-montserrat tracking-tight text-[#1A1A1A]">
              Web3 Platform Subscriptions
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#0047AB]/10 text-[#0047AB] border border-[#0047AB]/20 shadow-xs">
              <Gem className="w-3.5 h-3.5 text-[#0047AB]" />
              ERC-721 Token-Gated
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

      {/* Subscription Plans & Minting Engine */}
      <motion.div variants={itemVariants}>
        <SubscriptionPlans />
      </motion.div>
    </motion.div>
  );
};
