import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useAuth } from '../../context/useAuth';
import { mstBlockchain, MST_CONFIG } from '../../engine/mstBlockchain';
import { clusterState } from '../../engine/state';
import {
  NFT_PLANS_LIST,
  CANONICAL_NFT_IMAGE_URL,
  COBALT_BLUE_THEME_HEX,
  buildNFTMetadata,
  type NFTPlanDefinition,
  type NFTTierKey,
} from '../../engine/nftMetadata';
import {
  Check,
  Gem,
  Wallet,
  CheckCircle2,
  ExternalLink,
  Loader2,
  AlertCircle,
  ShieldCheck,
  PlusCircle,
  Copy,
  Sparkles,
  Activity,
  FileCode,
  X,
  Eye,
} from 'lucide-react';

interface MintReceipt {
  txHash: string;
  tokenId: number;
  blockNumber: number;
  tier: string;
  autologgingRateLimit?: number;
  contractAddress: string;
  explorerUrl: string;
  tokenUrl: string;
  addedToWallet?: boolean;
}

export const SubscriptionPlans: React.FC = () => {
  const { wallet } = useAuth();
  const [mintingTier, setMintingTier] = useState<string | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<MintReceipt | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);
  const [userPass, setUserPass] = useState<Awaited<ReturnType<typeof mstBlockchain.getUserPass>>>(null);
  const [walletStatus, setWalletStatus] = useState<string | null>(null);
  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedMetadata, setCopiedMetadata] = useState(false);
  const [inspectedPlan, setInspectedPlan] = useState<NFTPlanDefinition | null>(null);

  const fetchUserPass = async () => {
    try {
      const pass = await mstBlockchain.getUserPass(wallet?.address || MST_CONFIG.operatorAddress);
      setUserPass(pass);
    } catch {
      // Graceful fallback
    }
  };

  useEffect(() => {
    fetchUserPass();
  }, [wallet?.address]);

  const plans = NFT_PLANS_LIST;

  const handleMint = async (tierKey: NFTTierKey) => {
    setMintError(null);
    setActiveReceipt(null);
    setWalletStatus(null);
    setMintingTier(tierKey);

    try {
      const receipt = await mstBlockchain.mintSubscriptionNFT(tierKey, wallet?.address);
      setActiveReceipt(receipt);
      await fetchUserPass();

      clusterState.addAuditLog({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        actor: wallet?.address ? `WALLET:${wallet.address.slice(0, 6)}...` : 'BRIDGEKEY_COMMANDER',
        action: `NFT Plan Minted: ${receipt.tier.toUpperCase()}`,
        details: `Minted token #${receipt.tokenId} on MST Testnet (Chain 91562037). Tx: ${receipt.txHash}`,
        severity: 'info',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMintError(msg || 'Transaction declined or failed on MST testnet.');
    } finally {
      setMintingTier(null);
    }
  };

  const handleAddNFTToWallet = async (tokenId: number) => {
    try {
      const res = await mstBlockchain.watchAssetInWallet(tokenId);
      if (res) {
        setWalletStatus(`NFT #${tokenId} added to your connected BridgeKey wallet!`);
      } else {
        setWalletStatus(`Added to BridgeKey tracking. Verify on MSTScan.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setWalletStatus(`BridgeKey add: ${msg}`);
    }
  };

  const copyContract = () => {
    navigator.clipboard.writeText(MST_CONFIG.subscriptionContractAddress);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Existing User Active Pass Banner */}
      {userPass && userPass.hasPass && (
        <div className="p-5 rounded-[12px] bg-[#141416] border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.5)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[8px] bg-[#6366F1]/15 border border-[#6366F1]/25 text-[#6366F1] flex items-center justify-center shrink-0">
                <Gem className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#ECECF0]">
                    Active Subscription Pass: {userPass.tier}
                  </h3>
                  <span className="hz-badge hz-badge-healthy">ACTIVE CLEARANCE</span>
                </div>
                <p className="text-xs text-[#A0A0AB] mt-0.5 font-mono">
                  Owner: {wallet?.address || MST_CONFIG.operatorAddress}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyContract}
                className="hz-btn-ghost text-xs py-1 px-2.5"
                title="Copy contract address"
              >
                <Copy className="w-3 h-3 text-[#A0A0AB]" />
                <span>{copiedContract ? 'Copied!' : 'Copy Contract'}</span>
              </button>
              <a
                href={`${MST_CONFIG.explorerUrl}/token/${MST_CONFIG.subscriptionContractAddress}?a=${userPass.tokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hz-btn-ghost text-xs py-1 px-2.5"
              >
                <span>View on MSTScan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="p-2.5 rounded-[8px] bg-[#101012] border border-white/[0.05] space-y-0.5">
              <span className="text-[#63636E] text-[10px] uppercase">Token ID</span>
              <div className="text-xs font-semibold text-[#ECECF0]">#ZXPASS-{userPass.tokenId}</div>
            </div>
            <div className="p-2.5 rounded-[8px] bg-[#101012] border border-white/[0.05] space-y-0.5">
              <span className="text-[#63636E] text-[10px] uppercase">AutoLogging Rate Limit</span>
              <div className="text-xs font-semibold text-[#34D399]">{userPass.autologgingRateLimit || 5} events/min</div>
            </div>
            <div className="p-2.5 rounded-[8px] bg-[#101012] border border-white/[0.05] space-y-0.5">
              <span className="text-[#63636E] text-[10px] uppercase">Contract Address</span>
              <div className="text-xs font-mono text-[#7C7FF7] truncate">{MST_CONFIG.subscriptionContractAddress}</div>
            </div>
            <div className="p-2.5 rounded-[8px] bg-[#101012] border border-white/[0.05] space-y-0.5">
              <span className="text-[#63636E] text-[10px] uppercase">Network</span>
              <div className="text-xs font-semibold text-[#ECECF0]">MST Testnet (91562037)</div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmed Real Transaction Modal / Card */}
      {activeReceipt && (
        <div className="p-5 rounded-[12px] bg-[#34D399]/10 border border-[#34D399]/25 shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#34D399]/20">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-[8px] overflow-hidden border border-[#34D399]/30 shrink-0">
                <img
                  src={CANONICAL_NFT_IMAGE_URL}
                  alt="Minted Horizon NFT"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#ECECF0]">
                  Subscription NFT Successfully Minted On-Chain!
                </h3>
                <p className="text-xs text-[#A0A0AB]">
                  buy(uint8) confirmed on Zentrix Pass contract on MST Testnet.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAddNFTToWallet(activeReceipt.tokenId)}
                className="text-xs gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add NFT #{activeReceipt.tokenId} to BridgeKey</span>
              </Button>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.06] text-[#34D399] border border-[#34D399]/25">
                Block #{activeReceipt.blockNumber}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="p-2.5 rounded-[8px] bg-[#101012] border border-white/[0.06] space-y-0.5">
              <span className="text-[#63636E] text-[10px]">Token ID</span>
              <div className="text-xs font-semibold text-[#ECECF0]">#ZXPASS-{activeReceipt.tokenId}</div>
            </div>
            <div className="p-2.5 rounded-[8px] bg-[#101012] border border-white/[0.06] space-y-0.5">
              <span className="text-[#63636E] text-[10px]">Active Tier</span>
              <div className="text-xs font-semibold text-[#34D399]">{activeReceipt.tier}</div>
            </div>
            <div className="p-2.5 rounded-[8px] bg-[#101012] border border-white/[0.06] space-y-0.5">
              <span className="text-[#63636E] text-[10px]">AutoLogging Rate Limit</span>
              <div className="text-xs font-semibold text-[#22D3EE]">{activeReceipt.autologgingRateLimit || 5} events/min</div>
            </div>
            <div className="p-2.5 rounded-[8px] bg-[#101012] border border-white/[0.06] space-y-0.5">
              <span className="text-[#63636E] text-[10px]">Network</span>
              <div className="text-xs font-semibold text-[#ECECF0]">MST Testnet (91562037)</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
            <div className="font-mono text-[#A0A0AB] truncate max-w-md">
              TxHash: <span className="font-semibold text-[#ECECF0]">{activeReceipt.txHash}</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={activeReceipt.tokenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#34D399] hover:underline"
              >
                <span>View NFT #{activeReceipt.tokenId} on MSTScan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={activeReceipt.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#7C7FF7] hover:underline"
              >
                <span>View Transaction</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {plans.map((plan) => {
          const isMintingThis = mintingTier === plan.id;
          const isPopular = plan.isPopular;

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="h-full flex flex-col"
            >
              <Card
                className={`p-5 flex flex-col justify-between relative h-full transition-all duration-200 ${
                  isPopular
                    ? 'bg-[#1A1829] border-[#6366F1]/40 shadow-[0_4px_24px_rgba(99,102,241,0.2)]'
                    : 'bg-[#141416] border-white/[0.08]'
                }`}
              >
                {isPopular && (
                  <div className="absolute top-3.5 right-3.5">
                    <span className="px-2 py-0.5 rounded-[4px] text-[9px] font-mono font-semibold bg-[#6366F1] text-white">
                      RECOMMENDED
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-[#ECECF0]">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-[#A0A0AB] mt-0.5 min-h-[32px]">
                    {plan.tagline}
                  </p>

                  <div className="my-3.5 pb-3.5 border-b border-white/[0.06]">
                    <div className="text-2xl font-bold font-mono text-[#ECECF0]">
                      {plan.price}
                    </div>
                    <div className="text-xs font-mono font-medium text-[#7C7FF7] mt-0.5">
                      {plan.mstPrice}
                    </div>
                  </div>

                  {/* AutoLogging Rate Limit Badge */}
                  <div className="flex items-center justify-between p-2 rounded-[6px] bg-white/[0.04] border border-white/[0.06] font-mono text-xs mb-3.5">
                    <span className="flex items-center gap-1.5 text-[#A0A0AB] text-[11px]">
                      <Activity className="w-3 h-3 text-[#22D3EE]" />
                      Rate Limit:
                    </span>
                    <span className="font-semibold text-[#ECECF0] text-[11px]">
                      {plan.autologgingRateLimit} events/min
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <span className="text-[10px] font-mono uppercase text-[#63636E] tracking-wider block">
                      Plan Capabilities
                    </span>
                    <ul className="space-y-2">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#A0A0AB]">
                          <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#34D399]" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* View Complete NFT Metadata Button */}
                  <button
                    type="button"
                    onClick={() => setInspectedPlan(plan)}
                    className="w-full py-1.5 px-2.5 rounded-[6px] text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 mb-3 bg-white/[0.03] hover:bg-white/[0.07] text-[#A0A0AB] hover:text-[#ECECF0] border border-white/[0.06]"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Inspect Metadata Schema</span>
                  </button>
                </div>

                <div>
                  <Button
                    variant={isPopular ? 'primary' : 'secondary'}
                    onClick={() => handleMint(plan.id)}
                    disabled={!!mintingTier}
                    className="w-full py-2 text-xs font-medium gap-1.5"
                  >
                    {isMintingThis ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Transacting on MST...</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Mint Subscription NFT</span>
                      </>
                    )}
                  </Button>
                  <p className="text-[10px] text-center mt-1.5 font-mono text-[#63636E]">
                    Chain ID 91562037 &bull; Non-Custodial
                  </p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ERC-721 Metadata Inspector Modal */}
      <AnimatePresence>
        {inspectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[14px] bg-[#141416] border border-white/[0.12] shadow-2xl p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-9 rounded-[7px] overflow-hidden border border-white/[0.14] shrink-0">
                    <img src={CANONICAL_NFT_IMAGE_URL} alt="NFT Thumbnail" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#ECECF0]">
                      ERC-721 Metadata: {inspectedPlan.name}
                    </h3>
                    <p className="text-xs text-[#A0A0AB]">
                      Standard JSON format with trait metadata (<code className="text-[#7C7FF7]">#0047AB</code>)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectedPlan(null)}
                  className="p-1 rounded-[5px] text-[#A0A0AB] hover:text-[#ECECF0] hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Trait Summary Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2 rounded-[6px] bg-[#101012] border border-white/[0.06]">
                  <span className="text-[10px] text-[#63636E] uppercase block">Rate Limit</span>
                  <span className="text-xs font-semibold text-[#34D399]">{inspectedPlan.autologgingRateLimit} / min</span>
                </div>
                <div className="p-2 rounded-[6px] bg-[#101012] border border-white/[0.06]">
                  <span className="text-[10px] text-[#63636E] uppercase block">Theme Color</span>
                  <span className="text-xs font-semibold text-[#7C7FF7]">#0047AB</span>
                </div>
                <div className="p-2 rounded-[6px] bg-[#101012] border border-white/[0.06]">
                  <span className="text-[10px] text-[#63636E] uppercase block">Tier Level</span>
                  <span className="text-xs font-semibold text-[#ECECF0]">{inspectedPlan.tierNumber} / 4</span>
                </div>
                <div className="p-2 rounded-[6px] bg-[#101012] border border-white/[0.06]">
                  <span className="text-[10px] text-[#63636E] uppercase block">Standard</span>
                  <span className="text-xs font-semibold text-[#22D3EE]">ERC-721</span>
                </div>
              </div>

              {/* Complete JSON Metadata Viewer */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-[#A0A0AB]">
                  <span className="font-medium flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Raw ERC-721 Metadata Payload</span>
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(buildNFTMetadata(inspectedPlan.id), null, 2));
                      setCopiedMetadata(true);
                      setTimeout(() => setCopiedMetadata(false), 2000);
                    }}
                    className="flex items-center gap-1 text-[11px] text-[#7C7FF7] hover:underline cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedMetadata ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-[8px] bg-[#101012] border border-white/[0.06] text-[11px] font-mono text-[#ECECF0] overflow-x-auto max-h-56">
                  {JSON.stringify(buildNFTMetadata(inspectedPlan.id), null, 2)}
                </pre>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
