import React from 'react';
import { Outlet } from 'react-router';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { OnboardingGate } from '../auth/OnboardingGate';

/**
 * RootLayout — wraps every authenticated app route.
 * Dominating cream background (#FFF8F0) with crisp ink black typography and skeuomorphic depth.
 */
export const RootLayout: React.FC = () => {
  return (
    <OnboardingGate>
      <div className="horizon-root-layout min-h-screen flex flex-col bg-[#FFF8F0] text-[#1A1A1A] selection:bg-[#0047AB]/20 selection:text-[#0047AB]">
        <Navbar />
        <div className="horizon-app-body flex flex-1 overflow-hidden">
          <Sidebar />
          {/* Main content — warm cream canvas with spacious padding */}
          <main className="horizon-main-content flex-1 overflow-y-auto overflow-x-hidden bg-[#FFF8F0]">
            <div className="horizon-content-wrapper max-w-[1440px] mx-auto px-5 md:px-8 lg:px-10 py-8 md:py-10">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </OnboardingGate>
  );
};
