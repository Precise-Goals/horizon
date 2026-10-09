import React from 'react';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

interface PatentsPageProps {
  className?: string;
}

/**
 * PatentsPage — Embedded Full-Width PDF Viewer.
 * Directly embeds research.pdf full-width with zero UI in between pages
 * and no download controls.
 */
export const PatentsPage: React.FC<PatentsPageProps> = ({ className }) => {
  return (
    <div className={cn('w-full space-y-3 font-sans pb-6', className)}>
      {/* Minimal Top Navigation */}
      <div className="w-full flex items-center justify-between px-1 text-xs font-mono">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-bold text-[#6E6258] hover:text-[#1A1A1A] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Home</span>
        </Link>
        <span className="text-[#8A7B6D] hidden sm:inline">
          Horizon: Dependency-Aware Autonomous Infrastructure Recovery &bull; Technical Patent Disclosure
        </span>
      </div>

      {/* Embedded Full-Width PDF — Zero UI In Between */}
      <div className="w-full h-[calc(100vh-140px)] min-h-[850px] lg:min-h-[920px] rounded-2xl overflow-hidden border border-[#D5C5B2] shadow-[0_8px_32px_rgba(26,26,26,0.08),inset_0_1px_0_#FFFFFF] bg-[#2A2A2A]">
        <object
          data="/research.pdf#toolbar=0&navpanes=0&scrollbar=1&view=FitH"
          type="application/pdf"
          className="w-full h-full border-0 block"
        >
          <embed
            src="/research.pdf#toolbar=0&navpanes=0&scrollbar=1&view=FitH"
            type="application/pdf"
            className="w-full h-full border-0 block"
          />
          <iframe
            src="/research.pdf#toolbar=0&navpanes=0&scrollbar=1&view=FitH"
            title="Horizon Autonomous Recovery Patent Disclosure"
            className="w-full h-full border-0 block"
          />
        </object>
      </div>
    </div>
  );
};

export default PatentsPage;
