// ScopeTabs — 장면/챕터/작품 전체. docs/ui_ux.md §3, DESIGN.md §6
'use client';

import { cn } from '@/lib/cn';
import type { ValidationScope } from '@/types';

const SCOPES: { value: ValidationScope; label: string }[] = [
  { value: 'SCENE', label: '장면' },
  { value: 'CHAPTER', label: '챕터' },
  { value: 'PROJECT', label: '작품 전체' },
];

export function ScopeTabs({
  value,
  onChange,
  disabled,
}: {
  value: ValidationScope;
  onChange: (scope: ValidationScope) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-border px-1">
      {SCOPES.map((scope) => (
        <button
          key={scope.value}
          disabled={disabled}
          onClick={() => onChange(scope.value)}
          className={cn(
            'relative pb-2 text-[13px] font-semibold transition-colors disabled:opacity-50',
            value === scope.value ? 'text-brand-primary' : 'text-text-secondary hover:text-text-primary'
          )}
        >
          {scope.label}
          {value === scope.value && (
            <span className="absolute -bottom-px left-0 h-[2px] w-6 rounded bg-brand-primary" />
          )}
        </button>
      ))}
    </div>
  );
}
