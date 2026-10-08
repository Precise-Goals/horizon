import React from 'react';
import { cn } from '../../lib/utils';

export type BadgeStatus = 'healthy' | 'degraded' | 'down' | 'recovering' | 'info' | 'critical' | 'warning' | 'approved' | 'pending';

interface BadgeProps {
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
  const statusMap: Record<BadgeStatus, { bg: string; dot: string; text: string }> = {
    healthy: {
      bg: 'bg-[#EBF7EE] border-[#0F8E52]/25 text-[#0A6C3D] shadow-[inset_0_1px_2px_rgba(15,142,82,0.08)]',
      dot: 'bg-emerald-500 shadow-[0_0_6px_#10B981,inset_0_1px_1px_rgba(255,255,255,0.8)]',
      text: 'text-[#0A6C3D]',
    },
    degraded: {
      bg: 'bg-[#FEF6E7] border-[#D97706]/25 text-[#B45309] shadow-[inset_0_1px_2px_rgba(217,119,6,0.08)]',
      dot: 'bg-amber-500 shadow-[0_0_6px_#F59E0B,inset_0_1px_1px_rgba(255,255,255,0.8)]',
      text: 'text-[#B45309]',
    },
    down: {
      bg: 'bg-[#FDF2F2] border-[#DC2626]/25 text-[#B91C1C] shadow-[inset_0_1px_2px_rgba(220,38,38,0.08)]',
      dot: 'bg-red-500 shadow-[0_0_6px_#EF4444,inset_0_1px_1px_rgba(255,255,255,0.8)]',
      text: 'text-[#B91C1C]',
    },
    recovering: {
      bg: 'bg-[#EFF6FF] border-[#0047AB]/25 text-[#0047AB] shadow-[inset_0_1px_2px_rgba(0,71,171,0.08)]',
      dot: 'bg-[#0047AB] shadow-[0_0_6px_#1E6BFF,inset_0_1px_1px_rgba(255,255,255,0.8)]',
      text: 'text-[#0047AB]',
    },
    critical: {
      bg: 'bg-[#FEE2E2] border-[#EF4444]/35 text-[#991B1B] shadow-[inset_0_1px_2px_rgba(239,68,68,0.1)]',
      dot: 'bg-red-600 shadow-[0_0_8px_#EF4444,inset_0_1px_1px_rgba(255,255,255,0.8)]',
      text: 'text-[#991B1B]',
    },
    warning: {
      bg: 'bg-[#FEF3C7] border-[#F59E0B]/30 text-[#92400E]',
      dot: 'bg-amber-500 shadow-[0_0_6px_#F59E0B,inset_0_1px_1px_rgba(255,255,255,0.8)]',
      text: 'text-[#92400E]',
    },
    approved: {
      bg: 'bg-[#F5F3FF] border-[#7C3AED]/25 text-[#6D28D9]',
      dot: 'bg-purple-500 shadow-[0_0_6px_#A855F7,inset_0_1px_1px_rgba(255,255,255,0.8)]',
      text: 'text-[#6D28D9]',
    },
    pending: {
      bg: 'bg-[#F0F9FF] border-[#0284C7]/25 text-[#0369A1]',
      dot: 'bg-sky-500',
      text: 'text-[#0369A1]',
    },
    info: {
      bg: 'bg-[#F4EBE0] border-[rgba(26,26,26,0.12)] text-[#1A1A1A] shadow-[inset_0_1px_2px_rgba(26,26,26,0.05),0_1px_0_#FFFFFF]',
      dot: 'bg-[#1A1A1A]',
      text: 'text-[#1A1A1A]',
    },
  };

  const current = statusMap[status] || statusMap.info;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border select-none',
        current.bg,
        className
      )}
    >
      <span
        className={cn(
          'w-2 h-2 rounded-full flex-shrink-0',
          current.dot,
          (pulse || status === 'recovering') && 'animate-pulse'
        )}
      />
      <span>{children}</span>
    </span>
  );
};
