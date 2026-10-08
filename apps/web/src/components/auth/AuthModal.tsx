import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
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
    <Modal isOpen={isOpen} onClose={onClose} title="Authenticate">
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-bold uppercase mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-2 focus:ring-[#0047AB]"
          />
        </div>
        <div>
          <label className="block text-sm font-bold uppercase mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-[#1A1A1A] p-2 focus:outline-none focus:ring-2 focus:ring-[#0047AB]"
          />
        </div>
        <Button type="submit" className="w-full">Login</Button>
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t-2 border-[#1A1A1A]"></div>
          <span className="flex-shrink-0 mx-4 font-bold text-sm uppercase">OR</span>
          <div className="flex-grow border-t-2 border-[#1A1A1A]"></div>
        </div>
        <Button type="button" variant="warning" className="w-full" onClick={handleDemo}>
          Demo Login
        </Button>
      </form>
    </Modal>
  );
};
