import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: 'healthy' | 'degraded' | 'down' | 'recovering' | 'high-risk' | 'approved';
}

export const Badge = ({ className, status = 'healthy', children, ...props }: BadgeProps) => {
  const styles = {
    healthy: "bg-[#22C55E] text-black",
    degraded: "bg-[#F59E0B] text-black",
    down: "bg-[#EF4444] text-white",
    recovering: "bg-[#0047AB] text-white",
    'high-risk': "bg-[#EF4444] text-white border-dashed",
    approved: "bg-[#22C55E] text-black"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 font-bold text-xs border-2 border-[#1A1A1A] uppercase tracking-wide",
        styles[status],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
