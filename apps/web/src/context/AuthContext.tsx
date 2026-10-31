import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { firebaseAuth } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { mstBlockchain, type WalletState } from '../engine/mstBlockchain';

export type OnboardingStep = 'FIREBASE_AUTH' | 'BRIDGEKEY_WALLET' | 'COMPLETED';

export interface OperatorUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'Commander' | 'Operator';
}

export interface AuthContextType {
  user: OperatorUser | null;
  wallet: WalletState | null;
  onboardingStep: OnboardingStep;
  isLoading: boolean;
  errorMessage: string | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  connectBridgeKey: () => Promise<void>;
  connectOperatorKeypair: () => Promise<void>;
  disconnectWallet: () => void;
  syncWallet: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY_WALLET = 'horizon_bridgekey_wallet';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<OperatorUser | null>(null);
  const [wallet, setWallet] = useState<WalletState | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WALLET);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isSyncingRef = React.useRef<boolean>(false);

  // Compute current onboarding step strictly:
  // 1. Must have real Firebase Auth User
  // 2. Must have connected BridgeKey wallet with verified MST authorization
  const onboardingStep: OnboardingStep = !user
    ? 'FIREBASE_AUTH'
    : !wallet || !wallet.isAuthorized
    ? 'BRIDGEKEY_WALLET'
    : 'COMPLETED';

  // Silent sync to verify and connect wallet on mount, window focus, and tab switch
  const syncWallet = useCallback(async (): Promise<void> => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    try {
      // 1. Silent non-intrusive probe on active provider (eth_accounts)
      const activeInjected = await mstBlockchain.checkActiveConnection();

      if (activeInjected) {
        setWallet((prev) => {
          if (
            !prev ||
            prev.address.toLowerCase() !== activeInjected.address.toLowerCase() ||
            prev.balanceMst !== activeInjected.balanceMst ||
            prev.isAuthorized !== activeInjected.isAuthorized
          ) {
            try {
              localStorage.setItem(STORAGE_KEY_WALLET, JSON.stringify(activeInjected));
            } catch {}
            return activeInjected;
          }
          return prev;
        });
        return;
      }

      // 2. Check localStorage for operator credentials
      const savedStr = localStorage.getItem(STORAGE_KEY_WALLET);
      if (savedStr) {
        try {
          const saved: WalletState = JSON.parse(savedStr);
          if (saved.mode === 'commander_signer' && saved.isAuthorized) {
            const operatorState = await mstBlockchain.getOperatorWalletState();
            setWallet(operatorState);
            localStorage.setItem(STORAGE_KEY_WALLET, JSON.stringify(operatorState));
          } else if (saved.mode === 'bridgekey_injected' && saved.address) {
            // Re-verify balance on MST Testnet RPC
            const freshBalance = await mstBlockchain.getBalance(saved.address).catch(() => saved.balanceMst);
            const refreshed = { ...saved, balanceMst: freshBalance };
            setWallet(refreshed);
            localStorage.setItem(STORAGE_KEY_WALLET, JSON.stringify(refreshed));
          }
        } catch {}
      }
    } catch (err) {
      console.warn('[AuthContext] Wallet focus sync error:', err);
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  // Listen to live Firebase authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const operator: OperatorUser = {
            uid: fbUser.uid,
            email: fbUser.email || 'operator@horizon.io',
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Operator',
            role: 'Commander',
          };
          setUser(operator);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('[Firebase Auth Error]', error);
        setErrorMessage(error.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Window focus & tab visibility listener for Mac browsers auto-sync
  useEffect(() => {
    // Initial sync
    syncWallet();

    const handleFocus = () => {
      syncWallet();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncWallet();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('pageshow', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    // Setup live Web3 provider event listeners
    const cleanupListeners = mstBlockchain.setupProviderListeners({
      onAccountsChanged: (accounts: string[]) => {
        if (accounts.length > 0) {
          syncWallet();
        } else {
          setWallet((prev) => {
            if (prev?.mode === 'bridgekey_injected') {
              localStorage.removeItem(STORAGE_KEY_WALLET);
              return null;
            }
            return prev;
          });
        }
      },
      onChainChanged: () => {
        syncWallet();
      },
      onDisconnect: () => {
        setWallet((prev) => {
          if (prev?.mode === 'bridgekey_injected') {
            localStorage.removeItem(STORAGE_KEY_WALLET);
            return null;
          }
          return prev;
        });
      },
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      cleanupListeners();
    };
  }, [syncWallet]);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  // Real Firebase sign-in (strictly zero fallback/dummy credentials)
  const login = async (email: string, pass: string): Promise<void> => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, email.trim(), pass);
      const operator: OperatorUser = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName: cred.user.displayName || email.split('@')[0],
        role: 'Commander',
      };
      setUser(operator);
    } catch (err: any) {
      console.error('[Firebase Login Failed]', err);
      const message = err?.message || 'Authentication failed. Please verify your credentials.';
      setErrorMessage(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Real Firebase registration
  const register = async (email: string, pass: string): Promise<void> => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), pass);
      const operator: OperatorUser = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName: cred.user.displayName || email.split('@')[0],
        role: 'Commander',
      };
      setUser(operator);
    } catch (err: any) {
      console.error('[Firebase Registration Failed]', err);
      const message = err?.message || 'Registration failed. Please check password complexity.';
      setErrorMessage(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Real Firebase Google Sign-In
  const loginWithGoogle = async (): Promise<void> => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(firebaseAuth, provider);
      const operator: OperatorUser = {
        uid: cred.user.uid,
        email: cred.user.email || 'operator@horizon.io',
        displayName: cred.user.displayName || cred.user.email?.split('@')[0] || 'Operator',
        role: 'Commander',
      };
      setUser(operator);
    } catch (err: any) {
      console.error('[Firebase Google Login Failed]', err);
      const message = err?.message || 'Google sign-in failed. Please check popup permissions.';
      setErrorMessage(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Connect injected BridgeKey Web3 Wallet on MST Blockchain Testnet
  const connectBridgeKey = async (): Promise<void> => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const walletState = await mstBlockchain.connectBridgeKeyWallet();
      setWallet(walletState);
      localStorage.setItem(STORAGE_KEY_WALLET, JSON.stringify(walletState));
    } catch (err: any) {
      console.error('[BridgeKey Connection Failed]', err);
      const message = err?.message || 'Failed to connect BridgeKey Wallet.';
      setErrorMessage(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Authenticate with pre-authorized MST Testnet Operator Keypair from environment
  const connectOperatorKeypair = async (): Promise<void> => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const walletState = await mstBlockchain.getOperatorWalletState();
      setWallet(walletState);
      localStorage.setItem(STORAGE_KEY_WALLET, JSON.stringify(walletState));
    } catch (err: any) {
      console.error('[Operator Keypair Connection Failed]', err);
      const message = err?.message || 'Failed to authenticate operator keypair on MST Testnet.';
      setErrorMessage(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = (): void => {
    setWallet(null);
    localStorage.removeItem(STORAGE_KEY_WALLET);
  };

  // Logout from Firebase and disconnect BridgeKey credentials
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await firebaseSignOut(firebaseAuth);
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    setUser(null);
    disconnectWallet();
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        onboardingStep,
        isLoading,
        errorMessage,
        login,
        register,
        loginWithGoogle,
        connectBridgeKey,
        connectOperatorKeypair,
        disconnectWallet,
        syncWallet,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
