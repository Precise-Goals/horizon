import React from 'react';
import { Card } from '../common/Card';
import { cn } from '../../lib/utils';

interface MetricWidgetProps {
  title: string;
  value: string | number;
  trend?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const MetricWidget = ({ title, value, trend, icon, className }: MetricWidgetProps) => {
  return (
    <Card className={cn("flex flex-col justify-between", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase text-gray-600">{title}</h3>
        {icon && <div className="p-2 bg-[#FFF8F0] border-2 border-[#1A1A1A]">{icon}</div>}
      </div>
      <div>
        <div className="text-4xl font-black">{value}</div>
        {trend && <div className="text-sm font-bold mt-2 text-[#0047AB]">{trend}</div>}
      </div>
    </Card>
  );
};
