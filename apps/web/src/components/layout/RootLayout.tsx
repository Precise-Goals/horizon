import React from 'react';
import { Outlet, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { OnboardingGate } from '../auth/OnboardingGate';
import { cn } from '../../lib/utils';

export const RootLayout: React.FC = () => {
  const location = useLocation();

  return (
    <OnboardingGate>
      <div className="horizon-root-layout min-h-screen flex flex-col bg-[#FAFAF9] text-[#0A0A0A] selection:bg-[#0A0A0A] selection:text-white relative overflow-x-hidden font-sans">
        
        <Navbar />

        <main
          id="main-content"
          className="horizon-main-content flex-1 w-full relative z-10 flex flex-col items-center"
          tabIndex={-1}
        >
          <div className="w-full max-w-[1120px] mx-auto px-6 py-10 sm:py-16 flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="w-full flex-1 flex flex-col"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <Footer />
      </div>
    </OnboardingGate>
  );
};

export default RootLayout;
