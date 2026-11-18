import React from 'react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  colorVariant?: 'indigo' | 'amber' | 'blue' | 'emerald';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  colorVariant = 'indigo',
  onClick,
}) => {
  const colorStyles = {
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      badgeBg: 'text-indigo-700 bg-indigo-50/70',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      badgeBg: 'text-amber-700 bg-amber-50/70',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      badgeBg: 'text-blue-700 bg-blue-50/70',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badgeBg: 'text-emerald-700 bg-emerald-50/70',
    },
  };

  const style = colorStyles[colorVariant];

  return (
    <Card
      onClick={onClick}
      className={cn(
        'p-5 transition-all hover:border-slate-300 hover:shadow-xs relative overflow-hidden',
        onClick && 'cursor-pointer'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </span>
            {trend && (
              <span
                className={cn(
                  'text-[11px] font-semibold px-1.5 py-0.5 rounded-md',
                  trend.isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-100'
                )}
              >
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 pt-0.5">{subtitle}</p>}
        </div>

        <div
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center border shrink-0',
            style.iconBg
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};
