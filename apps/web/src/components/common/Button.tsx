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
    'inline-flex items-center justify-center font-medium rounded-full select-none cursor-pointer disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4BF] focus-visible:ring-offset-2';

  const sizeStyles = {
    sm: 'px-4 py-1.5 text-xs gap-1.5 h-8',
    md: 'px-5 py-2.5 text-xs sm:text-sm font-medium gap-2 h-10',
    lg: 'px-7 py-3 text-sm font-semibold gap-2.5 h-12',
  }[size];

  const variantStyles = {
    primary:
      'bg-[#0A0A0A] text-white border border-[#0A0A0A] hover:bg-neutral-800 hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,.04),0_8px_24px_rgba(0,0,0,.04)] active:translate-y-0 active:bg-black',
    secondary:
      'bg-white text-[#0A0A0A] border border-[#E5E5E5] hover:bg-[#FAFAF9] hover:border-[#D4D4D4] hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,.04),0_8px_24px_rgba(0,0,0,.04)] active:translate-y-0',
    danger:
      'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:-translate-y-0.5 active:translate-y-0',
    warning:
      'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 hover:-translate-y-0.5 active:translate-y-0',
    outline:
      'bg-transparent text-[#0A0A0A] border border-[#E5E5E5] hover:bg-white hover:border-[#D4D4D4] hover:-translate-y-0.5 active:translate-y-0',
    ghost:
      'bg-transparent text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-neutral-100/60 border border-transparent',
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

export default Button;
