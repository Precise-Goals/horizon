import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, loginDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
    onClose();
  };

  const handleDemo = () => {
    loginDemo();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Horizon Operator Access">
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#A3ADC2] mb-1.5">
            Operator Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E7A94]" />
            <input
              type="email"
              required
              placeholder="sre@enterprise.io"
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

        <Button type="submit" variant="primary" className="w-full mt-2 font-semibold text-xs">
          Sign In to Command Center
        </Button>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-white/[0.08]" />
          <span className="flex-shrink-0 mx-3 text-[11px] font-mono text-[#6E7A94] uppercase">
            Quick Sandbox
          </span>
          <div className="flex-grow border-t border-white/[0.08]" />
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full gap-2 text-xs font-medium border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
          onClick={handleDemo}
        >
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Launch Demo Operator Session</span>
        </Button>
      </form>
    </Modal>
  );
};
