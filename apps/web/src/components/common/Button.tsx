import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-150 select-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:translate-y-[1px]';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'px-4 py-2 text-sm gap-2 rounded-xl',
    lg: 'px-6 py-3 text-base gap-2.5 rounded-2xl',
  }[size];

  const variantStyles = {
    primary:
      'bg-gradient-to-b from-[#1A62D6] to-[#0047AB] text-[#FFF8F0] border border-[#003680] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_4px_rgba(0,71,171,0.25),0_6px_16px_-2px_rgba(0,71,171,0.25)] hover:from-[#246DE0] hover:to-[#0050BD] active:shadow-[inset_0_2px_4px_rgba(0,20,60,0.5)]',
    secondary:
      'bg-gradient-to-b from-[#FFFFFF] to-[#F5EDE2] text-[#1A1A1A] border border-[rgba(26,26,26,0.18)] shadow-[inset_0_1px_0_#FFFFFF,0_1px_3px_rgba(26,26,26,0.08)] hover:from-[#FFFFFF] hover:to-[#EFE5D7] hover:border-[#0047AB]/40 hover:text-[#0047AB] active:bg-[#EAE0D1] active:shadow-[inset_0_2px_3px_rgba(26,26,26,0.12)]',
    danger:
      'bg-gradient-to-b from-[#EF4444] to-[#B91C1C] text-[#FFF8F0] border border-[#991B1B] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_4px_rgba(220,38,38,0.25)] hover:brightness-105 active:shadow-[inset_0_2px_4px_rgba(60,0,0,0.5)]',
    warning:
      'bg-gradient-to-b from-[#F59E0B] to-[#B45309] text-[#FFF8F0] border border-[#92400E] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_4px_rgba(217,119,6,0.25)] hover:brightness-105 active:shadow-[inset_0_2px_4px_rgba(60,30,0,0.5)]',
    outline:
      'bg-transparent text-[#0047AB] border-2 border-[#0047AB]/40 hover:border-[#0047AB] hover:bg-[#0047AB]/05 active:bg-[#0047AB]/10',
    ghost:
      'bg-transparent text-[#555555] hover:text-[#1A1A1A] hover:bg-[#F3E9DD] border border-transparent hover:border-[rgba(26,26,26,0.08)]',
  }[variant];

  return (
    <button
      className={cn(baseStyles, sizeStyles, variantStyles, className)}
      {...props}
    >
      {children}
    </button>
  );
};
