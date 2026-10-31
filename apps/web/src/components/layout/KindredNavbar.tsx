import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../context/useAuth';
import { AuthModal } from '../auth/AuthModal';
import { HorizonLogo } from '../common/HorizonLogo';
import { Menu, X, ArrowUpRight, ShieldCheck, User as UserIcon, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';

export const KindredNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 90 && y > lastY) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastY = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-neutral-100 transition-transform duration-300 ease-in-out',
          hidden ? '-translate-y-full' : 'translate-y-0'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          
          {/* Left: Horizon Brand Mark */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <HorizonLogo size={32} className="transition-transform group-hover:scale-105" />
              <span className="text-xl font-bold tracking-tight text-neutral-900 font-sans">
                Horizon
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-neutral-600">
              <Link to="/dashboard" className="hover:text-black transition-colors">
                Platform
              </Link>
              <Link to="/topology" className="hover:text-black transition-colors">
                Marketplace
              </Link>
              <Link to="/architect" className="hover:text-black transition-colors">
                Creators
              </Link>
              <Link to="/docs" className="hover:text-black transition-colors">
                Resources
              </Link>
              <Link to="/audit" className="hover:text-black transition-colors">
                Company
              </Link>
            </nav>
          </div>

          {/* Right Action: Sign In Button */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="px-5 py-2.5 rounded-full bg-black text-white text-xs font-medium hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#5EEAD4]" />
                  <span>Command Center</span>
                </Link>
                <button
                  type="button"
                  onClick={() => logout()}
                  title="Sign out operator"
                  className="p-2 rounded-full border border-neutral-200 text-neutral-600 hover:text-black hover:border-neutral-300 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="px-6 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-neutral-800 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="sm:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-700 hover:text-black focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden px-6 pt-3 pb-6 border-b border-neutral-200 bg-white space-y-3 font-medium text-sm text-neutral-700">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-black"
            >
              Platform (Command Center)
            </Link>
            <Link
              to="/topology"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-black"
            >
              Marketplace (Topological DAG)
            </Link>
            <Link
              to="/architect"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-black"
            >
              Creators (Sarvam AI Copilot)
            </Link>
            <Link
              to="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-black"
            >
              Resources (Docs &amp; MCP)
            </Link>
            <Link
              to="/audit"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 hover:text-black"
            >
              Company (Audit &amp; Governance)
            </Link>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsAuthOpen(true);
                }}
                className="w-full py-2.5 rounded-full bg-black text-white text-xs font-semibold text-center"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};

export default KindredNavbar;

