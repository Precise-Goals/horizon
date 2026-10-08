import React from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "bg-white border-[3px] border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] p-4 rounded-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
