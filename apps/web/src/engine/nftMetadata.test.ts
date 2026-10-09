import { describe, it, expect, beforeEach } from 'bun:test';
import {
  NFT_PLANS_RECORD,
  NFT_PLANS_LIST,
  CANONICAL_NFT_IMAGE_URL,
  COBALT_BLUE_THEME_HEX,
  COBALT_BLUE_BG_HEX,
  buildNFTMetadata,
  AutoLoggingRateLimiter,
} from './nftMetadata';

describe('NFT Subscription Plans & AutoLogging Rate Limits Suite', () => {
  it('validates 4 distinct NFT subscription tiers with rate limits 5, 10, 15, 20', () => {
    expect(NFT_PLANS_LIST).toHaveLength(4);

    expect(NFT_PLANS_RECORD.explorer.autologgingRateLimit).toBe(5);
    expect(NFT_PLANS_RECORD.guardian.autologgingRateLimit).toBe(10);
    expect(NFT_PLANS_RECORD.sentinel.autologgingRateLimit).toBe(15);
    expect(NFT_PLANS_RECORD.enterprise.autologgingRateLimit).toBe(20);
  });

  it('validates canonical image URL is https://horizon-aiops.vercel.app/horizon.jpg', () => {
    expect(CANONICAL_NFT_IMAGE_URL).toBe('https://horizon-aiops.vercel.app/horizon.jpg');
    NFT_PLANS_LIST.forEach((plan) => {
      expect(plan.imageUrl).toBe('https://horizon-aiops.vercel.app/horizon.jpg');
    });
  });

  it('validates Cobalt Blue theme color configuration for metadata and styling', () => {
    expect(COBALT_BLUE_THEME_HEX).toBe('#0047AB');
    expect(COBALT_BLUE_BG_HEX).toBe('0047AB');
    NFT_PLANS_LIST.forEach((plan) => {
      expect(plan.themeHex).toBe('#0047AB');
      expect(plan.backgroundColor).toBe('0047AB');
    });
  });

  it('validates buildNFTMetadata produces full ERC-721 / OpenSea compliant metadata structure', () => {
    const explorerMeta = buildNFTMetadata('explorer');
    expect(explorerMeta.name).toContain('Explorer');
    expect(explorerMeta.image).toBe('https://horizon-aiops.vercel.app/horizon.jpg');
    expect(explorerMeta.theme_color).toBe('#0047AB');
    expect(explorerMeta.background_color).toBe('0047AB');
    expect(explorerMeta.external_url).toBe('https://horizon-aiops.vercel.app/subscription');

    const rateAttr = explorerMeta.attributes.find((a) => a.trait_type === 'AutoLogging Rate Limit');
    expect(rateAttr).toBeDefined();
    expect(rateAttr?.value).toBe(5);
    expect(rateAttr?.max_value).toBe(20);

    const themeAttr = explorerMeta.attributes.find((a) => a.trait_type === 'Theme Hex');
    expect(themeAttr?.value).toBe('#0047AB');

    // Test Guardian (10), Sentinel (15), Enterprise (20)
    const guardianMeta = buildNFTMetadata('guardian');
    expect(guardianMeta.attributes.find((a) => a.trait_type === 'AutoLogging Rate Limit')?.value).toBe(10);

    const sentinelMeta = buildNFTMetadata('sentinel');
    expect(sentinelMeta.attributes.find((a) => a.trait_type === 'AutoLogging Rate Limit')?.value).toBe(15);

    const enterpriseMeta = buildNFTMetadata('enterprise');
    expect(enterpriseMeta.attributes.find((a) => a.trait_type === 'AutoLogging Rate Limit')?.value).toBe(20);
  });

  describe('AutoLoggingRateLimiter Sliding-Window Enforcement', () => {
    let limiter: AutoLoggingRateLimiter;

    beforeEach(() => {
      limiter = new AutoLoggingRateLimiter();
    });

    it('enforces Explorer tier limit of exactly 5 logs per minute', () => {
      expect(limiter.getRateLimit('explorer')).toBe(5);

      // First 5 logs should succeed
      for (let i = 0; i < 5; i++) {
        const res = limiter.recordLog('explorer');
        expect(res.allowed).toBe(true);
        expect(res.limit).toBe(5);
        expect(res.currentCount).toBe(i + 1);
      }

      // 6th log must be throttled
      const throttled = limiter.recordLog('explorer');
      expect(throttled.allowed).toBe(false);
      expect(throttled.remaining).toBe(0);
      expect(throttled.resetSeconds).toBeGreaterThan(0);
    });

    it('enforces Guardian tier limit of exactly 10 logs per minute', () => {
      expect(limiter.getRateLimit('guardian')).toBe(10);

      for (let i = 0; i < 10; i++) {
        expect(limiter.recordLog('guardian').allowed).toBe(true);
      }

      // 11th log throttled
      expect(limiter.recordLog('guardian').allowed).toBe(false);
    });

    it('enforces Sentinel tier limit of exactly 15 logs per minute', () => {
      expect(limiter.getRateLimit('sentinel')).toBe(15);

      for (let i = 0; i < 15; i++) {
        expect(limiter.recordLog('sentinel').allowed).toBe(true);
      }

      // 16th log throttled
      expect(limiter.recordLog('sentinel').allowed).toBe(false);
    });

    it('enforces Enterprise tier limit of exactly 20 logs per minute', () => {
      expect(limiter.getRateLimit('enterprise')).toBe(20);

      for (let i = 0; i < 20; i++) {
        expect(limiter.recordLog('enterprise').allowed).toBe(true);
      }

      // 21st log throttled
      expect(limiter.recordLog('enterprise').allowed).toBe(false);
    });

    it('resets correctly and provides accurate status', () => {
      limiter.recordLog('sentinel');
      limiter.recordLog('sentinel');

      const status = limiter.getStatus('sentinel');
      expect(status.limit).toBe(15);
      expect(status.used).toBe(2);
      expect(status.remaining).toBe(13);

      limiter.reset();
      expect(limiter.getStatus('sentinel').used).toBe(0);
      expect(limiter.getStatus('sentinel').remaining).toBe(15);
    });
  });
});
