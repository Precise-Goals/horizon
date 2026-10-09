import React from 'react';
import { motion, type BezierDefinition } from 'framer-motion';
import { Link } from 'react-router';
import { Download, ExternalLink, FileText, ArrowLeft, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

const EASE: BezierDefinition = [0.16, 1, 0.3, 1];

interface PatentsPageProps {
  className?: string;
}

/**
 * PatentsPage — Embedded PDF article for freely scrolling through research.pdf.
 * Provides a native document reader experience with quick download and pop-out controls.
 */
export const PatentsPage: React.FC<PatentsPageProps> = ({ className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className={cn('w-full space-y-4 font-sans', className)}
    >
      {/* Document Reader Controls Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-[#E5D7C5] shadow-[0_2px_8px_rgba(26,26,26,0.06),inset_0_1px_0_#FFFFFF]">
        {/* Left: Navigation and Document Metadata */}
        <div className="flex items-center gap-3.5">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF3EA] hover:bg-[#F3E7D7] border border-[#E5D7C5] text-xs font-bold text-[#6E6258] hover:text-[#1A1A1A] transition-all cursor-pointer shadow-xs"
            title="Return to Home"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#0047AB] text-white shadow-sm flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>

            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-[#1A1A1A] tracking-tight leading-none">
                  Horizon: Dependency-Aware Autonomous Infrastructure Recovery
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EBF7EE] text-[#0F8E52] border border-[#0F8E52]/20">
                  <ShieldCheck className="w-3 h-3" />
                  PATENT DISCLOSURE
                </span>
              </div>
              <p className="text-xs text-[#6E6258] font-medium">
                Technical Research Paper &bull; <span className="font-mono text-[#0047AB]">research.pdf</span> (384 KB) &bull; October 2026
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions (Download & Pop-out) */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
          <a
            href="/research.pdf"
            download="research.pdf"
            className="skeuo-btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            title="Download research.pdf to your device"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </a>

          <a
            href="/research.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="skeuo-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#1A1A1A] cursor-pointer"
            title="Open research.pdf in full browser window"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#0047AB]" />
            <span className="hidden md:inline">Open Fullscreen</span>
          </a>
        </div>
      </div>

      {/* Embedded PDF Article — Freely Scrolling Document Viewer */}
      <div className="w-full h-[calc(100vh-220px)] min-h-[760px] lg:min-h-[920px] rounded-2xl overflow-hidden border border-[#D5C5B2] shadow-[0_8px_32px_rgba(26,26,26,0.10),inset_0_1px_0_#FFFFFF] bg-[#2A2A2A]">
        <iframe
          src="/research.pdf#toolbar=1&navpanes=0&scrollbar=1&view=FitH"
          title="Horizon: Dependency-Aware Autonomous Infrastructure Recovery — Research Paper & Patent Disclosure"
          className="w-full h-full border-0 block"
        />
      </div>

      {/* Footer Attribution Note */}
      <div className="px-2 py-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-[#8A7B6D]">
        <div>
          Authored by Sarthak Tulsidas Patil, Karan Verma, Sneha Sharma, Sneha Patidar
        </div>
        <div>
          Permanent Static Asset &bull; <code className="text-[#0047AB]">public/research.pdf</code>
        </div>
      </div>
    </motion.div>
  );
};
