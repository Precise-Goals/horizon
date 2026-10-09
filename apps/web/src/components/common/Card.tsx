import React from 'react';
import { cn } from '../../lib/utils';

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
      className={cn(
        'relative overflow-hidden rounded-[2rem] sm:rounded-[2.25rem] bg-[#FFFFFF] border border-[rgba(26,26,26,0.11)]',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_1px_3px_rgba(26,26,26,0.05),0_8px_24px_-4px_rgba(26,26,26,0.06)]',
        'transition-all duration-200 hover:border-[#0047AB]/30 hover:shadow-[inset_0_1px_0_#FFFFFF,0_2px_6px_rgba(26,26,26,0.06),0_12px_32px_-4px_rgba(0,71,171,0.12)]',
        glow && 'border-[#0047AB]/40 shadow-[0_4px_24px_-2px_rgba(0,71,171,0.18)]',
        className
      )}
      {...props}
    >
      {/* Top subtle porcelain highlight bevel */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
      {children}
    </div>
  );
};
