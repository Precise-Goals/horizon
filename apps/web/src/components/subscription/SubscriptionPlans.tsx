import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/useAuth';
import { mstBlockchain, MST_CONFIG } from '../../engine/mstBlockchain';
import { clusterState } from '../../engine/state';
import {
  Box,
  Rocket,
  Shield,
  ShieldCheck,
  Zap,
  Server,
  Clock,
  FileText,
  Share2,
  BarChart3,
  Layers,
  Sparkles,
  ArrowRight,
  Loader2,
  Crown,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ActiveReceipt {
  txHash: string;
  tokenId: number;
  blockNumber: number;
  tier: string;
  autologgingRateLimit: number;
  explorerUrl: string;
  tokenUrl: string;
}

export const SubscriptionPlans: React.FC = () => {
  const { wallet } = useAuth();
  const [mintingTier, setMintingTier] = useState<string | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<ActiveReceipt | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);
  const [walletStatus, setWalletStatus] = useState<string | null>(null);
  const [userPass, setUserPass] = useState<{
    hasPass: boolean;
    tokenId?: number;
    tier?: string | number;
    tierName?: string;
    autologgingRateLimit?: number;
    tokenUrl?: string;
    explorerUrl?: string;
  } | null>(null);

  const fetchUserPass = async () => {
    // Check local storage for free tier
    const activeTier = typeof localStorage !== 'undefined' ? localStorage.getItem('horizon_active_tier') : null;
    if (activeTier === 'free') {
      setUserPass({
        hasPass: true,
        tokenId: 0,
        tier: 'FREE',
        tierName: 'Free Plan',
        autologgingRateLimit: 1,
      });
      return;
    }

    if (!wallet?.address) return;
    try {
      const pass = await mstBlockchain.getUserPass(wallet.address);
      if (pass && pass.hasPass) {
        setUserPass(pass);
      }
    } catch (err) {
      console.warn('[SubscriptionPlans] Failed to query user pass:', err);
    }
  };

  useEffect(() => {
    fetchUserPass();
  }, [wallet?.address]);

  // Activate Free Plan (UI Interface Tier)
  const handleActivateFree = () => {
    setMintError(null);
    setWalletStatus(null);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('horizon_active_tier', 'free');
      }
      setUserPass({
        hasPass: true,
        tokenId: 0,
        tier: 'FREE',
        tierName: 'Free Plan',
        autologgingRateLimit: 1,
      });
      setWalletStatus('Free Tier Activated! Full UI & Simulation capabilities enabled.');
      clusterState.addAuditLog({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        actor: wallet?.address || 'OPERATOR',
        action: 'Free Plan Activated (UI Mode)',
        details: 'Core capabilities and testnet simulation active',
        severity: 'info',
      });
    } catch (err: any) {
      setMintError(err.message || 'Failed to activate free tier.');
    }
  };

  // Mint On-Chain NFT (Explorer = Tier 1, Guardian = Tier 2)
  const handleMint = async (tierKey: 'explorer' | 'guardian') => {
    setMintingTier(tierKey);
    setMintError(null);
    setWalletStatus(null);

    try {
      const receipt = await mstBlockchain.mintSubscriptionNFT(tierKey, wallet?.address);
      setActiveReceipt(receipt);
      await fetchUserPass();

      // Automatically register and prompt NFT in BridgeKey / Web3 wallet
      setWalletStatus(`NFT #${receipt.tokenId} minted! Prompting BridgeKey to register NFT...`);
      setTimeout(async () => {
        try {
          const registered = await mstBlockchain.watchAssetInWallet(receipt.tokenId);
          if (registered) {
            setWalletStatus(`NFT #${receipt.tokenId} successfully added to your BridgeKey wallet!`);
          } else {
            setWalletStatus(`NFT #${receipt.tokenId} confirmed on MST Testnet (Block #${receipt.blockNumber}).`);
          }
        } catch (e) {
          console.warn('Auto watch asset:', e);
        }
      }, 500);

      clusterState.addAuditLog({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        actor: wallet?.address || 'OPERATOR',
        action: `NFT Subscription Minted: ${receipt.tier} (#${receipt.tokenId})`,
        details: `TxHash: ${receipt.txHash.slice(0, 18)}... Confirmed on MST Block #${receipt.blockNumber}`,
        severity: 'info',
      });
    } catch (err: any) {
      console.error('[NFT Mint Error]', err);
      setMintError(err.message || 'Failed to mint subscription NFT on MST Testnet.');
    } finally {
      setMintingTier(null);
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Wallet / Status Feedback */}
      <AnimatePresence>
        {walletStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-[#0047AB] flex items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#0047AB] shrink-0" />
              <span className="text-xs sm:text-sm font-semibold">{walletStatus}</span>
            </div>
            <button
              onClick={() => setWalletStatus(null)}
              className="text-xs text-[#0047AB] hover:underline font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {mintError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 flex items-start justify-between gap-3 shadow-xs"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold">Transaction Notice</h4>
                <p className="text-xs text-red-800 leading-relaxed">{mintError}</p>
              </div>
            </div>
            <button
              onClick={() => setMintError(null)}
              className="text-xs text-red-800 hover:underline font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Pass Banner (if verified) */}
      {userPass && userPass.hasPass && (
        <div className="p-5 rounded-2xl bg-[#FAF3EA] border border-[#E5D7C5] flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E0D0BE] flex items-center justify-center text-[#0047AB]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#1A1A1A]">
                  Active Subscription: {userPass.tierName || userPass.tier}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#6E6258] mt-0.5">
                Rate Limit: {userPass.autologgingRateLimit || 5} events/min &bull; {userPass.tokenId ? `Token #ZXPASS-${userPass.tokenId}` : 'UI Interface Mode'}
              </p>
            </div>
          </div>
          {userPass.tokenUrl && (
            <a
              href={userPass.tokenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5D7C5] text-xs font-bold text-[#0047AB] hover:text-[#003882] transition-colors"
            >
              <span>View #{userPass.tokenId} on MSTScan</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* 3-Card Pricing Grid matching ref.png */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 items-stretch max-w-6xl mx-auto">
        {/* ===================================================================
            CARD 1: FREE
            =================================================================== */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-white border border-[#E5E7EB] rounded-[2rem] p-7 sm:p-8 flex flex-col justify-between shadow-xs relative overflow-hidden h-full"
        >
          {/* Subtle ambient soft shape */}
          <div className="bg-slate-100/70 rounded-full w-56 h-56 absolute -bottom-14 -right-14 pointer-events-none blur-3xl z-0" />

          <div className="relative z-10">
            {/* Top Row: Icon & Badge */}
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#1A1A1A] shadow-xs">
                <Box className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]/80">
                Get Started
              </span>
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-2xl sm:text-3xl font-black font-montserrat text-[#1A1A1A] tracking-tight">
              Free
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-1.5 leading-relaxed min-h-[38px]">
              Explore core capabilities and experience MST.
            </p>

            {/* Price Block */}
            <div className="my-6 pb-6 border-b border-[#F1F5F9]">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-black font-montserrat text-[#1A1A1A] tracking-tight">
                  0
                </span>
                <span className="text-lg sm:text-xl font-bold font-montserrat text-[#1A1A1A]">
                  MST
                </span>
              </div>
              <div className="text-xs text-[#64748B] font-medium mt-1">
                / 30 Days (On-Chain)
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-xs sm:text-sm text-[#334155] font-medium">
                <Zap className="w-4 h-4 text-[#0047AB] shrink-0 stroke-[2]" />
                <span>1 event/min burst</span>
              </li>
              <li className="flex items-center gap-3 text-xs sm:text-sm text-[#334155] font-medium">
                <Server className="w-4 h-4 text-[#0047AB] shrink-0 stroke-[2]" />
                <span>Up to 3 services / nodes</span>
              </li>
              <li className="flex items-center gap-3 text-xs sm:text-sm text-[#334155] font-medium">
                <Clock className="w-4 h-4 text-[#0047AB] shrink-0 stroke-[2]" />
                <span>Basic telemetry history (7 days)</span>
              </li>
              <li className="flex items-center gap-3 text-xs sm:text-sm text-[#334155] font-medium">
                <FileText className="w-4 h-4 text-[#0047AB] shrink-0 stroke-[2]" />
                <span>Standard audit logs</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleActivateFree}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#F1F5F9] hover:bg-[#E2E8F0] active:scale-[0.99] text-[#1E293B] font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#E2E8F0] relative z-10"
          >
            <span>Mint Free Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* ===================================================================
            CARD 2: EXPLORER
            =================================================================== */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-white border border-[#DBEAFE] rounded-[2rem] p-7 sm:p-8 flex flex-col justify-between shadow-xs relative overflow-hidden h-full"
        >
          {/* Subtle blue ambient soft curve */}
          <div className="bg-blue-100/60 rounded-full w-56 h-56 absolute -bottom-14 -right-14 pointer-events-none blur-3xl z-0" />

          <div className="relative z-10">
            {/* Top Row: Icon & Badge */}
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#0047AB] shadow-xs">
                <Rocket className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#0047AB] border border-[#BFDBFE]/70">
                Popular for Teams
              </span>
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-2xl sm:text-3xl font-black font-montserrat text-[#1A1A1A] tracking-tight">
              Explorer
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-1.5 leading-relaxed min-h-[38px]">
              Entry-level resilience for single cluster environments.
            </p>

            {/* Price Block */}
            <div className="my-6 pb-6 border-b border-[#F1F5F9]">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-black font-montserrat text-[#1A1A1A] tracking-tight">
                  5.0
                </span>
                <span className="text-lg sm:text-xl font-bold font-montserrat text-[#1A1A1A]">
                  MST
                </span>
              </div>
              <div className="text-xs text-[#64748B] font-medium mt-1">
                / 30 Days (On-Chain)
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-xs sm:text-sm text-[#334155] font-medium">
                <Zap className="w-4 h-4 text-[#0047AB] shrink-0 stroke-[2]" />
                <span>5 events/min burst</span>
              </li>
              <li className="flex items-center gap-3 text-xs sm:text-sm text-[#334155] font-medium">
                <Server className="w-4 h-4 text-[#0047AB] shrink-0 stroke-[2]" />
                <span>Up to 10 monitored services / nodes</span>
              </li>
              <li className="flex items-center gap-3 text-xs sm:text-sm text-[#334155] font-medium">
                <Share2 className="w-4 h-4 text-[#0047AB] shrink-0 stroke-[2]" />
                <span>Topology DAG blast radius mapping</span>
              </li>
              <li className="flex items-center gap-3 text-xs sm:text-sm text-[#334155] font-medium">
                <BarChart3 className="w-4 h-4 text-[#0047AB] shrink-0 stroke-[2]" />
                <span>24h in-memory telemetry history</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={() => handleMint('explorer')}
            disabled={!!mintingTier}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#0047AB] hover:bg-[#003882] active:scale-[0.99] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#0047AB]/25 relative z-10 disabled:opacity-60"
          >
            {mintingTier === 'explorer' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Transacting on MST...</span>
              </>
            ) : (
              <>
                <span>Mint Explorer Plan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </motion.div>

        {/* ===================================================================
            CARD 3: GUARDIAN (Most Popular)
            =================================================================== */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-gradient-to-b from-[#003380] via-[#021f57] to-[#040f2b] border border-[#1E4E9E]/70 rounded-[2rem] p-7 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden h-full text-white"
        >
          {/* Glowing 3D Isometric Cubes Illustration matching ref.png */}
          <svg
            className="absolute top-10 right-1 sm:right-3 w-36 h-40 pointer-events-none opacity-90 select-none z-0"
            viewBox="0 0 160 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="glow-cube" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="top-face" x1="80" y1="20" x2="130" y2="50" gradientUnits="userSpaceOnUse">
                <stop stopColor="#93C5FD" stopOpacity="0.95" />
                <stop offset="1" stopColor="#3B82F6" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="left-face" x1="30" y1="50" x2="80" y2="105" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2563EB" stopOpacity="0.9" />
                <stop offset="1" stopColor="#1E3A8A" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="right-face" x1="80" y1="50" x2="130" y2="105" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60A5FA" stopOpacity="0.85" />
                <stop offset="1" stopColor="#1D4ED8" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="glow-base" x1="40" y1="80" x2="120" y2="160" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38BDF8" stopOpacity="0.7" />
                <stop offset="0.5" stopColor="#818CF8" stopOpacity="0.5" />
                <stop offset="1" stopColor="#1E1B4B" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Ambient Cyan/Violet Back Glow */}
            <circle cx="95" cy="85" r="55" fill="url(#glow-base)" filter="url(#glow-cube)" opacity="0.8" />

            {/* Lower Isometric Glass Sub-Cube */}
            <g transform="translate(15, 45)" opacity="0.7">
              <path d="M60 20 L95 40 L60 60 L25 40 Z" fill="#60A5FA" fillOpacity="0.35" stroke="#93C5FD" strokeWidth="1" strokeOpacity="0.6" />
              <path d="M25 40 L60 60 L60 100 L25 80 Z" fill="#1E40AF" fillOpacity="0.55" stroke="#60A5FA" strokeWidth="1" strokeOpacity="0.5" />
              <path d="M60 60 L95 40 L95 80 L60 100 Z" fill="#2563EB" fillOpacity="0.45" stroke="#93C5FD" strokeWidth="1" strokeOpacity="0.5" />
            </g>

            {/* Primary Isometric Glass Cube */}
            <g transform="translate(25, 5)">
              <path d="M60 15 L100 38 L60 61 L20 38 Z" fill="url(#top-face)" stroke="#BFDBFE" strokeWidth="1.2" />
              <path d="M20 38 L60 61 L60 107 L20 84 Z" fill="url(#left-face)" stroke="#93C5FD" strokeWidth="1" strokeOpacity="0.75" />
              <path d="M60 61 L100 38 L100 84 L60 107 Z" fill="url(#right-face)" stroke="#BFDBFE" strokeWidth="1" strokeOpacity="0.85" />
              <path d="M60 15 L60 61" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.9" />
              <circle cx="60" cy="61" r="2.5" fill="#FFFFFF" />
            </g>
          </svg>

          <div className="relative z-10">
            {/* Top Row: Icon & Most Popular Badge */}
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#0F2F6E]/90 border border-[#3B82F6]/40 flex items-center justify-center text-white shadow-xs">
                <Shield className="w-6 h-6 stroke-[1.8]" />
              </div>
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#FFF8F0] text-[#1A1A1A] shadow-md flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                Most Popular
              </span>
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-2xl sm:text-3xl font-black font-montserrat text-white tracking-tight">
              Guardian
            </h3>
            <p className="text-xs sm:text-sm text-[#BFDBFE] font-medium mt-1.5 leading-relaxed min-h-[38px] max-w-[240px]">
              Production-grade resilience for multi-tier microservices.
            </p>

            {/* Price Block */}
            <div className="my-6 pb-6 border-b border-white/15">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-black font-montserrat text-white tracking-tight">
                  15.0
                </span>
                <span className="text-lg sm:text-xl font-bold font-montserrat text-white">
                  MST
                </span>
              </div>
              <div className="text-xs text-[#93C5FD] font-medium mt-1">
                / 30 Days (On-Chain)
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-xs sm:text-sm text-white/95 font-medium">
                <Zap className="w-4 h-4 text-[#60A5FA] shrink-0 stroke-[2]" />
                <span>10 events/min burst</span>
              </li>
              <li className="flex items-center gap-3 text-xs sm:text-sm text-white/95 font-medium">
                <Server className="w-4 h-4 text-[#60A5FA] shrink-0 stroke-[2]" />
                <span>Up to 50 monitored microservices / pods</span>
              </li>
              <li className="flex items-center gap-3 text-xs sm:text-sm text-white/95 font-medium">
                <Layers className="w-4 h-4 text-[#60A5FA] shrink-0 stroke-[2]" />
                <span>Dynamic multi-tier blast radius calculation</span>
              </li>
              <li className="flex items-center gap-3 text-xs sm:text-sm text-white/95 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#60A5FA] shrink-0 stroke-[2]" />
                <span>7-day on-chain Merkle audit vault</span>
              </li>
              <li className="flex items-center gap-3 text-xs sm:text-sm text-white/95 font-medium">
                <Sparkles className="w-4 h-4 text-[#FDE047] shrink-0 stroke-[2]" />
                <span>AI incident copilot (Sarvam-105B)</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={() => handleMint('guardian')}
            disabled={!!mintingTier}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-[#F8FAFC] active:scale-[0.99] text-[#003882] font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-black/30 relative z-10 disabled:opacity-60"
          >
            {mintingTier === 'guardian' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#003882]" />
                <span>Transacting on MST...</span>
              </>
            ) : (
              <>
                <span>Mint Guardian Plan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </motion.div>
      </div>

      {/* Confirmed Real Transaction Modal / Card */}
      {activeReceipt && (
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-300 shadow-md space-y-4 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-950">
                  Subscription NFT Successfully Minted On-Chain!
                </h3>
                <p className="text-xs text-emerald-800 font-medium">
                  Confirmed on Zentrix Pass contract ({MST_CONFIG.subscriptionContractAddress.slice(0, 8)}...{MST_CONFIG.subscriptionContractAddress.slice(-6)}) on MST Testnet.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                Block #{activeReceipt.blockNumber}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-1">
              <span className="text-emerald-700 text-[11px] font-bold">Token ID</span>
              <div className="text-sm font-bold text-emerald-950">#ZXPASS-{activeReceipt.tokenId}</div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-1">
              <span className="text-emerald-700 text-[11px] font-bold">Active Tier</span>
              <div className="text-sm font-bold text-emerald-700">{activeReceipt.tier}</div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-1">
              <span className="text-emerald-700 text-[11px] font-bold">AutoLogging Rate Limit</span>
              <div className="text-sm font-bold text-[#0047AB]">{activeReceipt.autologgingRateLimit} events/min</div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-1">
              <span className="text-emerald-700 text-[11px] font-bold">Network</span>
              <div className="text-sm font-bold text-[#0047AB]">MST Testnet (91562037)</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
            <div className="font-mono text-emerald-800 truncate max-w-md font-medium">
              TxHash: <span className="font-bold text-emerald-950">{activeReceipt.txHash}</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={activeReceipt.tokenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-emerald-800 hover:text-emerald-950"
              >
                <span>View NFT #{activeReceipt.tokenId} on MSTScan</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={activeReceipt.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-[#0047AB] hover:underline"
              >
                <span>View Transaction</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
