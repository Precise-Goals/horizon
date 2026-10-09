/**
 * Horizon NFT Subscription Plans & Complete ERC-721 Metadata Specification
 * Includes AutoLogging Rate Limits (5, 10, 15, 20 events/min),
 * Cobalt Blue (#0047AB) theme configuration, and canonical image reference:
 * https://horizon-aiops.vercel.app/horizon.jpg
 */

export type NFTTierKey = 'explorer' | 'guardian' | 'sentinel' | 'enterprise';

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'number' | 'boost_percentage' | 'boost_number' | 'date';
  max_value?: number;
}

export interface NFTMetadataProperties {
  category: string;
  platform: string;
  rate_limits: {
    autologging_events_per_minute: number;
    burst_allowance: number;
    window_seconds: number;
  };
  branding: {
    theme_color: string;
    secondary_color: string;
    accent_style: string;
  };
}

export interface CompleteNFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  background_color: string; // 6-char hex for OpenSea (without '#')
  theme_color: string;      // Standard hex with '#'
  attributes: NFTAttribute[];
  properties: NFTMetadataProperties;
}

export interface NFTPlanDefinition {
  id: NFTTierKey;
  tierNumber: number;
  name: string;
  tagline: string;
  price: string;
  mstPrice: string;
  autologgingRateLimit: number; // 5, 10, 15, 20
  monitoredNodesCap: number | 'Unlimited';
  retentionWindow: string;
  themeColor: string;
  themeHex: string;
  backgroundColor: string;
  imageUrl: string;
  features: string[];
  isPopular: boolean;
}

export const CANONICAL_NFT_IMAGE_URL = 'https://horizon-aiops.vercel.app/horizon.jpg';
export const COBALT_BLUE_THEME_HEX = '#0047AB';
export const COBALT_BLUE_BG_HEX = '0047AB';
export const COBALT_BLUE_THEME_NAME = 'Cobalt Blue';

/**
 * 4 Canonical NFT Subscription Plans with AutoLogging Rate Limits (5, 10, 15, 20)
 */
export const NFT_PLANS_RECORD: Record<NFTTierKey, NFTPlanDefinition> = {
  explorer: {
    id: 'explorer',
    tierNumber: 1,
    name: 'Explorer Tier',
    tagline: 'Entry-level resilience for single cluster environments',
    price: '5.0 MST',
    mstPrice: '5.0 MST / 30 Days (On-Chain)',
    autologgingRateLimit: 5, // Rate limit 5
    monitoredNodesCap: 10,
    retentionWindow: '24h In-Memory History',
    themeColor: COBALT_BLUE_THEME_NAME,
    themeHex: COBALT_BLUE_THEME_HEX,
    backgroundColor: COBALT_BLUE_BG_HEX,
    imageUrl: CANONICAL_NFT_IMAGE_URL,
    features: [
      'AutoLogging Rate Limit: 5 events/min (Burst: 5)',
      'Up to 10 Monitored Services & Nodes',
      'Topological DAG Blast Radius Mapping O(V+E)',
      'Standard Restart Playbooks (PostgreSQL & Redis)',
      '24h In-Memory Telemetry History',
      'MST Blockchain Audit Anchoring',
    ],
    isPopular: false,
  },
  guardian: {
    id: 'guardian',
    tierNumber: 2,
    name: 'Guardian Tier',
    tagline: 'Production self-healing for multi-tier microservices',
    price: '15.0 MST',
    mstPrice: '15.0 MST / 30 Days (On-Chain)',
    autologgingRateLimit: 10, // Rate limit 10
    monitoredNodesCap: 50,
    retentionWindow: '7-Day Merkle Audit Vault',
    themeColor: COBALT_BLUE_THEME_NAME,
    themeHex: COBALT_BLUE_THEME_HEX,
    backgroundColor: COBALT_BLUE_BG_HEX,
    imageUrl: CANONICAL_NFT_IMAGE_URL,
    features: [
      'AutoLogging Rate Limit: 10 events/min (Burst: 10)',
      'Up to 50 Monitored Microservices & Pods',
      'Dynamic Multi-Tier Blast Radius Calculation',
      'Automated Standby Failover & Cache Reheat',
      '7-Day On-Chain Merkle Audit Vault',
      'BridgeKey Cryptographic Authorization',
      'Sarvam AI Incident Copilot (sarvam-105b)',
    ],
    isPopular: true,
  },
  sentinel: {
    id: 'sentinel',
    tierNumber: 3,
    name: 'Sentinel Tier',
    tagline: 'Autonomous orchestration with cryptographic commander gates',
    price: '25.0 MST',
    mstPrice: '25.0 MST / 30 Days (On-Chain)',
    autologgingRateLimit: 15, // Rate limit 15
    monitoredNodesCap: 250,
    retentionWindow: '30-Day Immutable Vault',
    themeColor: COBALT_BLUE_THEME_NAME,
    themeHex: COBALT_BLUE_THEME_HEX,
    backgroundColor: COBALT_BLUE_BG_HEX,
    imageUrl: CANONICAL_NFT_IMAGE_URL,
    features: [
      'AutoLogging Rate Limit: 15 events/min (Burst: 15)',
      'Up to 250 Monitored Infrastructure Nodes',
      'Multi-Region Replica Failover Sequences',
      'Cryptographic Human Approval Gates via BridgeKey (EIP-712)',
      '30-Day Immutable On-Chain Audit Vault',
      'Sub-4m Autonomous MTTR SLA Guarantee',
      'Priority SRE Emergency Escalation',
    ],
    isPopular: false,
  },
  enterprise: {
    id: 'enterprise',
    tierNumber: 4,
    name: 'Enterprise Tier',
    tagline: 'Dedicated smart contracts, private subnets & bespoke SLAs',
    price: '50.0 MST',
    mstPrice: 'Bespoke / Custom Contract Deployment',
    autologgingRateLimit: 20, // Rate limit 20
    monitoredNodesCap: 'Unlimited',
    retentionWindow: 'Permanent On-Chain Archival Vault',
    themeColor: COBALT_BLUE_THEME_NAME,
    themeHex: COBALT_BLUE_THEME_HEX,
    backgroundColor: COBALT_BLUE_BG_HEX,
    imageUrl: CANONICAL_NFT_IMAGE_URL,
    features: [
      'AutoLogging Rate Limit: 20 events/min (Enterprise Throughput)',
      'Unlimited Monitored Nodes & Clusters',
      'Custom Smart Contract Deployment on MST Testnet',
      'Air-Gapped Private VPC & Kubernetes Integration',
      'Custom Playbook DSL Engineering',
      'Permanent On-Chain Archival Vault',
      'Dedicated SRE Command Center SLA & 24/7 Support',
    ],
    isPopular: false,
  },
};

export const NFT_PLANS_LIST: NFTPlanDefinition[] = Object.values(NFT_PLANS_RECORD);

/**
 * Builds the complete ERC-721 / OpenSea compliant metadata JSON for a tier
 */
export function buildNFTMetadata(tierKeyOrNumber: NFTTierKey | number): CompleteNFTMetadata {
  let plan: NFTPlanDefinition;

  if (typeof tierKeyOrNumber === 'number') {
    plan =
      NFT_PLANS_LIST.find((p) => p.tierNumber === tierKeyOrNumber) ||
      NFT_PLANS_RECORD.explorer;
  } else {
    plan = NFT_PLANS_RECORD[tierKeyOrNumber] || NFT_PLANS_RECORD.explorer;
  }

  return {
    name: `Horizon ZXPASS — ${plan.name} #${plan.tierNumber}`,
    description: `Enterprise Autonomous Infrastructure Recovery Platform NFT Subscription Pass (${plan.name}). Token-gated SRE recovery orchestration on MST Blockchain Testnet (Chain ID 91562037). Features Kahn DAG recovery sequencing, EIP-712 cryptographic commander approval gates, tamper-evident Merkle audit vault anchoring, and dedicated AutoLogging rate limit of ${plan.autologgingRateLimit} events/min.`,
    image: CANONICAL_NFT_IMAGE_URL,
    external_url: 'https://horizon-aiops.vercel.app/subscription',
    background_color: COBALT_BLUE_BG_HEX,
    theme_color: COBALT_BLUE_THEME_HEX,
    attributes: [
      {
        trait_type: 'Subscription Tier',
        value: plan.name.replace(' Tier', ''),
      },
      {
        trait_type: 'Tier Level',
        value: plan.tierNumber,
        display_type: 'number',
      },
      {
        trait_type: 'AutoLogging Rate Limit',
        value: plan.autologgingRateLimit,
        display_type: 'number',
        max_value: 20,
      },
      {
        trait_type: 'Rate Limit Unit',
        value: 'events/min',
      },
      {
        trait_type: 'Monitored Systems Cap',
        value: typeof plan.monitoredNodesCap === 'number' ? plan.monitoredNodesCap : 999999,
        display_type: 'number',
      },
      {
        trait_type: 'Theme Color',
        value: COBALT_BLUE_THEME_NAME,
      },
      {
        trait_type: 'Theme Hex',
        value: COBALT_BLUE_THEME_HEX,
      },
      {
        trait_type: 'Design System',
        value: 'Neo-Brutalism Cobalt & Cream',
      },
      {
        trait_type: 'Network',
        value: 'MST Blockchain Testnet',
      },
      {
        trait_type: 'Chain ID',
        value: 91562037,
        display_type: 'number',
      },
      {
        trait_type: 'Standard',
        value: 'ERC-721 / EIP-747',
      },
      {
        trait_type: 'AI Engine',
        value: 'Sarvam AI SRE Copilot',
      },
      {
        trait_type: 'Governance Standard',
        value: 'EIP-712 Cryptographic Signature',
      },
      {
        trait_type: 'Audit Ledger',
        value: 'On-Chain Merkle Root Hash',
      },
    ],
    properties: {
      category: 'SaaS Subscription Pass',
      platform: 'Horizon Autonomous Recovery',
      rate_limits: {
        autologging_events_per_minute: plan.autologgingRateLimit,
        burst_allowance: plan.autologgingRateLimit,
        window_seconds: 60,
      },
      branding: {
        theme_color: COBALT_BLUE_THEME_HEX,
        secondary_color: '#FFF8F0',
        accent_style: 'Neo-Brutalist Cobalt & Cream',
      },
    },
  };
}

/**
 * High-performance sliding-window AutoLogging Rate Limiter
 * Enforces rate limits (5, 10, 15, 20) with respect to user's NFT tier
 */
export class AutoLoggingRateLimiter {
  private logTimestamps: number[] = [];
  private readonly windowMs: number = 60_000; // 60 seconds rolling window

  public getRateLimit(tierKeyOrNumber?: NFTTierKey | string | number | null): number {
    if (typeof tierKeyOrNumber === 'number') {
      if (tierKeyOrNumber === 1) return 5;
      if (tierKeyOrNumber === 2) return 10;
      if (tierKeyOrNumber === 3) return 15;
      if (tierKeyOrNumber === 4) return 20;
    }
    const normalized = String(tierKeyOrNumber || '').toLowerCase().trim();
    if (normalized === '1' || normalized === 'explorer') return 5;
    if (normalized === '2' || normalized === 'guardian') return 10;
    if (normalized === '3' || normalized === 'sentinel') return 15;
    if (normalized === '4' || normalized === 'enterprise') return 20;

    // Default baseline for unauthenticated or starter tier is 5
    return 5;
  }

  public canLog(tierKeyOrNumber?: NFTTierKey | string | number | null): boolean {
    const now = Date.now();
    this.cleanup(now);
    const limit = this.getRateLimit(tierKeyOrNumber);
    return this.logTimestamps.length < limit;
  }

  public recordLog(tierKeyOrNumber?: NFTTierKey | string | number | null): {
    allowed: boolean;
    currentCount: number;
    limit: number;
    remaining: number;
    resetSeconds: number;
    tier: string;
  } {
    const now = Date.now();
    this.cleanup(now);
    const limit = this.getRateLimit(tierKeyOrNumber);
    const tierName = this.resolveTierName(tierKeyOrNumber);

    if (this.logTimestamps.length >= limit) {
      const oldest = this.logTimestamps[0] || now;
      const resetSeconds = Math.max(1, Math.ceil((oldest + this.windowMs - now) / 1000));
      return {
        allowed: false,
        currentCount: this.logTimestamps.length,
        limit,
        remaining: 0,
        resetSeconds,
        tier: tierName,
      };
    }

    this.logTimestamps.push(now);
    const oldest = this.logTimestamps[0];
    const resetSeconds = Math.max(1, Math.ceil((oldest + this.windowMs - now) / 1000));
    return {
      allowed: true,
      currentCount: this.logTimestamps.length,
      limit,
      remaining: Math.max(0, limit - this.logTimestamps.length),
      resetSeconds,
      tier: tierName,
    };
  }

  public getStatus(tierKeyOrNumber?: NFTTierKey | string | number | null): {
    limit: number;
    used: number;
    remaining: number;
    resetSeconds: number;
    tier: string;
  } {
    const now = Date.now();
    this.cleanup(now);
    const limit = this.getRateLimit(tierKeyOrNumber);
    const remaining = Math.max(0, limit - this.logTimestamps.length);
    const oldest = this.logTimestamps[0] || now;
    const resetSeconds = this.logTimestamps.length > 0 ? Math.max(1, Math.ceil((oldest + this.windowMs - now) / 1000)) : 0;
    return {
      limit,
      used: this.logTimestamps.length,
      remaining,
      resetSeconds,
      tier: this.resolveTierName(tierKeyOrNumber),
    };
  }

  public reset(): void {
    this.logTimestamps = [];
  }

  private cleanup(now: number): void {
    const threshold = now - this.windowMs;
    this.logTimestamps = this.logTimestamps.filter((t) => t > threshold);
  }

  private resolveTierName(tierKeyOrNumber?: NFTTierKey | string | number | null): string {
    const normalized = String(tierKeyOrNumber || '').toLowerCase().trim();
    if (tierKeyOrNumber === 1 || normalized === '1' || normalized === 'explorer') return 'Explorer (5/min)';
    if (tierKeyOrNumber === 2 || normalized === '2' || normalized === 'guardian') return 'Guardian (10/min)';
    if (tierKeyOrNumber === 3 || normalized === '3' || normalized === 'sentinel') return 'Sentinel (15/min)';
    if (tierKeyOrNumber === 4 || normalized === '4' || normalized === 'enterprise') return 'Enterprise (20/min)';
    return 'Explorer Baseline (5/min)';
  }

}

export const autoLoggingRateLimiter = new AutoLoggingRateLimiter();
