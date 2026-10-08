import React from 'react';
import { Outlet } from 'react-router';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { OnboardingGate } from '../auth/OnboardingGate';

/**
 * RootLayout — wraps every authenticated app route.
 * Structure: sticky navbar → sidebar + main content area.
 */
export const RootLayout: React.FC = () => {
  return (
    <OnboardingGate>
      <div className="horizon-root-layout min-h-screen flex flex-col bg-[#07090E] text-[#FFF8F0] selection:bg-[#1E6BFF]/25 selection:text-white">
        <Navbar />
        <div className="horizon-app-body flex flex-1 overflow-hidden">
          <Sidebar />
          {/* Main content — proper padding, no cropped overflow */}
          <main className="horizon-main-content flex-1 overflow-y-auto overflow-x-hidden">
            <div className="horizon-content-wrapper max-w-[1400px] mx-auto px-5 md:px-8 lg:px-10 py-8 md:py-10">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </OnboardingGate>
  );
};
