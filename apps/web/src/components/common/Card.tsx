import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = false,
  ...props
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#0D121D]/75 backdrop-blur-xl border border-white/[0.08] shadow-xl shadow-black/40 transition-all duration-300 hover:border-white/[0.16] hover:bg-[#111726]/80 ${glow ? 'shadow-blue-500/10 border-blue-500/30' : ''} ${className}`}
      {...props}
    >
      {/* Subtle top specular accent line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {children}
    </div>
  );
};
