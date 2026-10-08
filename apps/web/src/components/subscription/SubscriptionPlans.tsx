import React, { useState } from 'react';
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
} from 'lucide-react';
import { Link } from 'react-router';

interface MintReceipt {
  txHash: string;
  tokenId: number;
  blockNumber: number;
  tier: string;
  contractAddress: string;
  explorerUrl: string;
}

export const SubscriptionPlans: React.FC = () => {
  const { wallet } = useAuth();
  const [mintingTier, setMintingTier] = useState<string | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<MintReceipt | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);

  const plans = [
    {
      id: 'explorer' as const,
      name: 'Explorer Tier',
      tagline: 'Entry-level resilience for single cluster environments',
      price: '0.01 MST',
      mstPrice: '0.01 MST / 30 Days',
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
      price: '0.05 MST',
      mstPrice: '0.05 MST / 30 Days',
      features: [
        'Up to 50 Monitored Microservices & Pods',
        'Dynamic Multi-Tier Blast Radius Calculation',
        'Automated Standby Failover & Cache Reheat',
        '7-Day On-Chain Merkle Audit Vault',
        'BridgeKey Cryptographic Authorization',
        'Sarvam AI Incident Copilot (sarvam-105b)',
      ],
      isPopular: false,
    },
    {
      id: 'sentinel' as const,
      name: 'Sentinel Tier',
      tagline: 'Autonomous orchestration with cryptographic commander gates',
      price: '0.10 MST',
      mstPrice: '0.10 MST / 30 Days',
      features: [
        'Unlimited Monitored Infrastructure Nodes',
        'Multi-Region Replica Failover Sequences',
        'Cryptographic Human Approval Gates via BridgeKey',
        '30-Day Immutable On-Chain Audit Vault',
        'Sub-4m Autonomous MTTR SLA Guarantee',
        'Priority SRE Emergency Escalation',
      ],
      isPopular: true,
    },
    {
      id: 'enterprise' as const,
      name: 'Enterprise Tier',
      tagline: 'Dedicated smart contracts, private subnets & bespoke SLAs',
      price: '0.50 MST',
      mstPrice: '0.50 MST / 30 Days',
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
    setMintingTier(tierKey);

    try {
      const receipt = await mstBlockchain.mintSubscriptionNFT(tierKey, wallet?.address);
      setActiveReceipt(receipt);

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
          <span className="text-blue-400 font-semibold">{MST_CONFIG.subscriptionContractAddress.slice(0, 10)}...{MST_CONFIG.subscriptionContractAddress.slice(-6)}</span>
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
            <span>HorizonSubscriptionNFT.sol • MST Blockchain Testnet</span>
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
                  HorizonSubscriptionNFT.sol confirmed your subscription on MST Testnet.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Block #{activeReceipt.blockNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[#6E7A94] text-[11px]">Token ID</span>
              <div className="text-sm font-bold text-[#FFF8F0]">#HZN-{activeReceipt.tokenId}</div>
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
            <a
              href={activeReceipt.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-blue-400 hover:text-blue-300"
            >
              <span>View on MST Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isMintingThis = mintingTier === plan.id;

          return (
            <Card
              key={plan.id}
              className={`p-6 flex flex-col justify-between relative transition-all duration-300 hover:border-blue-500/40 ${
                plan.isPopular
                  ? 'border-blue-500/40 bg-[#0E1524]/90 shadow-2xl shadow-blue-500/10'
                  : 'bg-[#0B0F19]/80 border-white/[0.08]'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-4 right-4">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500 text-white shadow-md shadow-blue-500/30">
                    POPULAR
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
          );
        })}
      </div>

      {/* Smart Contract Technical Information Footer */}
      <Card className="p-6 border-white/10 bg-black/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <h4 className="text-base font-bold text-[#FFF8F0]">
              On-Chain Subscription Mechanics
            </h4>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            ERC-721 Standard Verified
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#A3ADC2] leading-relaxed">
          The Horizon subscription engine queries <code className="text-blue-300 font-mono">isSubscriptionActive(address)</code> on the <code className="text-purple-300 font-mono">HorizonSubscriptionNFT.sol</code> contract deployed on MST Testnet. High-risk SRE commands verify your wallet's NFT token validity before allowing human approval signatures.
        </p>
      </Card>
    </div>
  );
};
