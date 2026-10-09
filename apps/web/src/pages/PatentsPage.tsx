import React, { useState, useEffect, useRef } from 'react';
import { motion, type BezierDefinition } from 'framer-motion';
import { Link } from 'react-router';
import { ArrowLeft, BookOpen, Layers, Maximize2, Minimize2, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

const EASE: BezierDefinition = [0.16, 1, 0.3, 1];

const PAGES = [
  { pageNumber: 1, src: '/research-pages/page-1.webp', title: 'Cover, Abstract & Problem Formulation' },
  { pageNumber: 2, src: '/research-pages/page-2.webp', title: 'Prior-Art Analysis & State of the Art' },
  { pageNumber: 3, src: '/research-pages/page-3.webp', title: 'Topological Architecture & Kahn DAG Engine' },
  { pageNumber: 4, src: '/research-pages/page-4.webp', title: 'System Blueprint & Blast Radius Discovery' },
  { pageNumber: 5, src: '/research-pages/page-5.webp', title: 'EIP-712 Multi-Sig & Cryptographic Approval Gates' },
  { pageNumber: 6, src: '/research-pages/page-6.webp', title: 'Merkle Audit Vault & Testnet Ledger Verification' },
  { pageNumber: 7, src: '/research-pages/page-7.webp', title: 'Patentability Claims & Comparative Matrix' },
];

interface PatentsPageProps {
  className?: string;
}

/**
 * PatentsPage — Blended Document Presentation.
 * Displays the 7-page technical patent disclosure directly within the page stream,
 * seamlessly rendered without iframes or external download controls.
 */
export const PatentsPage: React.FC<PatentsPageProps> = ({ className }) => {
  const [activePage, setActivePage] = useState<number>(1);
  const [isWideMode, setIsWideMode] = useState<boolean>(false);
  const pageRefs = useRef<(HTMLElement | null)[]>([]);

  // Track the currently visible page via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-page-index'));
            if (!Number.isNaN(index)) {
              setActivePage(index);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-20% 0px -40% 0px',
        threshold: 0.1,
      }
    );

    pageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToPage = (pageNum: number) => {
    const target = pageRefs.current[pageNum - 1];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNextPage = () => {
    if (activePage < PAGES.length) {
      scrollToPage(activePage + 1);
    }
  };

  const handlePrevPage = () => {
    if (activePage > 1) {
      scrollToPage(activePage - 1);
    }
  };

  return (
    <div className={cn('w-full space-y-8 font-sans pb-16', className)}>
      {/* ============================================================
          TOP CONTROL & METADATA BAR
          ============================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: EASE }}
        className="w-full rounded-2xl bg-white/95 backdrop-blur-md border border-[#E5D7C5] shadow-[0_2px_8px_rgba(26,26,26,0.05),inset_0_1px_0_#FFFFFF] p-4 sm:p-5"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Document Header & Attribution */}
          <div className="flex items-start gap-3.5">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF3EA] hover:bg-[#F3E7D7] border border-[#E5D7C5] text-xs font-bold text-[#6E6258] hover:text-[#1A1A1A] transition-all cursor-pointer shadow-xs shrink-0 mt-0.5"
              title="Return to Home"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Link>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-sm sm:text-base md:text-lg font-black text-[#1A1A1A] tracking-tight leading-snug">
                  Horizon: Dependency-Aware Autonomous Infrastructure Recovery
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EBF1FA] text-[#0047AB] border border-[#0047AB]/20">
                  <BookOpen className="w-3 h-3" />
                  PATENT DISCLOSURE
                </span>
              </div>
              <p className="text-xs text-[#6E6258] font-medium leading-relaxed">
                Architecture, Prior-Art Analysis and Patentability Assessment &bull; <span className="font-semibold text-[#1A1A1A]">Sarthak Tulsidas Patil, Karan Verma, Sneha Sharma, Sneha Patidar</span> (October 2026)
              </p>
            </div>
          </div>

          {/* Quick Page Jump & Display Toggles */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
            {/* Direct Page Jump Buttons */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-[#FAF3EA] border border-[#E5D7C5]">
              <span className="text-[10px] font-mono font-bold text-[#8A7B6D] px-1.5">PAGE:</span>
              {PAGES.map((page) => (
                <button
                  key={page.pageNumber}
                  onClick={() => scrollToPage(page.pageNumber)}
                  className={cn(
                    'w-6 h-6 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center',
                    activePage === page.pageNumber
                      ? 'bg-[#0047AB] text-white shadow-xs'
                      : 'text-[#6E6258] hover:text-[#1A1A1A] hover:bg-white/80'
                  )}
                  title={`Jump to Page ${page.pageNumber}: ${page.title}`}
                >
                  {page.pageNumber}
                </button>
              ))}
            </div>

            {/* Reading Width Toggle */}
            <button
              onClick={() => setIsWideMode((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF3EA] border border-[#E5D7C5] text-xs font-bold text-[#555555] hover:text-[#1A1A1A] transition-colors cursor-pointer shadow-xs"
              title={isWideMode ? 'Switch to Standard Reading Width' : 'Switch to Wide Reading Mode'}
            >
              {isWideMode ? <Minimize2 className="w-3.5 h-3.5 text-[#0047AB]" /> : <Maximize2 className="w-3.5 h-3.5 text-[#0047AB]" />}
              <span className="hidden lg:inline">{isWideMode ? 'Standard Width' : 'Expand Width'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ============================================================
          CONTINUOUS DOCUMENT PAGES STREAM (BLENDED INTO PAGE)
          ============================================================ */}
      <div
        className={cn(
          'mx-auto space-y-10 sm:space-y-14 transition-all duration-300',
          isWideMode ? 'max-w-5xl' : 'max-w-3xl'
        )}
      >
        {PAGES.map((page, index) => (
          <motion.article
            key={page.pageNumber}
            ref={(el) => {
              pageRefs.current[index] = el;
            }}
            data-page-index={page.pageNumber}
            id={`page-${page.pageNumber}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.38, ease: EASE }}
            className="group relative"
          >
            {/* Physical Paper Sheet Container */}
            <div className="rounded-2xl sm:rounded-3xl bg-white border border-[#E0D2BF] shadow-[0_4px_32px_rgba(26,26,26,0.06),0_1px_3px_rgba(26,26,26,0.04),inset_0_1px_0_#FFFFFF] overflow-hidden transition-shadow hover:shadow-[0_8px_40px_rgba(26,26,26,0.09)]">
              {/* Paper Sheet Header Bar */}
              <div className="px-5 py-3 sm:py-3.5 border-b border-[#F0E6D8] bg-[#FCF8F2] flex items-center justify-between text-xs font-mono text-[#8A7B6D] select-none">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0047AB]" />
                  <span className="font-bold text-[#1A1A1A]">HORIZON PATENT DISCLOSURE</span>
                  <span className="text-[#C2B5A5] hidden sm:inline">&bull;</span>
                  <span className="text-[#6E6258] hidden sm:inline">{page.title}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#E5D7C5] text-[11px] font-bold text-[#0047AB] shadow-2xs">
                    Page {page.pageNumber} of {PAGES.length}
                  </span>
                </div>
              </div>

              {/* Rendered PDF Page Image */}
              <div className="p-2 sm:p-4 md:p-6 bg-white flex justify-center">
                <img
                  src={page.src}
                  alt={`Horizon Research Paper & Patent Disclosure — Page ${page.pageNumber}: ${page.title}`}
                  className="w-full h-auto object-contain select-auto rounded-lg"
                  loading={index < 2 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </div>

              {/* Running Footer Note */}
              <div className="px-5 py-2.5 border-t border-[#F0E6D8] bg-[#FAF4EC] flex items-center justify-between text-[10px] font-mono text-[#A09080]">
                <span>CONFIDENTIAL &bull; PRIOR-ART & PATENTABILITY ASSESSMENT</span>
                <span>OCTOBER 2026</span>
              </div>
            </div>

            {/* Seamless Visual Page Connector */}
            {page.pageNumber < PAGES.length && (
              <div className="flex justify-center items-center py-4 select-none" aria-hidden="true">
                <div className="h-6 w-[1px] bg-[#D8C7B2]" />
              </div>
            )}
          </motion.article>
        ))}
      </div>

      {/* ============================================================
          FLOATING MINIMALIST PAGE NAVIGATOR PILL
          ============================================================ */}
      <aside aria-label="Page navigation" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A1A1A]/95 text-white backdrop-blur-xl border border-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.35)] text-xs font-mono">
          <button
            onClick={handlePrevPage}
            disabled={activePage === 1}
            className="p-1 rounded-full hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          <span className="font-bold tracking-wider px-1 text-[11px]">
            {activePage} <span className="text-zinc-500">/</span> {PAGES.length}
          </span>

          <button
            onClick={handleNextPage}
            disabled={activePage === PAGES.length}
            className="p-1 rounded-full hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Next Page"
            aria-label="Next Page"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <div className="h-3 w-[1px] bg-white/20 mx-1 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-1">
            {PAGES.map((page) => (
              <button
                key={page.pageNumber}
                onClick={() => scrollToPage(page.pageNumber)}
                className={cn(
                  'w-5 h-5 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center',
                  activePage === page.pageNumber
                    ? 'bg-[#0047AB] text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                )}
                title={`Page ${page.pageNumber}`}
              >
                {page.pageNumber}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default PatentsPage;
