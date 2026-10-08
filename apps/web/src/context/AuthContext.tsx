import React, { createContext, useContext, useState, ReactNode } from 'react';

type User = {
  email: string;
  name?: string;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => void;
  logout: () => void;
  loginDemo: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, pass: string) => {
    setUser({ email });
  };

  const logout = () => {
    setUser(null);
  };

  const loginDemo = () => {
    setUser({ email: 'demo@horizon.io', name: 'Demo User' });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loginDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
