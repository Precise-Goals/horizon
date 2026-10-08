import React from 'react';
import { Card } from '../common/Card';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
  // Generate SVG path for sparkline
  const minVal = Math.min(...sparkline);
  const maxVal = Math.max(...sparkline);
  const range = maxVal - minVal || 1;
  const width = 120;
  const height = 36;
  const padding = 4;

  const points = sparkline.map((val, idx) => {
    const x = padding + (idx / (sparkline.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((val - minVal) / range) * (height - 2 * padding);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = points.length > 0 ? `M ${points.join(' L ')}` : '';
  const areaD = points.length > 0
    ? `M ${points[0]} L ${points.join(' L ')} L ${points[points.length - 1].split(',')[0]},${height} L ${points[0].split(',')[0]},${height} Z`
    : '';

  const gradientId = `spark-grad-${title.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <Card
      className={cn(
        "p-4 sm:p-5 flex flex-col justify-between group relative overflow-hidden transition-all duration-300 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10",
        className
      )}
    >
      {/* Top Specular Sheen */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* Header Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#A3ADC2] uppercase tracking-wider">
            {title}
          </span>
          {badge && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
              {badge}
            </span>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#1E6BFF] group-hover:bg-blue-500/10 group-hover:border-blue-500/30 group-hover:text-blue-400 group-hover:scale-105 transition-all">
            {icon}
          </div>
        )}
      </div>

      {/* Metric Value & Sparkline Row */}
      <div className="flex items-baseline justify-between gap-2 my-1">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FFF8F0] font-mono">
          {value}
        </div>

        {/* Shadcn UI Style SVG Sparkline */}
        <div className="w-[100px] h-[32px] flex items-center justify-end overflow-hidden opacity-85 group-hover:opacity-100 transition-opacity">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? '#1E6BFF' : '#EF4444'} stopOpacity="0.35" />
                <stop offset="100%" stopColor={isPositive ? '#1E6BFF' : '#EF4444'} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={areaD}
              fill={`url(#${gradientId})`}
            />
            <path
              d={pathD}
              fill="none"
              stroke={isPositive ? '#3B82F6' : '#EF4444'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Footer Info Row */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[11px]">
        {trend ? (
          <div
            className={`inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded-md ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-300 border border-red-500/20'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-400" />
            )}
            <span>{trend}</span>
          </div>
        ) : (
          <span className="text-[#6E7A94] font-mono">{subtitle || 'Live Telemetry'}</span>
        )}

        {subtitle && trend && (
          <span className="text-[10px] text-[#6E7A94] truncate max-w-[140px]">{subtitle}</span>
        )}
      </div>
    </Card>
  );
};
