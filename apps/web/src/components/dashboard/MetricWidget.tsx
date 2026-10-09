import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MetricWidgetProps {
  title:      string;
  value:      string | number;
  trend?:     string;
  isPositive?: boolean;
  icon?:      React.ReactNode;
  subtitle?:  string;
  badge?:     string;
  sparkline?: number[];
  className?: string;
}

/**
 * MetricWidget — Tactile porcelain KPI bento card with skeuomorphic sparkline well.
 * Cream background, ink black numbers, cobalt blue sparkline & accents.
 */
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
  /* ── Sparkline SVG ── */
  const W = 120;
  const H = 36;
  const PAD = 3;

  const minV  = Math.min(...sparkline);
  const maxV  = Math.max(...sparkline);
  const range = maxV - minV || 1;
  const gradId = `spark-${title.replace(/\W/g, '')}`;

  const pts = sparkline.map((v, i) => {
    const x = PAD + (i / (sparkline.length - 1)) * (W - 2 * PAD);
    const y = H - PAD - ((v - minV) / range) * (H - 2 * PAD);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const lineD = `M ${pts.join(' L ')}`;
  const areaD = pts.length
    ? `M ${pts[0]} L ${pts.join(' L ')} L ${pts[pts.length - 1].split(',')[0]},${H} L ${pts[0].split(',')[0]},${H} Z`
    : '';

  const strokeColor = isPositive ? '#0047AB' : '#DC2626';

  return (
    <motion.article
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
      className={cn(
        'horizon-metric-widget skeuo-card rounded-[2rem] sm:rounded-[2.25rem] p-5 flex flex-col justify-between gap-4 overflow-hidden',
        className
      )}
      aria-label={`Metric: ${title}`}
    >
      {/* Top row: title + icon */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-label text-[#555555] font-bold mb-0.5">{title}</p>
          {badge && (
            <span className="horizon-badge text-[#0047AB] bg-[#EBF1FA] border-[#0047AB]/20 mt-1">
              {badge}
            </span>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-xl bg-[#F4EBE0] border border-[rgba(26,26,26,0.1)] text-[#0047AB] shadow-[inset_0_1px_2px_rgba(26,26,26,0.06),0_1px_0_#FFFFFF] flex-shrink-0">
            {icon}
          </div>
        )}
      </div>

      {/* Value + skeuomorphic sparkline well */}
      <div className="flex items-end justify-between gap-2">
        <div
          className="text-3xl sm:text-4xl font-black tracking-tight text-[#1A1A1A] font-mono leading-none tabular-nums"
          aria-live="polite"
        >
          {value}
        </div>

        <div className="skeuo-well p-1 rounded-lg">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-[90px] h-[30px] flex-shrink-0"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={strokeColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0"  />
              </linearGradient>
            </defs>
            <path d={areaD} fill={`url(#${gradId})`} />
            <path
              d={lineD}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Footer: trend + subtitle */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-[rgba(26,26,26,0.08)] text-xs">
        {trend ? (
          <div
            className={cn(
              'inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md border shadow-[inset_0_1px_1px_rgba(0,0,0,0.04)]',
              isPositive
                ? 'text-[#0F8E52] bg-[#EBF7EE] border-[#0F8E52]/25'
                : 'text-[#DC2626] bg-[#FDF2F2] border-[#DC2626]/25'
            )}
          >
            {isPositive
              ? <TrendingUp  className="w-3.5 h-3.5" aria-hidden="true" />
              : <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
            }
            {trend}
          </div>
        ) : (
          <span className="text-[#666666] font-mono font-medium">{subtitle || 'Live'}</span>
        )}

        {subtitle && trend && (
          <span className="text-[#666666] font-medium truncate max-w-[160px]">{subtitle}</span>
        )}
      </div>
    </motion.article>
  );
};
