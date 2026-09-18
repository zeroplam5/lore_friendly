// SourceCard — DESIGN.md §3 검증 결과 오버플로우 결함 방어(flex-1 min-w-0 truncate)
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Citation } from '@/types';

export function SourceCard({ citation }: { citation: Citation }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-lg border border-border bg-surface">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-text-primary">
          {citation.sourceType === 'INTERNAL' ? '본 작품 내부' : '원작 자료'} — {citation.title}
        </span>
        {open ? (
          <ChevronUp size={14} className="flex-shrink-0 text-text-tertiary" />
        ) : (
          <ChevronDown size={14} className="flex-shrink-0 text-text-tertiary" />
        )}
      </button>
      {open && (
        <p className="border-t border-border px-3 py-2.5 text-[13px] leading-relaxed text-text-secondary">
          {citation.snippet}
        </p>
      )}
    </div>
  );
}
