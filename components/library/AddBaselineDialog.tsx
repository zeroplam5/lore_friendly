// 기준 설정(Baseline) 직접 추가 — 사용자 확정 기능: 자료실 > 작품 설정에서 원작 규칙을
// 직접 만들고 지울 수 있어야 함 (marvel_baseline.json 고정 목록 외 자유 추가/삭제)
'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { CanonicalBaseline } from '@/types';

const CATEGORY_OPTIONS: CanonicalBaseline['category'][] = ['아이템', '인물', '사건', '능력'];
const UNIVERSE_OPTIONS: CanonicalBaseline['universe'][] = ['MCU', 'Earth-616'];

export function AddBaselineDialog({
  open,
  onOpenChange,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: (baseline: CanonicalBaseline) => void;
}) {
  const [entity, setEntity] = useState('');
  const [category, setCategory] = useState<CanonicalBaseline['category']>('아이템');
  const [universe, setUniverse] = useState<CanonicalBaseline['universe']>('Earth-616');
  const [rulesText, setRulesText] = useState('');
  const [source, setSource] = useState('');
  const [citationText, setCitationText] = useState('');

  const reset = () => {
    setEntity('');
    setCategory('아이템');
    setUniverse('Earth-616');
    setRulesText('');
    setSource('');
    setCitationText('');
  };

  const handleSubmit = () => {
    const rules = rulesText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);
    if (!entity.trim() || rules.length === 0) return;

    onAdded({
      id: `base-custom-${Date.now()}`,
      universe,
      entity: entity.trim(),
      category,
      rules,
      source: source.trim() || '작가 직접 입력',
      citationText: citationText.trim() || rules[0],
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
      title="기준 설정 추가"
      description="이후 검증에서 원작 기준으로 사용할 규칙을 직접 등록합니다."
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-[12px] font-semibold text-text-secondary">대상 (entity)</label>
          <input
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            placeholder="예: 은빛 검"
            className="w-full rounded-md border border-border px-2.5 py-2 text-[13px] outline-none focus:border-brand-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-text-secondary">분류</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CanonicalBaseline['category'])}
              className="w-full rounded-md border border-border bg-surface px-2.5 py-2 text-[13px] outline-none focus:border-brand-primary"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-text-secondary">세계관</label>
            <select
              value={universe}
              onChange={(e) => setUniverse(e.target.value as CanonicalBaseline['universe'])}
              className="w-full rounded-md border border-border bg-surface px-2.5 py-2 text-[13px] outline-none focus:border-brand-primary"
            >
              {UNIVERSE_OPTIONS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[12px] font-semibold text-text-secondary">규칙 (한 줄에 하나씩)</label>
          <textarea
            value={rulesText}
            onChange={(e) => setRulesText(e.target.value)}
            rows={4}
            placeholder={'예:\n은빛 검은 달빛 아래에서만 희미한 빛을 낸다.\n검을 두 자루 이상 동시에 소유하는 것은 불가능하다.'}
            className="w-full resize-none rounded-md border border-border px-2.5 py-2 text-[13px] outline-none focus:border-brand-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-[12px] font-semibold text-text-secondary">출처 (선택)</label>
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="예: 설정집 1장"
            className="w-full rounded-md border border-border px-2.5 py-2 text-[13px] outline-none focus:border-brand-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-[12px] font-semibold text-text-secondary">인용문 (선택)</label>
          <input
            value={citationText}
            onChange={(e) => setCitationText(e.target.value)}
            placeholder="비워두면 첫 번째 규칙을 그대로 사용합니다"
            className="w-full rounded-md border border-border px-2.5 py-2 text-[13px] outline-none focus:border-brand-primary"
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!entity.trim() || !rulesText.trim()}>
            추가
          </Button>
        </div>
      </div>
    </Modal>
  );
}
