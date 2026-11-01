import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { AuditPage } from './AuditPage';
import { AuditTable } from '../components/audit/AuditTable';
import { MST_CONFIG } from '../engine/mstBlockchain';
import { clusterState } from '../engine/state';

describe('Audit Vault & MST Testnet Explorer Integration Suite', () => {
  beforeEach(() => {
    clusterState.resetToDefaultTopology();
  });

  afterEach(() => {
    clusterState.resetToDefaultTopology();
  });

  it('exports AuditPage and AuditTable as valid React functional components', () => {
    expect(AuditPage).toBeDefined();
    expect(typeof AuditPage).toBe('function');
    expect(AuditTable).toBeDefined();
    expect(typeof AuditTable).toBe('function');
  });

  it('verifies MST Testnet configuration constants and network identifiers', () => {
    expect(MST_CONFIG.chainId).toBe(91562037);
    expect(MST_CONFIG.chainIdHex).toBe('0x5752035');
    expect(MST_CONFIG.chainName).toBe('MST Blockchain Testnet');
    expect(MST_CONFIG.currencySymbol).toBe('MST');
    expect(MST_CONFIG.explorerUrl.startsWith('https://')).toBe(true);
    expect(MST_CONFIG.rpcUrl.startsWith('https://')).toBe(true);
  });

  it('validates HorizonAuditVault smart contract address and explorer URL structure', () => {
    const vaultAddress = MST_CONFIG.auditVaultContractAddress;
    expect(vaultAddress).toBeDefined();
    expect(vaultAddress.startsWith('0x')).toBe(true);
    expect(vaultAddress.length).toBe(42); // 0x + 40 hex characters

    const vaultExplorerUrl = `${MST_CONFIG.explorerUrl}/address/${vaultAddress}`;
    expect(vaultExplorerUrl).toContain(MST_CONFIG.explorerUrl);
    expect(vaultExplorerUrl).toContain('/address/');
    expect(vaultExplorerUrl).toContain(vaultAddress);
  });

  it('validates HorizonSubscriptionNFT (ZXPASS) contract address and explorer token URL structure', () => {
    const nftAddress = MST_CONFIG.subscriptionContractAddress;
    expect(nftAddress).toBeDefined();
    expect(nftAddress.startsWith('0x')).toBe(true);
    expect(nftAddress.length).toBe(42);

    const nftExplorerUrl = `${MST_CONFIG.explorerUrl}/token/${nftAddress}`;
    expect(nftExplorerUrl).toContain(MST_CONFIG.explorerUrl);
    expect(nftExplorerUrl).toContain('/token/');
    expect(nftExplorerUrl).toContain(nftAddress);
  });

  it('validates authorized commander wallet explorer URL generation', () => {
    expect(MST_CONFIG.authorizedAddresses.length).toBeGreaterThan(0);

    MST_CONFIG.authorizedAddresses.forEach((wallet) => {
      expect(wallet.startsWith('0x')).toBe(true);
      expect(wallet.length).toBe(42);

      const walletUrl = `${MST_CONFIG.explorerUrl}/address/${wallet}`;
      expect(walletUrl).toBe(`https://testnet.mstscan.com/address/${wallet}`);
    });
  });
});
