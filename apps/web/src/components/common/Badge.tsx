import React from 'react';

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
      bg: "bg-emerald-500/10 border-emerald-500/25 text-emerald-300 shadow-sm shadow-emerald-500/10",
      dot: "bg-emerald-400 shadow-[0_0_8px_#10B981]",
      text: "text-emerald-300",
    },
    degraded: {
      bg: "bg-amber-500/10 border-amber-500/25 text-amber-300 shadow-sm shadow-amber-500/10",
      dot: "bg-amber-400 shadow-[0_0_8px_#F59E0B]",
      text: "text-amber-300",
    },
    down: {
      bg: "bg-red-500/15 border-red-500/30 text-red-300 shadow-sm shadow-red-500/15",
      dot: "bg-red-400 shadow-[0_0_8px_#EF4444]",
      text: "text-red-300",
    },
    recovering: {
      bg: "bg-blue-500/15 border-blue-500/30 text-blue-300 shadow-sm shadow-blue-500/15",
      dot: "bg-blue-400 shadow-[0_0_8px_#1E6BFF]",
      text: "text-blue-300",
    },
    critical: {
      bg: "bg-red-500/20 border-red-500/40 text-red-200 shadow-sm shadow-red-500/20",
      dot: "bg-red-500 shadow-[0_0_8px_#EF4444]",
      text: "text-red-200",
    },
    warning: {
      bg: "bg-amber-500/15 border-amber-500/30 text-amber-200",
      dot: "bg-amber-400 shadow-[0_0_8px_#F59E0B]",
      text: "text-amber-200",
    },
    approved: {
      bg: "bg-purple-500/15 border-purple-500/30 text-purple-300",
      dot: "bg-purple-400 shadow-[0_0_8px_#A855F7]",
      text: "text-purple-300",
    },
    pending: {
      bg: "bg-sky-500/10 border-sky-500/20 text-sky-300",
      dot: "bg-sky-400",
      text: "text-sky-300",
    },
    info: {
      bg: "bg-white/[0.06] border-white/10 text-[#E2D7CB]",
      dot: "bg-[#FFF8F0]",
      text: "text-[#E2D7CB]",
    },
  };

  const current = statusMap[status] || statusMap.info;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-md select-none ${current.bg} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} ${pulse || status === 'recovering' ? 'animate-pulse' : ''}`} />
      <span>{children}</span>
    </span>
  );
};
