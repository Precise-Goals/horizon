import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
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
        'relative overflow-hidden rounded-[20px] bg-white border border-[#E5E5E5] p-6 sm:p-8 text-[#0A0A0A]',
        'transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D4D4D4] hover:shadow-[0_1px_2px_rgba(0,0,0,.04),0_8px_24px_rgba(0,0,0,.04)]',
        glow && 'border-[#2DD4BF]/60 shadow-[0_4px_24px_-2px_rgba(45,212,191,0.15)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
