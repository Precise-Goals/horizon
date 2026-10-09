import React from 'react';
import { Outlet, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { OnboardingGate } from '../auth/OnboardingGate';
import { cn } from '../../lib/utils';

/**
 * RootLayout — Minimalist, Centered, SRE Command Layout.
 * Features:
 * - Completely centered, uncluttered layout (sidebar removed).
 * - Dominating cream background (#FFF8F0) with skeuomorphic porcelain depth.
 * - Fluid, component-by-component Framer Motion transitions.
 * - Subtle ambient cobalt blue lighting.
 */
export const RootLayout: React.FC = () => {
  const location = useLocation();
  const isPatents = location.pathname.startsWith('/patents') || location.pathname === '/governance/patents';
  const isArchitect = location.pathname.startsWith('/architect');

  return (
    <OnboardingGate>
      <div className="horizon-root-layout min-h-screen flex flex-col bg-[#FFF8F0] text-[#1A1A1A] selection:bg-[#0047AB]/20 selection:text-[#0047AB] relative overflow-x-hidden">
        {/* Subtle Ambient Cobalt Blue Radial Lighting */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 opacity-40 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(0,71,171,0.08),rgba(255,248,240,0))]"
        />

        {/* Tactile Blueprint Micro-Grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 opacity-20 bg-[linear-gradient(to_right,rgba(26,26,26,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(26,26,26,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]"
        />

        {/* Floating Porcelain Dock Navbar */}
        <Navbar />

        {/* Centered Main Stage */}
        <main className="horizon-main-content flex-1 w-full relative z-10 flex flex-col items-center">
          <div
            className={cn(
              'horizon-content-wrapper mx-auto w-full transition-all',
              isArchitect
                ? 'max-w-5xl px-3 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col'
                : isPatents
                ? 'max-w-5xl px-3 sm:px-6 py-6 sm:py-8'
                : 'max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12'
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 14, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.995 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        {/* Antigravity-Style Monumental Footer */}
        <Footer />
      </div>
    </OnboardingGate>
  );
};
