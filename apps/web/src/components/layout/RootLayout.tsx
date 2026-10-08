import React from 'react';
import { Outlet } from 'react-router';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { OnboardingGate } from '../auth/OnboardingGate';

export const RootLayout: React.FC = () => {
  return (
    <OnboardingGate>
      <div className="min-h-screen flex flex-col bg-[#07090E] text-[#FFF8F0] selection:bg-[#1E6BFF]/30 selection:text-white">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </OnboardingGate>
  );
};
