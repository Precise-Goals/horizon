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
  className?: string;
}

export const MetricWidget: React.FC<MetricWidgetProps> = ({
  title,
  value,
  trend,
  isPositive = true,
  icon,
  subtitle,
  className,
}) => {
  return (
    <Card className={cn("p-5 flex flex-col justify-between group", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[#A3ADC2] uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#1E6BFF] shadow-sm shadow-blue-500/10 group-hover:scale-105 transition-transform">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-3xl font-bold tracking-tight text-[#FFF8F0] font-mono">
          {value}
        </div>
        
        <div className="flex items-center justify-between pt-1">
          {trend ? (
            <div
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
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
            <span className="text-xs text-[#6E7A94]">{subtitle}</span>
          )}
        </div>
      </div>
    </Card>
  );
};
