// NoIssuePopover — DESIGN.md §2 사유 라디오 4종 + "이 구절에만 적용" 고지
'use client';

import { useState } from 'react';
import { Popover } from '@/components/ui/Popover';
import { Button } from '@/components/ui/Button';
import type { IgnoreReasonCode } from '@/types';

const REASONS: { value: IgnoreReasonCode; label: string }[] = [
  { value: 'LIE', label: '인물의 거짓말' },
  { value: 'METAPHOR', label: '회상 또는 비유' },
  { value: 'MISUNDERSTOOD', label: '문맥 오해' },
  { value: 'CUSTOM', label: '직접 입력' },
];

export function NoIssuePopover({
  trigger,
  onConfirm,
}: {
  trigger: React.ReactNode;
  onConfirm: (reasonCode: IgnoreReasonCode, reasonNote?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<IgnoreReasonCode>('LIE');
  const [customText, setCustomText] = useState('');

  const handleConfirm = () => {
    onConfirm(reason, reason === 'CUSTOM' ? customText : undefined);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} trigger={trigger}>
      <p className="mb-3 text-[13px] font-semibold text-text-primary">이번 구절은 문제없음</p>
      <div className="flex flex-col gap-2">
        {REASONS.map((r) => (
          <label key={r.value} className="flex items-center gap-2 text-[13px] text-text-primary">
            <input
              type="radio"
              name="no-issue-reason"
              checked={reason === r.value}
              onChange={() => setReason(r.value)}
              className="accent-brand-primary"
            />
            {r.label}
          </label>
        ))}
        {reason === 'CUSTOM' && (
          <input
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="사유를 입력하세요"
            className="rounded-md border border-border px-2 py-1.5 text-[13px] outline-none focus:border-brand-primary"
          />
        )}
      </div>
      <p className="mt-3 text-[11px] text-text-tertiary">
        이 구절에만 적용되며 작품 전체 설정은 변경하지 않습니다.
      </p>
      <Button variant="primary" fullWidth className="mt-3 h-9" onClick={handleConfirm}>
        확인
      </Button>
    </Popover>
  );
}
