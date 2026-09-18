'use client';

import { cn } from '@/lib/cn';

interface FilterPillProps {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}

export function FilterPill({ label, count, active, onClick }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-md px-2.5 py-1 text-[13px] font-semibold transition-colors',
        active ? 'bg-brand-primary text-white' : 'bg-background text-text-secondary hover:bg-slate-200'
      )}
    >
      {label}
      {typeof count === 'number' && <span className="ml-1">{count}</span>}
    </button>
  );
}
