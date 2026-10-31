import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/useAuth';
import { Lock, Mail, AlertTriangle, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, loginWithGoogle, errorMessage, clearError } = useAuth();
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Horizon Operator Authentication">
      <form onSubmit={handleSubmit} className="space-y-4">
        {(localError || errorMessage) && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="flex-1">{localError || errorMessage}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[#A3ADC2] mb-1.5">
            Operator Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E7A94]" />
            <input
              type="email"
              required
              placeholder="commander@enterprise.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-[#FFF8F0] placeholder-[#6E7A94] focus:outline-none focus:border-blue-400 focus:bg-white/[0.06] transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#A3ADC2] mb-1.5">
            Authentication Key / Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E7A94]" />
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-[#FFF8F0] placeholder-[#6E7A94] focus:outline-none focus:border-blue-400 focus:bg-white/[0.06] transition-all"
            />
          </div>
        </div>

        <Button type="submit" variant="primary" disabled={loading} className="w-full mt-2 font-semibold text-xs gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{isRegister ? 'Create Operator Account' : 'Authenticate via Firebase'}</span>
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
              setIsRegister(!isRegister);
              setLocalError(null);
              clearError();
            }}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
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
