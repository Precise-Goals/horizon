import React, { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { MST_CONFIG } from '../../engine/mstBlockchain';
import {
  ShieldCheck,
  Lock,
  Mail,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  KeyRound,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Button } from '../common/Button';

export const OnboardingGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    wallet,
    onboardingStep,
    isLoading,
    errorMessage,
    login,
    register,
    connectBridgeKey,
    connectOperatorKeypair,
    clearError,
  } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // If onboarding is completely finished, render the protected children
  if (onboardingStep === 'COMPLETED') {
    return <>{children}</>;
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    setSubmitting(true);

    try {
      if (isRegisterMode) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConnectBridgeKey = async () => {
    setLocalError(null);
    clearError();
    setSubmitting(true);
    try {
      await connectBridgeKey();
    } catch (err: any) {
      setLocalError(err.message || 'BridgeKey Wallet connection rejected or unavailable.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConnectOperatorKeypair = async () => {
    setLocalError(null);
    clearError();
    setSubmitting(true);
    try {
      await connectOperatorKeypair();
    } catch (err: any) {
      setLocalError(err.message || 'Operator keypair authorization failed on MST Testnet.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07090E] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-1/4 w-[300px] h-[200px] bg-indigo-600/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Main Glassmorphic Onboarding Card */}
      <div className="relative z-10 w-full max-w-xl glass-card rounded-2xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl backdrop-blur-2xl">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-[#1E6BFF] shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#FFF8F0] tracking-tight">
                Horizon Operator Protocol
              </h2>
              <p className="text-xs text-[#A3ADC2]">
                Compulsory Zero-Trust Security Clearance
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
            MST Testnet
          </span>
        </div>

        {/* Step Progression Tabs */}
        <div className="grid grid-cols-2 gap-3 my-6">
          <div
            className={`p-3 rounded-xl border transition-all ${
              user
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {user ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-[10px] font-bold">
                  1
                </span>
              )}
              <span className="text-xs font-semibold">Firebase Identity</span>
            </div>
            <p className="text-[10px] text-[#A3ADC2] mt-1 truncate">
              {user ? user.email : 'Authentication required'}
            </p>
          </div>

          <div
            className={`p-3 rounded-xl border transition-all ${
              wallet?.isAuthorized
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : user
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : 'bg-white/[0.02] border-white/[0.05] text-[#6E7A94]'
            }`}
          >
            <div className="flex items-center gap-2">
              {wallet?.isAuthorized ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-white/[0.08] flex items-center justify-center text-[10px] font-bold">
                  2
                </span>
              )}
              <span className="text-xs font-semibold">BridgeKey Web3 Wallet</span>
            </div>
            <p className="text-[10px] text-[#A3ADC2] mt-1 truncate">
              {wallet?.isAuthorized ? `${wallet.balanceMst} MST` : 'MST Testnet Binding'}
            </p>
          </div>
        </div>

        {/* Error Alert Banner */}
        {(localError || errorMessage) && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Authentication Error</span>
              <p className="text-[11px] text-red-300/90 mt-0.5">{localError || errorMessage}</p>
            </div>
          </div>
        )}

        {/* STEP 1: Firebase Auth Form */}
        {!user && (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#A3ADC2] mb-1.5">
                Operator Enterprise Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E7A94]" />
                <input
                  type="email"
                  required
                  placeholder="commander@enterprise.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-[#FFF8F0] placeholder-[#6E7A94] focus:outline-none focus:border-blue-400 focus:bg-white/[0.06] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A3ADC2] mb-1.5">
                Security Password / Secret Key
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E7A94]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-[#FFF8F0] placeholder-[#6E7A94] focus:outline-none focus:border-blue-400 focus:bg-white/[0.06] transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={submitting || isLoading}
              className="w-full py-2.5 mt-2 font-semibold text-xs gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Firebase Credentials...</span>
                </>
              ) : (
                <>
                  <span>{isRegisterMode ? 'Create Operator Account' : 'Verify Operator Credentials'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setLocalError(null);
                  clearError();
                }}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                {isRegisterMode
                  ? 'Already have an operator account? Sign In'
                  : 'New operator deployment? Create new credentials'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: BridgeKey Web3 Wallet Binding */}
        {user && (!wallet || !wallet.isAuthorized) && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#FFF8F0]">
                    Firebase Operator Authenticated
                  </h4>
                  <p className="text-[10px] font-mono text-[#A3ADC2]">{user.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">UID: {user.uid.slice(0, 6)}...</span>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/[0.06] border border-blue-500/20 space-y-2">
              <div className="flex items-center gap-2 text-blue-400">
                <Wallet className="w-4 h-4" />
                <span className="text-xs font-semibold">MST Blockchain Testnet Verification</span>
              </div>
              <p className="text-xs text-[#A3ADC2] leading-relaxed">
                Connect your <strong>BridgeKey Wallet</strong> to verify on-chain authorization on MST Testnet (Chain ID {MST_CONFIG.chainId}). Operator status requires &gt;= {MST_CONFIG.minBalance} MST.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <Button
                variant="primary"
                onClick={handleConnectBridgeKey}
                disabled={submitting}
                className="w-full py-2.5 text-xs font-semibold gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wallet className="w-4 h-4" />
                )}
                <span>Connect Injected BridgeKey Wallet</span>
              </Button>

              <Button
                variant="secondary"
                onClick={handleConnectOperatorKeypair}
                disabled={submitting}
                className="w-full py-2.5 text-xs font-medium gap-2 border-white/10 hover:border-blue-500/30"
              >
                <KeyRound className="w-4 h-4 text-blue-400" />
                <span>Authenticate with Authorized Operator Keypair (.env)</span>
              </Button>
            </div>

            <div className="pt-2 text-center text-[11px] text-[#6E7A94]">
              MST Testnet RPC: <code className="font-mono text-[#A3ADC2]">testnetrpc.mstblockchain.com</code>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="relative z-10 mt-6 text-center text-[11px] text-[#6E7A94]">
        Horizon Autonomous Enterprise Infrastructure Recovery &bull; Protected by BridgeKey &amp; MST Testnet
      </div>
    </div>
  );
};
