import React, { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../common/Button';
import { AuthModal } from '../auth/AuthModal';
import { useAuth } from '../../context/AuthContext';
import { Activity } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[#FFF8F0] border-b-4 border-[#1A1A1A] px-4 py-3 flex items-center justify-between shadow-[0_4px_0px_#1A1A1A]">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
            <img src="/logo.png" alt="Horizon" className="w-8 h-8 rounded border-2 border-[#1A1A1A] object-contain bg-white shadow-[2px_2px_0px_#1A1A1A]" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
            Horizon
          </Link>
          <div className="hidden md:flex items-center gap-2 bg-white border-2 border-[#1A1A1A] px-3 py-1 rounded-full shadow-[2px_2px_0px_#1A1A1A]">
            <div className="w-3 h-3 bg-[#22C55E] rounded-full animate-pulse border border-black"></div>
            <span className="text-xs font-bold uppercase tracking-wider">All Systems Operational</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm" className="hidden sm:inline-flex">
            Connect Wallet
          </Button>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="font-bold text-sm hidden sm:inline-block">{user.email}</span>
              <Button variant="danger" size="sm" onClick={logout}>Logout</Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => setIsAuthOpen(true)}>Login</Button>
          )}
        </div>
      </nav>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
