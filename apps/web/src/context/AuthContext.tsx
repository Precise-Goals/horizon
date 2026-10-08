import React, { createContext, useState, useEffect, ReactNode } from 'react';
import {
  firebaseAuth,
  isFirebaseConfigured,
} from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';

export type User = {
  uid?: string;
  email: string;
  name?: string;
  walletAddress?: string;
  role?: 'Commander' | 'Operator' | 'Viewer';
};

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  loginWithWallet: (address: string) => void;
  logout: () => Promise<void>;
  loginDemo: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('horizon_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (isFirebaseConfigured && firebaseAuth) {
      const unsubscribe = onAuthStateChanged(firebaseAuth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const profile: User = {
            uid: fbUser.uid,
            email: fbUser.email || 'operator@horizon.io',
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Operator',
            role: 'Commander',
          };
          setUser(profile);
          localStorage.setItem('horizon_user', JSON.stringify(profile));
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    if (isFirebaseConfigured && firebaseAuth) {
      try {
        const cred = await signInWithEmailAndPassword(firebaseAuth, email, pass);
        const profile: User = {
          uid: cred.user.uid,
          email: cred.user.email || email,
          name: cred.user.displayName || email.split('@')[0],
          role: 'Commander',
        };
        setUser(profile);
        localStorage.setItem('horizon_user', JSON.stringify(profile));
        return;
      } catch (err: any) {
        console.warn('Firebase login attempt fallback to local session:', err?.message);
      }
    }

    const fallbackUser: User = {
      email,
      name: email.split('@')[0],
      role: 'Commander',
    };
    setUser(fallbackUser);
    localStorage.setItem('horizon_user', JSON.stringify(fallbackUser));
  };

  const register = async (email: string, pass: string): Promise<void> => {
    if (isFirebaseConfigured && firebaseAuth) {
      try {
        const cred = await createUserWithEmailAndPassword(firebaseAuth, email, pass);
        const profile: User = {
          uid: cred.user.uid,
          email: cred.user.email || email,
          name: email.split('@')[0],
          role: 'Commander',
        };
        setUser(profile);
        localStorage.setItem('horizon_user', JSON.stringify(profile));
        return;
      } catch (err: any) {
        console.warn('Firebase registration fallback to local session:', err?.message);
      }
    }

    await login(email, pass);
  };

  const loginWithWallet = (address: string): void => {
    const walletUser: User = {
      email: `${address.slice(0, 6)}...${address.slice(-4)}@mst.testnet`,
      walletAddress: address,
      name: `Commander (${address.slice(0, 6)})`,
      role: 'Commander',
    };
    setUser(walletUser);
    localStorage.setItem('horizon_user', JSON.stringify(walletUser));
  };

  const logout = async (): Promise<void> => {
    if (isFirebaseConfigured && firebaseAuth) {
      try {
        await firebaseSignOut(firebaseAuth);
      } catch (e) {
        console.warn(e);
      }
    }
    setUser(null);
    localStorage.removeItem('horizon_user');
  };

  const loginDemo = (): void => {
    const demoUser: User = {
      email: 'sre-commander@horizon-resilience.io',
      name: 'Lead SRE Commander',
      walletAddress: '0x73595081334A18D4298A160b162faB4Fb4B3c85B',
      role: 'Commander',
    };
    setUser(demoUser);
    localStorage.setItem('horizon_user', JSON.stringify(demoUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        loginWithWallet,
        logout,
        loginDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
