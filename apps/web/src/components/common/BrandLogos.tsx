import React from 'react';

export const BrandLogos: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-6 px-6 text-[#71717A] ${className}`}>
      {/* Lumenix */}
      <div className="flex items-center gap-2 font-medium text-xs tracking-tight transition-colors hover:text-black">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 3.31 1.61 6.24 4.1 8.04L18.04 6.1C16.24 3.61 13.31 2 12 2zm6.9 4.96L6.96 18.9C8.38 20.22 10.1 21 12 21c4.97 0 9-4.03 9-9 0-1.9-.78-3.62-2.1-5.04z" />
        </svg>
        <span className="font-semibold text-sm">Lumenix</span>
      </div>

      {/* Velora */}
      <div className="flex items-center gap-2 font-medium text-xs tracking-tight transition-colors hover:text-black">
        <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
          <polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
        <span className="font-semibold text-sm">Velora</span>
      </div>

      {/* Nimbus */}
      <div className="flex items-center gap-2 font-medium text-xs tracking-tight transition-colors hover:text-black">
        <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round">
          <path d="M3 10c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
          <path d="M3 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
        </svg>
        <span className="font-semibold text-sm">Nimbus</span>
      </div>

      {/* Quanta */}
      <div className="flex items-center gap-2 font-medium text-xs tracking-tight transition-colors hover:text-black">
        <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
        <span className="font-semibold text-sm">Quanta</span>
      </div>

      {/* Solstice */}
      <div className="flex items-center gap-2 font-medium text-xs tracking-tight transition-colors hover:text-black">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <polygon points="12 4 21 20 3 20" />
        </svg>
        <span className="font-semibold text-sm">Solstice</span>
      </div>

      {/* Parallax */}
      <div className="flex items-center gap-2 font-medium text-xs tracking-tight transition-colors hover:text-black">
        <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
        <span className="font-semibold text-sm">Parallax</span>
      </div>
    </div>
  );
};

export default BrandLogos;

