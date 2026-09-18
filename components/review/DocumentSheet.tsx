// 검토 탭 중앙 시트 — 읽기 전용 렌더 + 인라인 하이라이트. docs/ui_ux.md §3.3, §4
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDraftStore, findScene } from '@/stores/useDraftStore';
import { useIssueStore } from '@/stores/useIssueStore';
import { buildHighlightSegments } from '@/lib/highlightMatch';
import { cn } from '@/lib/cn';
import type { IssueItem } from '@/types';

const HIGHLIGHT_CLASS: Record<IssueItem['type'], string> = {
  INTERNAL_CONTRADICTION: 'bg-status-error-bg decoration-red-500',
  DIVERGENCE: 'bg-status-warning-bg decoration-amber-500',
  INFO: 'bg-blue-50 decoration-blue-400',
};

export function DocumentSheet() {
  const project = useDraftStore((s) => s.project);
  const selectedChapterId = useDraftStore((s) => s.selectedChapterId);
  const selectedSceneId = useDraftStore((s) => s.selectedSceneId);
  const issues = useIssueStore((s) => s.issues);
  const selectedIssueId = useIssueStore((s) => s.selectedIssueId);
  const selectIssue = useIssueStore((s) => s.selectIssue);

  const activeIssue = issues.find((i) => i.id === selectedIssueId) ?? null;
  const displayChapterId = activeIssue?.chapterId ?? selectedChapterId;
  const displaySceneId = activeIssue?.sceneId ?? selectedSceneId;
  const { chapter, scene } = findScene(project, displayChapterId, displaySceneId);

  if (!chapter || !scene) {
    return <div className="flex h-full items-center justify-center text-text-tertiary">장면을 찾을 수 없습니다.</div>;
  }

  const sceneIssues = issues.filter(
    (i) => i.chapterId === displayChapterId && i.sceneId === displaySceneId
  );
  const currentIndex = sceneIssues.findIndex((i) => i.id === selectedIssueId);

  const goTo = (delta: number) => {
    if (sceneIssues.length === 0) return;
    const nextIndex = (currentIndex + delta + sceneIssues.length) % sceneIssues.length;
    selectIssue(sceneIssues[nextIndex].id);
  };

  const segments = buildHighlightSegments(scene.content, sceneIssues);
  const hasRenderedHighlight = segments.some((seg) => seg.issueId);

  return (
    <div className="flex h-full flex-col items-center overflow-y-auto bg-background px-6 py-6">
      <div className="w-full max-w-[720px] rounded-t-xl bg-surface p-10 shadow-sheet">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-[15px] font-bold text-text-primary">
            {chapter.title} - {scene.title}
          </h2>
          {sceneIssues.length > 1 && (
            <div className="flex items-center gap-3 text-xs text-text-secondary">
              <button onClick={() => goTo(-1)} className="flex items-center gap-1 hover:text-brand-primary">
                <ChevronLeft size={14} /> 이전 구절
              </button>
              <button onClick={() => goTo(1)} className="flex items-center gap-1 hover:text-brand-primary">
                다음 구절 <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {scene.content.trim().length === 0 ? (
          <p className="text-sm text-text-tertiary">아직 작성된 본문이 없습니다.</p>
        ) : (
          <p className="prose-manuscript text-text-primary">
            {segments.map((segment, index) =>
              segment.issueId ? (
                <mark
                  key={index}
                  onClick={() => selectIssue(segment.issueId)}
                  className={cn(
                    'highlight-issue rounded-sm px-0.5',
                    HIGHLIGHT_CLASS[issues.find((i) => i.id === segment.issueId)?.type ?? 'INFO'],
                    segment.issueId === selectedIssueId && 'ring-1 ring-brand-primary'
                  )}
                >
                  {segment.text}
                </mark>
              ) : (
                <span key={index}>{segment.text}</span>
              )
            )}
          </p>
        )}

        {sceneIssues.length > 0 && !hasRenderedHighlight && (
          <p className="mt-4 text-sm text-text-tertiary">
            이 장면에 관련 구절이 없습니다.{' '}
            <button onClick={() => selectIssue(null)} className="text-brand-primary underline">
              전체 목록으로 이동
            </button>
          </p>
        )}
      </div>

      <div className="w-full max-w-[720px] rounded-b-xl border-t border-status-warning-border bg-status-warning-bg px-6 py-3">
        <p className="text-xs text-amber-800">⚠ 원고 수정 시 검증 결과가 실시간으로 재평가됩니다.</p>
      </div>
    </div>
  );
}
