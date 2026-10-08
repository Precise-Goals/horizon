import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 rounded-xl cursor-pointer select-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  }[size];

  const variantStyles = {
    primary: "bg-gradient-to-r from-[#1E6BFF] to-[#0047AB] text-[#FFF8F0] shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 border border-blue-400/30 hover:brightness-110",
    secondary: "bg-white/[0.06] hover:bg-white/[0.12] text-[#FFF8F0] border border-white/10 backdrop-blur-md shadow-sm hover:border-white/20",
    danger: "bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 hover:border-red-500/50 shadow-sm shadow-red-500/10",
    warning: "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 hover:border-amber-500/50 shadow-sm shadow-amber-500/10",
    outline: "bg-transparent hover:bg-[#1E6BFF]/10 text-[#1E6BFF] border border-[#1E6BFF]/40 hover:border-[#1E6BFF]",
    ghost: "bg-transparent hover:bg-white/[0.06] text-[#A3ADC2] hover:text-[#FFF8F0]",
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
