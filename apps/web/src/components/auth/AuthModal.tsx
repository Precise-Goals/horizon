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
  const { login, register, errorMessage, clearError } = useAuth();
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

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setLocalError(null);
              clearError();
            }}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
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
