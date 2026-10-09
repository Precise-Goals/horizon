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
    <div className={cn('w-full flex flex-col items-center font-sans pb-16 space-y-4', className)}>
      {/* Minimal Top Breadcrumb */}
      <div className="w-full max-w-4xl flex items-center justify-between px-2 text-xs font-mono">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-bold text-[#6E6258] hover:text-[#1A1A1A] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Home</span>
        </Link>
        <span className="text-[#8A7B6D] hidden sm:inline">
          Horizon: Dependency-Aware Autonomous Infrastructure Recovery &bull; Research Article
        </span>
      </div>

      {/* Unified Continuous Article Sheet — Rendered Pages One After Other Without Spacing */}
      <article className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-[0_4px_36px_rgba(26,26,26,0.08),0_1px_3px_rgba(26,26,26,0.04)] border border-[#E5D7C5] overflow-hidden">
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
