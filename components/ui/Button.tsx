'use client';

import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger-ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const variantClass: Record<Variant, string> = {
  primary:
    'bg-brand-primary text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'bg-white text-text-primary border border-border font-medium hover:bg-slate-50 disabled:opacity-50',
  ghost: 'bg-transparent text-text-secondary font-medium hover:bg-slate-100 disabled:opacity-50',
  'danger-ghost': 'bg-transparent text-status-error-text font-medium hover:bg-status-error-bg',
};

export function Button({ variant = 'secondary', fullWidth, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'h-10 rounded-lg px-4 text-sm transition-colors',
        variantClass[variant],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    />
  );
}
