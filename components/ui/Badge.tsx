// TypeBadge / StatusBadge — docs/ui_ux.md §1.1 상태 색, DESIGN.md §9(이모지 대신 컬러 도트 권장) 반영
import { cn } from '@/lib/cn';
import type { IssueStatus, IssueType } from '@/types';

const TYPE_META: Record<IssueType, { label: string; dot: string; text: string }> = {
  INTERNAL_CONTRADICTION: { label: '작품 내부 모순', dot: 'bg-status-error-text', text: 'text-status-error-text' },
  DIVERGENCE: { label: '원작과 차이', dot: 'bg-amber-500', text: 'text-status-warning-text' },
  INFO: { label: '확인 필요', dot: 'bg-status-info-text', text: 'text-status-info-text' },
};

export function TypeBadge({ type, className }: { type: IssueType; className?: string }) {
  const meta = TYPE_META[type];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded bg-background px-2 py-1 text-[11px] font-semibold',
        meta.text,
        className
      )}
    >
      <span className={cn('h-[5px] w-[5px] rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}

const STATUS_META: Record<IssueStatus, { label: string; className: string }> = {
  UNRESOLVED: { label: '미해결', className: 'text-text-secondary bg-background' },
  DEFERRED: { label: '보류', className: 'text-status-info-text bg-blue-50' },
  RESOLVED: { label: '✓ 해결됨', className: 'text-status-success-text bg-status-success-bg' },
  CONFIRMED: { label: '✓ 해결됨', className: 'text-status-success-text bg-status-success-bg' },
  IGNORED: { label: '무시됨', className: 'text-text-tertiary bg-background' },
};

export function StatusBadge({ status, className }: { status: IssueStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn('inline-flex items-center rounded px-2 py-1 text-[11px] font-semibold', meta.className, className)}
    >
      {meta.label}
    </span>
  );
}
