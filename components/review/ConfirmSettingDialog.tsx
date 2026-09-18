// ConfirmSettingDialog — DESIGN.md §2 confirm-setting-dialog (5필드 + AI 제안 배지)
'use client';

import { useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useDraftStore, findScene } from '@/stores/useDraftStore';
import { useCanonStore, useAllBaselines, getEffectiveBaselines } from '@/stores/useCanonStore';
import type { ConfirmedSetting, IssueItem } from '@/types';

const AiTag = () => (
  <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold text-brand-primary">
    AI 제안
  </span>
);

const SCOPE_OPTIONS: { value: ConfirmedSetting['targetScope']; label: string }[] = [
  { value: 'PROJECT', label: '작품 전체' },
  { value: 'CHAPTER', label: '이 챕터만' },
  { value: 'SCENE', label: '이 장면만' },
];

export function ConfirmSettingDialog({
  issue,
  open,
  onOpenChange,
  onConfirmed,
}: {
  issue: IssueItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmed: (setting: ConfirmedSetting) => void;
}) {
  const project = useDraftStore((s) => s.project);
  const confirmedSettings = useCanonStore((s) => s.confirmedSettings);
  const allBaselines = useAllBaselines();
  const { chapter, scene } = findScene(project, issue.chapterId, issue.sceneId);
  const effectiveBaselines = useMemo(
    () => getEffectiveBaselines(allBaselines, confirmedSettings),
    [allBaselines, confirmedSettings]
  );

  const suggestedBaseline = effectiveBaselines.find(
    (b) => issue.citation.sourceType === 'CANON' && issue.citation.snippet.includes(b.citationText.slice(0, 10))
  );

  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.analysis);
  const [targetScope, setTargetScope] = useState<ConfirmedSetting['targetScope']>('PROJECT');
  const [maintainCondition, setMaintainCondition] = useState('');
  const [replacesBaselineId, setReplacesBaselineId] = useState(suggestedBaseline?.id ?? '');
  const [authorNote, setAuthorNote] = useState('');

  const handleSubmit = () => {
    const setting: ConfirmedSetting = {
      id: `conf-${Date.now()}`,
      replacesBaselineId: replacesBaselineId || undefined,
      title,
      description,
      targetScope,
      chapterId: targetScope !== 'PROJECT' ? issue.chapterId : undefined,
      sceneId: targetScope === 'SCENE' ? issue.sceneId : undefined,
      effectiveFromSceneId: issue.sceneId,
      maintainCondition: maintainCondition || undefined,
      status: 'APPROVED',
      confirmedAt: new Date().toISOString(),
      authorNote,
    };
    onConfirmed(setting);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="작품 설정으로 확정" description="이 변경을 앞으로의 검증 기준에 반영합니다.">
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-[12px] font-semibold text-text-secondary">변경 내용</label>
            <AiTag />
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-border px-2.5 py-2 text-[13px] outline-none focus:border-brand-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-[12px] font-semibold text-text-secondary">설정 이름</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-border px-2.5 py-2 text-[13px] outline-none focus:border-brand-primary"
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-[12px] font-semibold text-text-secondary">적용 대상</label>
            <AiTag />
          </div>
          <div className="flex gap-2">
            {SCOPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTargetScope(opt.value)}
                className={`flex-1 rounded-md border px-2 py-1.5 text-[12px] font-medium ${
                  targetScope === opt.value
                    ? 'border-brand-primary bg-brand-soft text-brand-primary'
                    : 'border-border text-text-secondary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border p-3">
          <p className="mb-2 text-[12px] font-semibold text-text-secondary">상세 조건</p>
          <div className="flex flex-col gap-3">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-[11px] text-text-tertiary">적용 시작</label>
                <AiTag />
              </div>
              <p className="text-[13px] text-text-primary">
                {chapter?.title} {scene?.title} 이후
              </p>
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-text-tertiary">유지할 조건</label>
              <input
                value={maintainCondition}
                onChange={(e) => setMaintainCondition(e.target.value)}
                placeholder="예: 스톤이 파괴되기 전까지"
                className="w-full rounded-md border border-border px-2 py-1.5 text-[13px] outline-none focus:border-brand-primary"
              />
            </div>
            {effectiveBaselines.length > 0 && (
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-[11px] text-text-tertiary">대체하는 기존 설정</label>
                  {suggestedBaseline && <AiTag />}
                </div>
                <select
                  value={replacesBaselineId}
                  onChange={(e) => setReplacesBaselineId(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-[13px] outline-none focus:border-brand-primary"
                >
                  <option value="">해당 없음</option>
                  {effectiveBaselines.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.entity} — {b.rules[0]}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[12px] font-semibold text-text-secondary">작가 메모</label>
          <input
            value={authorNote}
            onChange={(e) => setAuthorNote(e.target.value)}
            placeholder="선택 입력"
            className="w-full rounded-md border border-border px-2.5 py-2 text-[13px] outline-none focus:border-brand-primary"
          />
        </div>

        <p className="text-[11px] text-text-tertiary">
          적용 범위 안에서는 같은 차이를 반복 지적하지 않습니다. 다른 모순과 파급 영향은 계속 확인합니다.
        </p>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            설정 확정 및 재검토
          </Button>
        </div>
      </div>
    </Modal>
  );
}
