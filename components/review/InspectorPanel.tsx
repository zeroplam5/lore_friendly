// 검토 탭 우측 인스펙터 — docs/ui_ux.md §3.4 (TypeBadge+StatusBadge, QuoteCard, SourceCard, 액션 푸터)
'use client';

import { useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { TypeBadge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SourceCard } from './SourceCard';
import { NoIssuePopover } from './NoIssuePopover';
import { ConfirmSettingDialog } from './ConfirmSettingDialog';
import { useIssueStore } from '@/stores/useIssueStore';
import { useDraftStore } from '@/stores/useDraftStore';
import { useCanonStore } from '@/stores/useCanonStore';
import { useToast } from '@/components/ui/Toast';
import { applySuggestionSafely } from '@/lib/applySuggestion';
import type { ConfirmedSetting, IgnoreReasonCode } from '@/types';

export function InspectorPanel() {
  const issues = useIssueStore((s) => s.issues);
  const selectedIssueId = useIssueStore((s) => s.selectedIssueId);
  const updateIssueStatus = useIssueStore((s) => s.updateIssueStatus);
  const addResolution = useIssueStore((s) => s.addResolution);

  const project = useDraftStore((s) => s.project);
  const updateSceneContent = useDraftStore((s) => s.updateSceneContent);

  const addConfirmedSetting = useCanonStore((s) => s.addConfirmedSetting);
  const removeConfirmedSetting = useCanonStore((s) => s.removeConfirmedSetting);

  const { showToast } = useToast();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const issue = issues.find((i) => i.id === selectedIssueId);

  if (!issue) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-text-tertiary">
        좌측에서 쟁점을 선택하세요.
      </div>
    );
  }

  const isResolved = issue.status === 'RESOLVED' || issue.status === 'CONFIRMED';

  const handleApplySuggestion = () => {
    const chapter = project.chapters.find((c) => c.id === issue.chapterId);
    const scene = chapter?.scenes.find((s) => s.id === issue.sceneId);
    if (!scene) return;
    const nextContent = applySuggestionSafely(scene.content, issue);
    updateSceneContent(issue.chapterId, issue.sceneId, nextContent);
    updateIssueStatus(issue.id, 'RESOLVED');
    showToast({ message: '원고에 제안이 반영되었습니다.' });
  };

  const handleDefer = () => {
    updateIssueStatus(issue.id, 'DEFERRED');
    addResolution({
      issueId: issue.id,
      chapterId: issue.chapterId,
      sceneId: issue.sceneId,
      status: 'DEFERRED',
      resolvedAt: new Date().toISOString(),
    });
  };

  const handleIgnore = (reasonCode: IgnoreReasonCode, reasonNote?: string) => {
    updateIssueStatus(issue.id, 'IGNORED');
    addResolution({
      issueId: issue.id,
      chapterId: issue.chapterId,
      sceneId: issue.sceneId,
      status: 'IGNORED',
      reasonCode,
      reasonNote,
      resolvedAt: new Date().toISOString(),
    });
  };

  const handleConfirmedSetting = (setting: ConfirmedSetting) => {
    addConfirmedSetting(setting);
    updateIssueStatus(issue.id, 'CONFIRMED');
    showToast({
      message: '작품 설정으로 확정되었습니다.',
      actionLabel: '실행 취소',
      onAction: () => {
        removeConfirmedSetting(setting.id);
        updateIssueStatus(issue.id, 'UNRESOLVED');
      },
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-5">
        <div className="mb-3 flex items-center gap-2">
          <TypeBadge type={issue.type} />
          <StatusBadge status={issue.status} />
        </div>
        <h2 className="mb-4 text-[15px] font-bold text-text-primary">{issue.title}</h2>

        {isResolved ? (
          <div className="mb-4 rounded-lg border border-status-success-bg bg-status-success-bgAlt p-3">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-status-success-text">
              <CheckCircle2 size={14} />
              {issue.status === 'CONFIRMED' ? '작품 설정으로 확정됨' : '원고에 반영되어 해결됨'}
            </p>
            <button
              onClick={() => updateIssueStatus(issue.id, 'UNRESOLVED')}
              className="mt-2 flex items-center gap-1 text-xs text-text-secondary hover:text-brand-primary"
            >
              <RotateCcw size={12} /> 재검토
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 rounded-lg border border-l-[3px] border-l-brand-primary border-border bg-surface p-3">
              <p className="mb-1 text-[11px] font-semibold text-text-tertiary">현재 구절</p>
              <p className="text-[13px] text-text-primary">
                {issue.contextPrefix}
                <span className="font-semibold text-brand-primary">{issue.targetQuote}</span>
              </p>
            </div>

            <div className="mb-4">
              <p className="mb-1 text-[11px] font-semibold text-text-tertiary">검증 결과</p>
              <p className="text-[13px] leading-relaxed text-text-secondary">{issue.analysis}</p>
            </div>

            <SourceCard citation={issue.citation} />
          </>
        )}
      </div>

      {!isResolved && (
        <div className="flex min-h-[92px] flex-col gap-2 border-t border-border p-4">
          <Button variant="primary" fullWidth onClick={handleApplySuggestion}>
            원고에 제안 반영
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setConfirmDialogOpen(true)} className="flex-1">
              설정으로 확정
            </Button>
            <NoIssuePopover
              trigger={
                <Button variant="ghost" className="flex-1">
                  문제없음
                </Button>
              }
              onConfirm={handleIgnore}
            />
            <Button variant="ghost" onClick={handleDefer} className="flex-1">
              보류
            </Button>
          </div>
        </div>
      )}

      <ConfirmSettingDialog
        issue={issue}
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirmed={handleConfirmedSetting}
      />
    </div>
  );
}
