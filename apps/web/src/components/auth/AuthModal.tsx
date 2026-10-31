import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/useAuth';
import { Lock, Mail, AlertTriangle, Loader2, ExternalLink, Zap } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, loginWithGoogle, loginAsDemo, errorMessage, clearError } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const activeError = localError || errorMessage;
  const isOperationNotAllowed = activeError?.includes('operation-not-allowed');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Horizon Operator Authentication">
      <form onSubmit={handleSubmit} className="space-y-4">
        {activeError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                {isOperationNotAllowed ? (
                  <>
                    <div className="font-semibold text-red-900">
                      Email/Password Sign-In Disabled in Firebase Console
                    </div>
                    <p className="text-[11px] text-red-700/90 leading-relaxed">
                      Your Firebase project (<code className="font-mono bg-red-100 px-1 py-0.5 rounded text-red-900">horizon-e0a3e</code>) requires Email/Password sign-in to be enabled in Firebase Console.
                    </p>
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          setLocalError(null);
                          clearError();
                          await loginAsDemo();
                          onClose();
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
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-red-300 bg-white/70 text-red-900 font-medium text-[11px] hover:bg-red-100 transition-colors"
                      >
                        <span>Enable in Console</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </>
                ) : (
                  <span>{activeError}</span>
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[#6B6B6B] mb-1.5 font-mono uppercase tracking-wider text-[11px]">
            Operator Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
            <input
              type="email"
              required
              placeholder="commander@enterprise.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 h-12 rounded-[12px] bg-white border border-[#E5E5E5] text-sm text-[#0A0A0A] placeholder-[#A3A3A3] focus:outline-none focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#2DD4BF]/20 transition-all font-sans"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6B6B6B] mb-1.5 font-mono uppercase tracking-wider text-[11px]">
            Authentication Key / Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 h-12 rounded-[12px] bg-white border border-[#E5E5E5] text-sm text-[#0A0A0A] placeholder-[#A3A3A3] focus:outline-none focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#2DD4BF]/20 transition-all font-sans"
            />
          </div>
        </div>

        <Button type="submit" variant="primary" disabled={loading} className="w-full mt-2 font-semibold text-xs gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{isRegister ? 'Create Operator Account' : 'Authenticate via Firebase'}</span>
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
          onClick={async () => {
            setLocalError(null);
            clearError();
            setLoading(true);
            try {
              await loginWithGoogle();
              onClose();
            } catch (err: any) {
              setLocalError(err.message || 'Google sign-in failed.');
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full h-11 px-4 rounded-full bg-white hover:bg-[#FAFAF9] border border-[#E5E5E5] text-xs font-medium text-[#0A0A0A] flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        <button
          type="button"
          onClick={async () => {
            setLocalError(null);
            clearError();
            setLoading(true);
            try {
              await loginAsDemo();
              onClose();
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full h-11 px-4 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-[#E5E5E5] text-xs font-mono text-[#0A0A0A] flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-[#2DD4BF]" />
          <span>Launch Demo Operator Session (Bypass)</span>
        </button>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setLocalError(null);
              clearError();
            }}
            className="text-xs text-[#0A0A0A] hover:underline transition-colors cursor-pointer font-medium"
          >
            {isRegister
              ? 'Already registered? Switch to Sign In'
              : 'New operator deployment? Create Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AuthModal;
