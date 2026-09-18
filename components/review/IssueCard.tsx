// IssueCard — DESIGN.md §6 (82px, 상태 도트+타입 라벨 / 제목 / 위치)
'use client';

import { cn } from '@/lib/cn';
import { useDraftStore } from '@/stores/useDraftStore';
import { TypeBadge, StatusBadge } from '@/components/ui/Badge';
import type { IssueItem } from '@/types';

export function IssueCard({
  issue,
  isSelected,
  onSelect,
}: {
  issue: IssueItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const project = useDraftStore((s) => s.project);
  const chapter = project.chapters.find((c) => c.id === issue.chapterId);
  const scene = chapter?.scenes.find((s) => s.id === issue.sceneId);

  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex w-full flex-col gap-1 rounded-lg border border-transparent bg-surface p-3 text-left transition-shadow',
        isSelected ? 'shadow-[inset_0_0_0_1.5px_#4F46E5]' : 'hover:bg-background'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <TypeBadge type={issue.type} />
        {issue.status !== 'UNRESOLVED' && <StatusBadge status={issue.status} />}
      </div>
      <p className="truncate text-[13px] font-semibold text-text-primary">{issue.title}</p>
      <p className="truncate text-[11px] text-text-secondary">
        {chapter?.title ?? issue.chapterId} · {scene?.title ?? issue.sceneId}
      </p>
    </button>
  );
}
