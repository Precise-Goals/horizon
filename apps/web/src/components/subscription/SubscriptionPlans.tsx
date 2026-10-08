import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useAuth } from '../../context/useAuth';
import { mstBlockchain, MST_CONFIG } from '../../engine/mstBlockchain';
import { clusterState } from '../../engine/state';
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
} from 'lucide-react';
import { Link } from 'react-router';

interface MintReceipt {
  txHash: string;
  tokenId: number;
  blockNumber: number;
  tier: string;
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

  const fetchUserPass = async () => {
    try {
      const pass = await mstBlockchain.getUserPass(wallet?.address || MST_CONFIG.operatorAddress);
      setUserPass(pass);
    } catch {
      // User pass fetch failure handled gracefully
    }
  };

  useEffect(() => {
    fetchUserPass();
  }, [wallet?.address]);

  const plans = [
    {
      id: 'explorer' as const,
      name: 'Explorer Tier',
      tagline: 'Entry-level resilience for single cluster environments',
      price: '5.0 MST',
      mstPrice: '5.0 MST / 30 Days (On-Chain)',
      features: [
        'Up to 10 Monitored Services & Nodes',
        'Topological DAG Blast Radius Mapping',
        'Standard Restart Playbooks (PostgreSQL & Redis)',
        '24h In-Memory Telemetry History',
        'MST Blockchain Audit Anchoring',
      ],
      isPopular: false,
    },
    {
      id: 'guardian' as const,
      name: 'Guardian Tier',
      tagline: 'Production self-healing for multi-tier microservices',
      price: '15.0 MST',
      mstPrice: '15.0 MST / 30 Days (On-Chain)',
      features: [
        'Up to 50 Monitored Microservices & Pods',
        'Dynamic Multi-Tier Blast Radius Calculation',
        'Automated Standby Failover & Cache Reheat',
        '7-Day On-Chain Merkle Audit Vault',
        'BridgeKey Cryptographic Authorization',
        'Sarvam AI Incident Copilot (sarvam-105b)',
      ],
      isPopular: true,
    },
    {
      id: 'sentinel' as const,
      name: 'Sentinel Tier',
      tagline: 'Autonomous orchestration with cryptographic commander gates',
      price: '15.0 MST',
      mstPrice: '15.0 MST / 30 Days (On-Chain)',
      features: [
        'Unlimited Monitored Infrastructure Nodes',
        'Multi-Region Replica Failover Sequences',
        'Cryptographic Human Approval Gates via BridgeKey',
        '30-Day Immutable On-Chain Audit Vault',
        'Sub-4m Autonomous MTTR SLA Guarantee',
        'Priority SRE Emergency Escalation',
      ],
      isPopular: false,
    },
    {
      id: 'enterprise' as const,
      name: 'Enterprise Tier',
      tagline: 'Dedicated smart contracts, private subnets & bespoke SLAs',
      price: 'Bespoke',
      mstPrice: 'Custom Contract Deployment',
      features: [
        'Custom Smart Contract Deployment on MST Testnet',
        'Air-Gapped Private VPC & Kubernetes Integration',
        'Custom Playbook DSL Engineering',
        'Permanent On-Chain Archival Vault',
        'Dedicated SRE Command Center SLA & Support',
      ],
      isPopular: false,
    },
  ];

  const handleMint = async (tierKey: 'explorer' | 'guardian' | 'sentinel' | 'enterprise') => {
    setMintError(null);
    setActiveReceipt(null);
    setWalletStatus(null);
    setMintingTier(tierKey);

    try {
      const receipt = await mstBlockchain.mintSubscriptionNFT(tierKey, wallet?.address);
      setActiveReceipt(receipt);

      // Refresh pass status from on-chain RPC
      await fetchUserPass();

      // Record to cluster audit trail
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

  const handleAddNFTToWallet = async (tokenId: number) => {
    setWalletStatus('Requesting BridgeKey to register NFT (wallet_watchAsset)...');
    try {
      const success = await mstBlockchain.watchAssetInWallet(tokenId);
      if (success) {
        setWalletStatus(`NFT #${tokenId} successfully added to BridgeKey Wallet!`);
      } else {
        setWalletStatus(
          `BridgeKey prompt sent. If not added automatically, please import manually in BridgeKey -> NFTs -> Import NFT with Token ID #${tokenId}.`
        );
      }
    } catch (err: any) {
      setWalletStatus(`BridgeKey interaction: ${err.message || 'Please open BridgeKey wallet to approve.'}`);
    }
  };

  const handleCopyContract = () => {
    navigator.clipboard.writeText(MST_CONFIG.subscriptionContractAddress);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Return to Homepage Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#A3ADC2] hover:text-[#FFF8F0] transition-colors"
        >
          <span>&larr; Return to Homepage</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono text-[#8E9DB8]">
          <span>Contract:</span>
          <a
            href={`${MST_CONFIG.explorerUrl}/token/${MST_CONFIG.subscriptionContractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>{MST_CONFIG.subscriptionContractAddress.slice(0, 8)}...{MST_CONFIG.subscriptionContractAddress.slice(-6)}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Visual Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
        <img
          src="/vault.jpg"
          alt="Cryptographic Vault"
          className="w-full h-48 md:h-64 object-cover object-center brightness-75"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/60 to-transparent flex flex-col justify-end p-6 md:p-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono w-fit mb-3">
            <Gem className="w-3.5 h-3.5" />
            <span>Zentrix Pass (ZXPASS) • MST Blockchain Testnet</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#FFF8F0] tracking-tight">
            Web3 Token-Gated Subscription Plans
          </h1>
          <p className="text-sm sm:text-base text-[#A3ADC2] mt-2 max-w-2xl leading-relaxed">
            Mint non-fungible subscription tokens on the MST Blockchain (Chain ID 91562037). Smart contracts autonomously verify authorization tiers without centralized payment gateways.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {mintError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">Transaction Execution Failed</h4>
            <p className="text-xs text-red-300/90">{mintError}</p>
          </div>
        </div>
      )}

      {/* Wallet Watch Status Alert */}
      {walletStatus && (
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-200 flex items-start gap-3 animate-in fade-in duration-200">
          <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-semibold block text-sm text-[#FFF8F0]">BridgeKey NFT Synchronization</span>
            <p className="text-[#A3ADC2]">{walletStatus}</p>
          </div>
        </div>
      )}

      {/* Existing Detected Pass Card */}
      {userPass && userPass.hasPass && (
        <div className="p-6 rounded-3xl bg-blue-500/[0.08] border border-blue-500/30 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#FFF8F0] flex items-center gap-2">
                  <span>Active On-Chain Subscription: {userPass.tierName}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                </h3>
                <p className="text-xs text-[#A3ADC2]">
                  On-chain NFT Pass verified on MST Blockchain Testnet.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAddNFTToWallet(userPass.tokenId)}
                className="text-xs gap-1.5 font-semibold rounded-xl"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add NFT #{userPass.tokenId} to BridgeKey</span>
              </Button>
              <a
                href={userPass.tokenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>View #{userPass.tokenId} on MSTScan</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[#6E7A94] text-[11px]">Token ID</span>
              <div className="text-sm font-bold text-[#FFF8F0]">#ZXPASS-{userPass.tokenId}</div>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[#6E7A94] text-[11px]">Contract Address</span>
              <div className="text-xs font-bold text-blue-300 truncate">{MST_CONFIG.subscriptionContractAddress}</div>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[#6E7A94] text-[11px]">Network</span>
              <div className="text-sm font-bold text-blue-400">MST Testnet (91562037)</div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmed Real Transaction Modal / Card */}
      {activeReceipt && (
        <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#FFF8F0]">
                  Subscription NFT Successfully Minted On-Chain!
                </h3>
                <p className="text-xs text-[#A3ADC2]">
                  buy(uint8) confirmed on Zentrix Pass contract (0x3EDad2...) on MST Testnet.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAddNFTToWallet(activeReceipt.tokenId)}
                className="text-xs gap-1.5 font-bold rounded-xl"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add NFT #{activeReceipt.tokenId} to BridgeKey</span>
              </Button>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Block #{activeReceipt.blockNumber}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[#6E7A94] text-[11px]">Token ID</span>
              <div className="text-sm font-bold text-[#FFF8F0]">#ZXPASS-{activeReceipt.tokenId}</div>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[#6E7A94] text-[11px]">Active Tier</span>
              <div className="text-sm font-bold text-emerald-400">{activeReceipt.tier}</div>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[#6E7A94] text-[11px]">Network</span>
              <div className="text-sm font-bold text-blue-400">MST Testnet (91562037)</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
            <div className="font-mono text-[#A3ADC2] truncate max-w-md">
              TxHash: <span className="text-[#FFF8F0]">{activeReceipt.txHash}</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={activeReceipt.tokenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-emerald-400 hover:text-emerald-300"
              >
                <span>View NFT #{activeReceipt.tokenId} on MSTScan</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={activeReceipt.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-blue-400 hover:text-blue-300"
              >
                <span>View Transaction</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isMintingThis = mintingTier === plan.id;

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="h-full flex flex-col"
            >
              <Card
                className={`p-6 flex flex-col justify-between relative h-full transition-all duration-300 hover:border-blue-500/40 ${
                  plan.isPopular
                    ? 'border-blue-500/40 bg-[#0E1524]/90 shadow-2xl shadow-blue-500/10'
                    : 'bg-[#0B0F19]/80 border-white/[0.08]'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500 text-white shadow-md shadow-blue-500/30">
                      RECOMMENDED
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#FFF8F0] tracking-tight">
                    {plan.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A3ADC2] mt-1 min-h-[36px]">
                    {plan.tagline}
                  </p>

                  <div className="my-5 pb-5 border-b border-white/[0.08]">
                    <div className="text-3xl sm:text-4xl font-black font-mono text-[#FFF8F0]">
                      {plan.price}
                    </div>
                    <div className="text-xs font-mono text-blue-400 mt-1">
                      {plan.mstPrice}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <span className="text-xs font-semibold text-[#8E9DB8] uppercase tracking-wider block">
                      Plan Capabilities
                    </span>
                    <ul className="space-y-2.5">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#E2D7CB]">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <Button
                    variant={plan.isPopular ? 'primary' : 'secondary'}
                    onClick={() => handleMint(plan.id)}
                    disabled={!!mintingTier}
                    className="w-full py-3 text-sm font-semibold gap-2 rounded-xl cursor-pointer"
                  >
                    {isMintingThis ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transacting on MST...</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4" />
                        <span>Mint Subscription NFT</span>
                      </>
                    )}
                  </Button>
                  <p className="text-[10px] text-center text-[#6E7A94] mt-2 font-mono">
                    Chain ID 91562037 • Non-Custodial
                  </p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* BridgeKey NFT Display & Import Guide */}
      <Card className="p-6 border-white/10 bg-black/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <h4 className="text-base font-bold text-[#FFF8F0]">
              Why BridgeKey Wallet requires NFT Registration (EIP-747)
            </h4>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            ERC-721 Contract Verified
          </span>
        </div>

        <div className="text-xs sm:text-sm text-[#A3ADC2] space-y-3 leading-relaxed">
          <p>
            When minting an NFT on custom testnets such as MST Testnet, Web3 wallets (including BridgeKey) do not query every unindexed ERC-721 contract automatically. To show the token in your wallet's NFT collectibles tab, the wallet must be informed via <code className="text-blue-300 font-mono">wallet_watchAsset</code> or manual token import.
          </p>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
            <div className="text-xs font-semibold text-[#FFF8F0]">Manual Import Credentials for BridgeKey Wallet:</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-black/50 border border-white/5">
                <span className="text-[#8E9DB8]">Contract:</span>
                <span className="text-blue-300 truncate max-w-[150px]">{MST_CONFIG.subscriptionContractAddress}</span>
                <button
                  onClick={handleCopyContract}
                  className="text-xs text-blue-400 hover:text-blue-300 ml-1 p-1"
                  title="Copy contract address"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-black/50 border border-white/5">
                <span className="text-[#8E9DB8]">Token ID:</span>
                <span className="text-emerald-400 font-bold">1 (or your minted ID)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-black/50 border border-white/5">
                <span className="text-[#8E9DB8]">Explorer:</span>
                <a
                  href={`${MST_CONFIG.explorerUrl}/token/${MST_CONFIG.subscriptionContractAddress}/instance/1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>MSTScan Token #1</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            {copiedContract && (
              <span className="text-emerald-400 text-xs font-mono block">Contract address copied to clipboard!</span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
