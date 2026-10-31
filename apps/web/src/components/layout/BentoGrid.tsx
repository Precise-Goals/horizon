import React from 'react';
import { cn } from '../../lib/utils';

export const BentoGrid = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 auto-rows-min", className)}>
      {children}
    </div>
  );
};

export const BentoCard = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return (
    <div className={cn("hz-card p-5 sm:p-6 flex flex-col justify-between overflow-hidden", className)}>
      {children}
    </div>
  );
};
