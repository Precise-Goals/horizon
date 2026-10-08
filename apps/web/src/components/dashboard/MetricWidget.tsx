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
 * MetricWidget — KPI bento card with sparkline and trend indicator.
 * Lives in the dashboard header row.
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

  const strokeColor = isPositive ? '#3B82F6' : '#EF4444';
  const fillColor   = isPositive ? 'rgba(59,130,246,0.15)' : 'rgba(239,68,68,0.15)';

  return (
    <motion.article
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
      className={cn(
        'horizon-metric-widget bento-card p-5 flex flex-col justify-between gap-4 overflow-hidden',
        className
      )}
      aria-label={`Metric: ${title}`}
    >
      {/* Top row: title + icon */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-label text-[#8896A8] mb-0.5">{title}</p>
          {badge && (
            <span className="horizon-badge text-blue-300 bg-blue-500/10 border-blue-500/20 mt-1">
              {badge}
            </span>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[#8896A8] flex-shrink-0">
            {icon}
          </div>
        )}
      </div>

      {/* Value + sparkline */}
      <div className="flex items-end justify-between gap-2">
        <div
          className="text-3xl font-bold tracking-tight text-[#FFF8F0] font-mono leading-none tabular-nums"
          aria-live="polite"
        >
          {value}
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-[90px] h-[30px] flex-shrink-0 opacity-80"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={strokeColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0"   />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#${gradId})`} />
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

      {/* Footer: trend + subtitle */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/[0.05] text-xs">
        {trend ? (
          <div
            className={cn(
              'inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md',
              isPositive
                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                : 'text-red-400 bg-red-500/10 border border-red-500/20'
            )}
          >
            {isPositive
              ? <TrendingUp  className="w-3 h-3" aria-hidden="true" />
              : <TrendingDown className="w-3 h-3" aria-hidden="true" />
            }
            {trend}
          </div>
        ) : (
          <span className="text-[#6B7A8D] font-mono">{subtitle || 'Live'}</span>
        )}

        {subtitle && trend && (
          <span className="text-[#6B7A8D] truncate max-w-[160px]">{subtitle}</span>
        )}
      </div>
    </motion.article>
  );
};
