import React from 'react';
import { cn } from '../../lib/utils';

export type BadgeStatus = 'healthy' | 'degraded' | 'down' | 'recovering' | 'info' | 'critical' | 'warning' | 'approved' | 'pending';

export interface BadgeProps {
  status?: BadgeStatus;
  children: React.ReactNode;
  className?: string;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  status = 'info',
  children,
  className = '',
  pulse = false,
}) => {
  const statusMap: Record<BadgeStatus, { dot: string; text: string }> = {
    healthy: {
      dot: 'bg-[#10B981]',
      text: 'text-[#0A0A0A]',
    },
    degraded: {
      dot: 'bg-[#F59E0B]',
      text: 'text-[#0A0A0A]',
    },
    down: {
      dot: 'bg-[#EF4444]',
      text: 'text-[#EF4444]',
    },
    recovering: {
      dot: 'bg-[#2DD4BF]',
      text: 'text-[#0A0A0A]',
    },
    critical: {
      dot: 'bg-[#EF4444]',
      text: 'text-[#EF4444]',
    },
    warning: {
      dot: 'bg-[#F59E0B]',
      text: 'text-[#0A0A0A]',
    },
    approved: {
      dot: 'bg-[#2DD4BF]',
      text: 'text-[#0A0A0A]',
    },
    pending: {
      dot: 'bg-[#A3A3A3]',
      text: 'text-[#6B6B6B]',
    },
    info: {
      dot: 'bg-[#2DD4BF]',
      text: 'text-[#0A0A0A]',
    },
  };

  const current = statusMap[status] || statusMap.info;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5E5E5] font-mono text-[11px] font-medium tracking-[0.12em] uppercase select-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]',
        current.text,
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full flex-shrink-0',
          current.dot,
          (pulse || status === 'recovering') && 'animate-pulse'
        )}
      />
      <span>{children}</span>
    </span>
  );
};

export default Badge;
