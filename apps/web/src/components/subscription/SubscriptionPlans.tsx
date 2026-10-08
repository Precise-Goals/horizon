import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Check,
  Gem,
  Wallet,
  CheckCircle2,
} from 'lucide-react';

export const SubscriptionPlans: React.FC = () => {
  const [mintingTier, setMintingTier] = useState<string | null>(null);
  const [mintedSuccess, setMintedSuccess] = useState<string | null>(null);

  const plans = [
    {
      id: 'explorer',
      name: 'Explorer',
      tagline: 'Entry observability for single clusters',
      price: 'Free',
      ethPrice: '0 ETH',
      features: [
        'Up to 10 Infrastructure Nodes',
        'Topological Dependency Map',
        'Standard Restart Playbooks',
        '24h In-Memory Audit Trail',
        'Community Discord Support',
      ],
      isPopular: false,
    },
    {
      id: 'guardian',
      name: 'Guardian',
      tagline: 'Production resilience for growing microservices',
      price: '0.05 ETH',
      ethPrice: '0.05 ETH / month',
      features: [
        'Up to 50 Infrastructure Nodes',
        'Dynamic Blast Radius Calculation',
        'Automated Cache & DB Restart',
        '7-Day On-Chain Audit Anchoring',
        'Webhook Alerts (Slack/Discord)',
      ],
      isPopular: false,
    },
    {
      id: 'sentinel',
      name: 'Sentinel',
      tagline: 'Autonomous orchestration with commander gates',
      price: '0.15 ETH',
      ethPrice: '0.15 ETH / month',
      features: [
        'Unlimited Infrastructure Nodes',
        'Multi-Region Replica Failover',
        'Cryptographic Human Approval Gates',
        '30-Day On-Chain Audit Vault',
        'Real-time WebSocket Execution Stream',
        'Priority 24/7 SLA Support',
      ],
      isPopular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      tagline: 'Custom smart contracts and dedicated nodes',
      price: 'Custom',
      ethPrice: 'Bespoke Quote',
      features: [
        'Custom Smart Contract Deployment',
        'Air-Gapped Private VPC Clusters',
        'Custom Playbook DSL Engineering',
        'Permanent On-Chain Archival Vault',
        'Dedicated SRE Command Center SLA',
      ],
      isPopular: false,
    },
  ];

  const handleMint = (tierName: string) => {
    setMintingTier(tierName);
    setTimeout(() => {
      setMintingTier(null);
      setMintedSuccess(tierName);
      setTimeout(() => setMintedSuccess(null), 5000);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Visual Header Banner using the generated cryptographic vault asset */}
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
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-md">
              ERC-721 Smart Contract Verified
            </span>
            <span className="text-xs text-[#A3ADC2] hidden sm:inline">
              Sepolia Testnet &bull; Contract: 0x8F2...A49
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#FFF8F0] tracking-tight">
            Web3 Tokenized Platform Subscription
          </h2>
          <p className="text-xs md:text-sm text-[#E2D7CB] max-w-2xl mt-1">
            Mint an NFT access pass to unlock advanced autonomous recovery playbooks, encrypted on-chain audit log anchoring, and commander approval gates.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {mintedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between text-xs backdrop-blur-xl animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>
              Successfully minted <strong>Horizon {mintedSuccess} NFT Pass</strong>! Access privileges updated on-chain.
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400">Tx: 0x4a9...b71</span>
        </div>
      )}

      {/* Grid of Glass Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`p-6 flex flex-col justify-between relative transition-all duration-300 ${
              plan.isPopular
                ? 'bg-[#0E1528]/85 border-blue-500/40 shadow-xl shadow-blue-500/15 scale-[1.02]'
                : ''
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#1E6BFF] to-[#0047AB] text-[10px] font-bold text-[#FFF8F0] uppercase tracking-wider shadow-md shadow-blue-500/30 border border-blue-400/30">
                Recommended Tier
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-blue-400">
                  <Gem className="w-5 h-5" />
                </div>
                <Badge status={plan.isPopular ? 'recovering' : 'info'}>
                  {plan.price}
                </Badge>
              </div>

              <h3 className="text-lg font-bold text-[#FFF8F0] tracking-tight">
                {plan.name}
              </h3>
              <p className="text-xs text-[#A3ADC2] mt-1 mb-4 h-8">
                {plan.tagline}
              </p>

              <div className="pb-4 mb-4 border-b border-white/[0.08]">
                <div className="text-2xl font-bold font-mono text-[#FFF8F0]">
                  {plan.ethPrice}
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-2.5 mb-6 text-xs text-[#E2D7CB]">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              variant={plan.isPopular ? 'primary' : 'secondary'}
              size="sm"
              disabled={mintingTier === plan.name}
              onClick={() => handleMint(plan.name)}
              className="w-full text-xs font-semibold gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>
                {mintingTier === plan.name
                  ? 'Confirming Web3 Tx...'
                  : plan.id === 'explorer'
                  ? 'Claim Free Explorer Pass'
                  : `Mint ${plan.name} Pass`}
              </span>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
