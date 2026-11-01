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
import { Link, useLocation } from 'react-router';
import { cn } from '../../lib/utils';

// Public routes accessible without onboarding
const PUBLIC_PATHS = [
  '/',
  '/patents',
  '/policies',
  '/governance/patents',
  '/governance/policies',
  '/docs',
  '/mcp',
];

export const OnboardingGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
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

  // Keep Patents, Policies, and Documentation pages accessible throughout the website
  const isPublic = PUBLIC_PATHS.some(
    (path) => location.pathname === path || location.pathname.startsWith(`${path}/`)
  );

  // If on a public route or onboarding is completely finished, render children directly
  if (isPublic || onboardingStep === 'COMPLETED') {
    return <>{children}</>;
  }

  // Prevent flash of login/onboarding screen while auth state is resolving
  if (isLoading) {
    return (
      <div className="horizon-onboarding-loading min-h-screen w-full bg-[#FFF8F0] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#0047AB]" />
        <span className="text-xs font-mono font-medium text-[#6E6258] mt-3">
          Verifying security clearance...
        </span>
      </div>
    );
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
    <div className="horizon-onboarding-container min-h-screen w-full bg-[#FFF8F0] text-[#1A1A1A] flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-[#0047AB]/20 selection:text-[#0047AB]">
      {/* Subtle Ambient Cobalt Blue Radial Lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-40 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(0,71,171,0.08),rgba(255,248,240,0))]"
      />

      {/* Tactile Blueprint Micro-Grid on Cream */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-20 bg-[linear-gradient(to_right,rgba(26,26,26,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(26,26,26,0.04)_1px,transparent_1px)] bg-[size:4rem_4rem]"
      />

      {/* Return to Homepage & Public Policy Links */}
      <div className="horizon-onboarding-nav relative z-10 w-full max-w-xl mb-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#555555] hover:text-[#0047AB] transition-colors bg-[#FAF3EA] hover:bg-[#F2E7D8] px-3.5 py-1.5 rounded-full border border-black/10 shadow-xs"
        >
          <span>&larr; Return to Homepage</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/patents"
            className="text-xs font-medium text-[#555555] hover:text-[#0047AB] transition-colors underline-offset-4 hover:underline"
          >
            Patents &amp; Research
          </Link>
          <span className="text-[#888888] text-xs">&bull;</span>
          <Link
            to="/policies"
            className="text-xs font-medium text-[#555555] hover:text-[#0047AB] transition-colors underline-offset-4 hover:underline"
          >
            Privacies &amp; Policies
          </Link>
        </div>
      </div>

      {/* Main Neo-Brutalist Tactile Porcelain Card */}
      <div className="horizon-onboarding-card relative z-10 w-full max-w-xl rounded-2xl p-6 sm:p-8 bg-[#FAF3EA] border-2 border-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.08)]">
        
        {/* Brand Header */}
        <div className="horizon-onboarding-header flex items-center justify-between pb-6 border-b border-black/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0047AB]/10 border border-[#0047AB]/20 flex items-center justify-center text-[#0047AB] shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#0047AB]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1A1A] tracking-tight">
                Horizon Operator Protocol
              </h2>
              <p className="text-xs text-[#666666]">
                Compulsory Zero-Trust Security Clearance
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-[#0047AB]/10 text-[#0047AB] border border-[#0047AB]/20 tracking-wider font-bold">
            MST Testnet
          </span>
        </div>

        {/* Step Progression Tabs */}
        <div className="horizon-onboarding-tabs grid grid-cols-2 gap-3 my-6">
          <div
            className={cn(
              'p-3 rounded-xl border-2 transition-all',
              user
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800'
                : 'bg-blue-500/10 border-[#0047AB] text-[#0047AB] shadow-xs'
            )}
          >
            <div className="flex items-center gap-2">
              {user ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-[#0047AB] text-white flex items-center justify-center text-[10px] font-bold">
                  1
                </span>
              )}
              <span className="text-xs font-bold text-[#1A1A1A]">Firebase Identity</span>
            </div>
            <p className="text-[10px] text-[#666666] mt-1 truncate">
              {user ? user.email : 'Authentication required'}
            </p>
          </div>

          <div
            className={cn(
              'p-3 rounded-xl border transition-all',
              wallet?.isAuthorized
                ? 'bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-800'
                : user
                ? 'bg-blue-500/10 border-2 border-[#0047AB] text-[#0047AB] shadow-xs'
                : 'bg-[#F2E7D8]/60 border-black/10 text-[#777777]'
            )}
          >
            <div className="flex items-center gap-2">
              {wallet?.isAuthorized ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <span
                  className={cn(
                    'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold',
                    user ? 'bg-[#0047AB] text-white' : 'bg-black/10 text-[#555555]'
                  )}
                >
                  2
                </span>
              )}
              <span className="text-xs font-bold text-[#1A1A1A]">BridgeKey Web3 Wallet</span>
            </div>
            <p className="text-[10px] text-[#666666] mt-1 truncate">
              {wallet?.isAuthorized ? `${wallet.balanceMst} MST` : 'MST Testnet Binding'}
            </p>
          </div>
        </div>

        {/* Error Alert Banner */}
        {(localError || errorMessage) && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border-2 border-red-200 text-red-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Authentication Error</span>
              <p className="text-[11px] text-red-700 mt-0.5">{localError || errorMessage}</p>
            </div>
          </div>
        )}

        {/* STEP 1: Firebase Auth Form */}
        {!user && (
          <form onSubmit={handleAuthSubmit} className="horizon-onboarding-form space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                Operator Enterprise Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
                <input
                  type="email"
                  required
                  placeholder="commander@enterprise.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-black/15 text-sm text-[#1A1A1A] placeholder-[#999999] focus:outline-none focus:border-[#0047AB] focus:ring-2 focus:ring-[#0047AB]/20 transition-all shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#333333] mb-1.5">
                Security Password / Secret Key
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-black/15 text-sm text-[#1A1A1A] placeholder-[#999999] focus:outline-none focus:border-[#0047AB] focus:ring-2 focus:ring-[#0047AB]/20 transition-all shadow-xs"
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
              <div className="flex-grow border-t border-black/10" />
              <span className="flex-shrink-0 mx-3 text-[10px] font-mono text-[#777777] tracking-wider">
                Or Continue With
              </span>
              <div className="flex-grow border-t border-black/10" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting || isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#F2E7D8]/50 active:bg-[#F2E7D8] border border-black/15 text-xs font-semibold text-[#1A1A1A] flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
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
                className="text-xs text-[#0047AB] hover:text-[#003380] font-semibold transition-colors cursor-pointer"
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
            <div className="p-3.5 rounded-xl bg-white border border-black/10 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-700 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1A1A1A]">
                    Firebase Operator Authenticated
                  </h4>
                  <p className="text-[10px] font-mono text-[#666666]">{user.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                UID: {user.uid.slice(0, 6)}...
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0047AB]/05 border border-[#0047AB]/20 space-y-2">
              <div className="flex items-center gap-2 text-[#0047AB]">
                <Wallet className="w-4 h-4" />
                <span className="text-xs font-bold">MST Blockchain Testnet Verification</span>
              </div>
              <p className="text-xs text-[#444444] leading-relaxed">
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
                className="w-full py-2.5 text-xs font-medium gap-2 border-black/15 hover:border-[#0047AB]/30"
              >
                <KeyRound className="w-4 h-4 text-[#0047AB]" />
                <span>Authenticate with Authorized Operator Keypair (.env)</span>
              </Button>
            </div>

            <div className="pt-2 text-center text-[11px] text-[#666666]">
              MST Testnet RPC: <code className="font-mono text-[#0047AB] font-semibold">testnetrpc.mstblockchain.com</code>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="horizon-onboarding-footer relative z-10 mt-6 text-center text-[11px] text-[#777777] font-medium">
        Horizon Autonomous Enterprise Infrastructure Recovery &bull; Protected by BridgeKey &amp; MST Testnet
      </div>
    </div>
  );
};
