import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MetricWidgetProps {
  title: string;
  value: string | number;
  trend?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  subtitle?: string;
  badge?: string;
  sparkline?: number[];
  className?: string;
}

export const MetricWidget: React.FC<MetricWidgetProps> = ({
  title,
  value,
  trend,
  isPositive = true,
  icon,
  subtitle,
  badge,
  sparkline = [20, 24, 22, 28, 26, 34, 32, 40],
  className,
}) => {
  const W = 110;
  const H = 32;
  const PAD = 2;

  const minV = Math.min(...sparkline);
  const maxV = Math.max(...sparkline);
  const range = maxV - minV || 1;

  const pts = sparkline.map((v, i) => {
    const x = PAD + (i / (sparkline.length - 1)) * (W - 2 * PAD);
    const y = H - PAD - ((v - minV) / range) * (H - 2 * PAD);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const lineD = `M ${pts.join(' L ')}`;

  const strokeColor = isPositive ? '#2DD4BF' : '#EF4444';

  return (
    <motion.article
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={cn(
        'horizon-metric-widget bg-white border border-[#E5E5E5] rounded-[20px] p-6 flex flex-col justify-between gap-4 text-[#0A0A0A] shadow-none hover:border-[#D4D4D4] hover:shadow-[0_1px_2px_rgba(0,0,0,.04),0_8px_24px_rgba(0,0,0,.04)] transition-all',
        className
      )}
      aria-label={`Metric: ${title}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-[12px] font-mono uppercase tracking-[0.12em] text-[#6B6B6B]">{title}</p>
          {badge && (
            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-medium text-[#0A0A0A] bg-neutral-100 border border-[#E5E5E5]">
              {badge}
            </span>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-neutral-50 text-[#0A0A0A] border border-[#E5E5E5] flex-shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-3 my-1">
        <div
          className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] font-mono leading-none tabular-nums"
          aria-live="polite"
        >
          {value}
        </div>

        <div className="p-1 rounded-md">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-[84px] h-[26px] flex-shrink-0" aria-hidden="true">
            <path
              d={lineD}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#E5E5E5] text-xs">
        {trend ? (
          <div
            className={cn(
              'inline-flex items-center gap-1 font-mono text-[11px] font-medium px-2 py-0.5 rounded-full border',
              isPositive
                ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                : 'text-red-700 bg-red-50 border-red-200'
            )}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </div>
        ) : (
          <span className="text-[#A3A3A3] font-mono text-[11px]">{subtitle || 'Live'}</span>
        )}

        {subtitle && trend && (
          <span className="text-[#6B6B6B] text-[11px] font-mono truncate max-w-[140px]">{subtitle}</span>
        )}
      </div>
    </motion.article>
  );
};

export default MetricWidget;
