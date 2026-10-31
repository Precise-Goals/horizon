import React from 'react';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

const PAGES = [
  { pageNumber: 1, src: '/research-pages/page-1.webp' },
  { pageNumber: 2, src: '/research-pages/page-2.webp' },
  { pageNumber: 3, src: '/research-pages/page-3.webp' },
  { pageNumber: 4, src: '/research-pages/page-4.webp' },
  { pageNumber: 5, src: '/research-pages/page-5.webp' },
  { pageNumber: 6, src: '/research-pages/page-6.webp' },
  { pageNumber: 7, src: '/research-pages/page-7.webp' },
];

interface PatentsPageProps {
  className?: string;
}

/**
 * PatentsPage — Continuous Full-Article Document Reader.
 * Renders all pages sequentially one after the other with zero spacing,
 * freely scrolling with the window as a unified article.
 */
export const PatentsPage: React.FC<PatentsPageProps> = ({ className }) => {
  return (
    <div className={cn('w-full flex flex-col items-center font-sans pb-16 space-y-6 text-[#0A0A0A]', className)}>
      {/* Minimal Top Breadcrumb */}
      <div className="w-full max-w-4xl flex items-center justify-between text-xs font-mono">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-semibold text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors bg-white px-3.5 py-1.5 rounded-full border border-[#E5E5E5] shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Home</span>
        </Link>
        <span className="text-[#A3A3A3] hidden sm:inline text-[11px]">
          Horizon: Dependency-Aware Autonomous Infrastructure Recovery &bull; Research Article
        </span>
      </div>

      {/* Signature Two-Line Header */}
      <div className="w-full max-w-4xl text-left space-y-2">
        <h1 className="tracking-tight leading-[1.02]">
          <span className="block font-['Instrument_Serif',serif] font-normal text-[#A3A3A3] text-4xl sm:text-5xl">
            Research & Patents,
          </span>
          <span className="block font-['Instrument_Serif',serif] italic font-normal text-[#0A0A0A] text-4xl sm:text-5xl">
            intellectual disclosures.
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6B6B] leading-relaxed">
          Full technical patent filings and algorithmic research papers covering topological recovery graphs, Kahn's algorithm orchestration, and cryptographic human commander gates.
        </p>
      </div>

      {/* Unified Continuous Article Sheet */}
      <article className="w-full max-w-4xl bg-white rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] border border-[#E5E5E5] overflow-hidden">
        {PAGES.map((page) => (
          <img
            key={page.pageNumber}
            src={page.src}
            alt={`Horizon Research & Patent Disclosure — Page ${page.pageNumber}`}
            className="w-full h-auto block select-auto m-0 p-0 border-0"
            loading={page.pageNumber <= 2 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
      </article>
    </div>
  );
};

export default PatentsPage;
