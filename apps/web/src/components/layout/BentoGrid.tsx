import React from 'react';
import { cn } from '../../lib/utils';

export const BentoGrid = ({ className, children }: { className?: string, children: React.ReactNode }) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min", className)}>
      {children}
    </div>
  );
};
