import React from 'react';
import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'danger' | 'success' | 'brand';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  onClick,
}) => {
  const borderVariants = {
    default: 'border-border-subtle hover:border-indigo-500/40',
    danger: 'border-red-500/40 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.1)]',
    success: 'border-emerald-500/30 bg-emerald-500/5',
    brand: 'border-indigo-500/30 bg-indigo-500/5',
  };

  const iconVariants = {
    default: 'text-indigo-400 bg-indigo-500/10',
    danger: 'text-red-400 bg-red-500/15 animate-pulse',
    success: 'text-emerald-400 bg-emerald-500/10',
    brand: 'text-blue-400 bg-blue-500/10',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'glass-panel p-5 rounded-xl transition-all duration-200 group cursor-pointer relative overflow-hidden',
        borderVariants[variant]
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400 font-mono">
          {title}
        </span>
        <div className={clsx('p-2 rounded-lg transition-transform group-hover:scale-110', iconVariants[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-3xl font-bold font-sans tracking-tight text-white">{value}</div>
        {trend && (
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {trend}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-gray-400 font-sans">{subtitle}</p>}
    </div>
  );
};
