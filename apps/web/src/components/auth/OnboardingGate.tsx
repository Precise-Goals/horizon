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
  KeyRound,
  Loader2,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Link } from 'react-router';

export const OnboardingGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
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

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearError();
    setSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setLocalError(err.message || 'Google authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

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

      {/* Return to Homepage Link */}
      <div className="relative z-10 w-full max-w-xl mb-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A3ADC2] hover:text-[#FFF8F0] transition-colors bg-white/[0.04] hover:bg-white/[0.08] px-3.5 py-1.5 rounded-full border border-white/10"
        >
          <span>&larr; Return to Homepage</span>
        </Link>
        <span className="text-xs font-mono text-[#8E9DB8]">Horizon Security Gate</span>
      </div>

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

            <div className="relative flex items-center my-3">
              <div className="flex-grow border-t border-white/[0.08]" />
              <span className="flex-shrink-0 mx-3 text-[10px] font-mono text-[#6E7A94] uppercase tracking-wider">
                Or Continue With
              </span>
              <div className="flex-grow border-t border-white/[0.08]" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting || isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] active:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-[#FFF8F0] flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setLocalError(null);
                  clearError();
                }}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
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
