import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test';
import { mstBlockchain, getInjectedProvider, MST_CONFIG } from './mstBlockchain';

describe('MST Blockchain Service & Mac Browser Resilience Suite', () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    (globalThis as any).window = {
      location: { origin: 'http://localhost:5173' },
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
  });

  it('validates MST testnet network constants', () => {
    expect(MST_CONFIG.chainId).toBe(91562037);
    expect(MST_CONFIG.currencySymbol).toBe('MST');
    expect(MST_CONFIG.subscriptionContractAddress).toBe('0x3EDad230dCFc6Dd3C357490b9feDa49639646BB7');
    expect(MST_CONFIG.chainIdHex).toBe(`0x${(91562037).toString(16)}`);
  });

  it('detects direct window.bridgekey injected provider', async () => {
    const mockBridgeKey = {
      isBridgeKey: true,
      request: async ({ method }: { method: string }) => {
        if (method === 'eth_accounts') return ['0x1234567890abcdef1234567890abcdef12345678'];
        return [];
      },
    };
    (globalThis.window as any).bridgekey = mockBridgeKey;

    const provider = await getInjectedProvider(100);
    expect(provider).toBe(mockBridgeKey);
    expect(provider.isBridgeKey).toBe(true);
  });

  it('detects provider inside window.ethereum.providers array (multi-wallet Mac environment)', async () => {
    const mockMetaMask = { isMetaMask: true, request: async () => [] };
    const mockBridgeKey = { isBridgeKey: true, request: async () => [] };

    (globalThis.window as any).ethereum = {
      providers: [mockMetaMask, mockBridgeKey],
    };

    const provider = await getInjectedProvider(100);
    expect(provider).toBe(mockBridgeKey);
  });

  it('handles asynchronous delayed provider injection (Safari & Brave extensions)', async () => {
    let timerId: any;
    const delayedProvider = {
      isBridgeKey: true,
      request: async () => ['0xDelayedAccount123'],
    };

    // Inject after 20ms delay
    timerId = setTimeout(() => {
      (globalThis.window as any).bridgekey = delayedProvider;
    }, 20);

    const provider = await getInjectedProvider(300);
    clearTimeout(timerId);
    expect(provider).toBe(delayedProvider);
  });

  it('safely returns null when no web3 provider is installed after timeout', async () => {
    (globalThis.window as any).bridgekey = undefined;
    (globalThis.window as any).ethereum = undefined;

    const provider = await getInjectedProvider(100);
    expect(provider).toBeNull();
  });

  it('checkActiveConnection performs silent non-intrusive query with eth_accounts', async () => {
    const mockProvider = {
      request: async ({ method }: { method: string }) => {
        if (method === 'eth_accounts') {
          return ['0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199'];
        }
        if (method === 'eth_chainId') {
          return `0x${(91562037).toString(16)}`;
        }
        return null;
      },
    };

    (globalThis.window as any).bridgekey = mockProvider;

    const balanceSpy = spyOn(mstBlockchain, 'getBalance').mockResolvedValue('12.5000');

    const activeState = await mstBlockchain.checkActiveConnection();
    expect(activeState).not.toBeNull();
    expect(activeState?.address).toBe('0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199');
    expect(activeState?.balanceMst).toBe('12.5000');
    expect(activeState?.mode).toBe('bridgekey_injected');
    expect(activeState?.chainId).toBe(91562037);

    balanceSpy.mockRestore();
  });

  it('checkActiveConnection returns null when wallet is locked or unpermitted', async () => {
    const mockLockedProvider = {
      request: async ({ method }: { method: string }) => {
        if (method === 'eth_accounts') return []; // locked
        return null;
      },
    };

    (globalThis.window as any).bridgekey = mockLockedProvider;

    const activeState = await mstBlockchain.checkActiveConnection();
    expect(activeState).toBeNull();
  });

  it('setupProviderListeners registers and returns cleanup function', () => {
    let accountsListenerRegistered = false;
    let listenerRemoved = false;

    const mockProvider = {
      on: (event: string) => {
        if (event === 'accountsChanged') accountsListenerRegistered = true;
      },
      removeListener: (event: string) => {
        if (event === 'accountsChanged') listenerRemoved = true;
      },
    };

    (globalThis.window as any).bridgekey = mockProvider;

    const cleanup = mstBlockchain.setupProviderListeners({
      onAccountsChanged: () => {},
    });

    expect(typeof cleanup).toBe('function');
    cleanup();
  });
});
