import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'allow' | 'block' | 'pending' | 'running' | 'idle' | 'brand' | 'outline';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'idle',
  className,
  size = 'md',
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 font-mono rounded-md font-medium tracking-wide transition-all';
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  const variants = {
    allow: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    block: 'bg-red-500/10 text-red-400 border border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.2)] animate-pulse-border',
    pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    running: 'bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.15)]',
    idle: 'bg-gray-800/60 text-gray-400 border border-gray-700/50',
    brand: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30',
    outline: 'bg-transparent text-gray-300 border border-gray-700',
  };

  return (
    <span className={clsx(baseStyles, sizeStyles, variants[variant], className)}>
      {variant === 'allow' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
      {variant === 'block' && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />}
      {variant === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-spin" />}
      {children}
    </span>
  );
};
