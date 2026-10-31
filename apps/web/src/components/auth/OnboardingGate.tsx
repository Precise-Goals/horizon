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
  ExternalLink,
  Zap,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Link, useLocation } from 'react-router';
import { Globe } from '../common/Globe';

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
    loginAsDemo,
    connectBridgeKey,
    connectOperatorKeypair,
    clearError,
  } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isPublic = PUBLIC_PATHS.some(
    (path) => location.pathname === path || location.pathname.startsWith(`${path}/`)
  );

  if (isPublic || onboardingStep === 'COMPLETED') {
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
    <div className="min-h-screen w-full bg-[#FAFAF9] text-[#0A0A0A] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Faint Dotted Halftone Globe Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
        <Globe size="700px" crop="full-small" className="w-full h-full" />
      </div>

      {/* Return to Homepage & Public Policy Links */}
      <div className="relative z-10 w-full max-w-xl mb-4 flex items-center justify-between text-xs">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-medium text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors bg-white px-3.5 py-1.5 rounded-full border border-[#E5E5E5] shadow-sm"
        >
          <span>&larr; Return to Homepage</span>
        </Link>
        <div className="flex items-center gap-3 text-[#6B6B6B]">
          <Link to="/patents" className="hover:text-[#0A0A0A] transition-colors">
            Patents
          </Link>
          <span>&bull;</span>
          <Link to="/policies" className="hover:text-[#0A0A0A] transition-colors">
            Policies
          </Link>
        </div>
      </div>

      {/* Main Horizon Editorial Onboarding Card */}
      <div className="relative z-10 w-full max-w-xl rounded-[20px] bg-white p-6 sm:p-8 border border-[#E5E5E5] shadow-[0_1px_2px_rgba(0,0,0,.04),0_8px_24px_rgba(0,0,0,.04)]">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <ShieldCheck className="w-5 h-5 text-[#2DD4BF]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#0A0A0A] tracking-tight">
                Horizon Operator Protocol
              </h2>
              <p className="text-xs text-[#6B6B6B]">
                Zero-Trust SRE Security Clearance
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-[10px] font-mono font-medium text-[#0A0A0A] border border-[#E5E5E5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]" />
            <span>MST Testnet</span>
          </div>
        </div>

        {/* Step Progression Tabs */}
        <div className="grid grid-cols-2 gap-3 my-6">
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              user
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-neutral-50 border-[#E5E5E5] text-[#0A0A0A]'
            }`}
          >
            <div className="flex items-center gap-2">
              {user ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-[10px] font-bold">
                  1
                </span>
              )}
              <span className="text-xs font-semibold">Firebase Identity</span>
            </div>
            <p className="text-[11px] text-[#6B6B6B] mt-1 truncate">
              {user ? user.email : 'Authentication required'}
            </p>
          </div>

          <div
            className={`p-3.5 rounded-xl border transition-all ${
              wallet?.isAuthorized
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : user
                ? 'bg-neutral-50 border-[#E5E5E5] text-[#0A0A0A]'
                : 'bg-neutral-50/50 border-[#E5E5E5]/60 text-[#A3A3A3]'
            }`}
          >
            <div className="flex items-center gap-2">
              {wallet?.isAuthorized ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-neutral-200 text-[#6B6B6B] flex items-center justify-center text-[10px] font-bold">
                  2
                </span>
              )}
              <span className="text-xs font-semibold">BridgeKey Web3 Wallet</span>
            </div>
            <p className="text-[11px] text-[#6B6B6B] mt-1 truncate">
              {wallet?.isAuthorized ? `${wallet.balanceMst} MST` : 'MST Testnet Binding'}
            </p>
          </div>
        </div>

        {/* Error Alert Banner */}
        {(localError || errorMessage) && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                {(localError || errorMessage)?.includes('operation-not-allowed') ? (
                  <>
                    <div className="font-semibold text-red-900">
                      Email/Password Provider Disabled in Firebase Console
                    </div>
                    <p className="text-[11px] text-red-700/90 leading-relaxed">
                      Your Firebase project (<code className="font-mono bg-red-100 px-1 py-0.5 rounded text-red-900">horizon-e0a3e</code>) has not enabled Email/Password sign-in yet.
                    </p>
                    <div className="pt-1.5 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          setLocalError(null);
                          clearError();
                          await loginAsDemo();
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0A0A0A] text-white font-semibold text-[11px] hover:bg-neutral-800 transition-colors cursor-pointer shadow-sm"
                      >
                        <Zap className="w-3 h-3 text-[#2DD4BF]" />
                        <span>Instant Demo Commander Clearance</span>
                      </button>
                      <a
                        href="https://console.firebase.google.com/project/horizon-e0a3e/authentication/providers"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-300 bg-white/70 text-red-900 font-medium text-[11px] hover:bg-red-100 transition-colors"
                      >
                        <span>Enable in Firebase Console</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="font-semibold block">Authentication Error</span>
                    <p className="text-[11px] text-red-700">{localError || errorMessage}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instant Demo/Bypass Option */}
        <div className="mb-5 p-3.5 rounded-xl bg-neutral-50 border border-[#E5E5E5] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 text-[#2DD4BF]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#0A0A0A]">Instant Demo Commander Clearance</div>
              <div className="text-[11px] text-[#6B6B6B]">Bypass Firebase authentication for local evaluation</div>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              setLocalError(null);
              clearError();
              await loginAsDemo();
            }}
            className="px-4 py-1.5 rounded-full bg-[#0A0A0A] text-white hover:bg-neutral-800 font-mono text-xs font-semibold shrink-0 transition-colors cursor-pointer"
          >
            Launch Demo
          </button>
        </div>

        {/* STEP 1: Firebase Auth Form */}
        {!user && (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#6B6B6B] mb-1.5 font-mono uppercase tracking-wider text-[11px]">
                Operator Enterprise Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
                <input
                  type="email"
                  required
                  placeholder="commander@enterprise.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 h-12 rounded-[12px] bg-white border border-[#E5E5E5] text-sm text-[#0A0A0A] placeholder-[#A3A3A3] focus:outline-none focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#2DD4BF]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B6B6B] mb-1.5 font-mono uppercase tracking-wider text-[11px]">
                Security Password / Secret Key
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 h-12 rounded-[12px] bg-white border border-[#E5E5E5] text-sm text-[#0A0A0A] placeholder-[#A3A3A3] focus:outline-none focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#2DD4BF]/20 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={submitting || isLoading}
              className="w-full h-11 font-semibold text-xs gap-2"
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
              <div className="flex-grow border-t border-[#E5E5E5]" />
              <span className="flex-shrink-0 mx-3 text-[10px] font-mono text-[#A3A3A3] uppercase tracking-wider">
                Or Continue With
              </span>
              <div className="flex-grow border-t border-[#E5E5E5]" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting || isLoading}
              className="w-full h-11 px-4 rounded-full bg-white hover:bg-[#FAFAF9] border border-[#E5E5E5] text-xs font-semibold text-[#0A0A0A] flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
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
                className="text-xs text-[#0A0A0A] hover:underline font-medium transition-colors cursor-pointer"
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
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-[#E5E5E5] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#0A0A0A]">
                    Firebase Operator Authenticated
                  </h4>
                  <p className="text-[11px] font-mono text-[#6B6B6B]">{user.email}</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-700">UID: {user.uid.slice(0, 6)}...</span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-[#E5E5E5] space-y-2">
              <div className="flex items-center gap-2 text-[#0A0A0A]">
                <Wallet className="w-4 h-4 text-[#2DD4BF]" />
                <span className="text-xs font-semibold">MST Blockchain Testnet Verification</span>
              </div>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                Connect your <strong>BridgeKey Wallet</strong> to verify on-chain authorization on MST Testnet (Chain ID {MST_CONFIG.chainId}).
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
                className="w-full py-2.5 text-xs font-medium gap-2"
              >
                <KeyRound className="w-4 h-4 text-[#2DD4BF]" />
                <span>Authenticate with Authorized Operator Keypair (.env)</span>
              </Button>
            </div>

            <div className="pt-2 text-center text-[11px] text-[#A3A3A3]">
              MST Testnet RPC: <code className="font-mono text-[#0A0A0A]">testnetrpc.mstblockchain.com</code>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="relative z-10 mt-6 text-center text-[11px] text-[#A3A3A3]">
        Horizon Autonomous Enterprise Infrastructure Recovery &bull; Protected by BridgeKey &amp; MST Testnet
      </div>
    </div>
  );
};

export default OnboardingGate;
