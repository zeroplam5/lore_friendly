// library-settings (작품 설정 탭) — docs/ui_ux.md §8, Backend&DB.md §2.1-A/C
// 사용자 확정 기능: 기준 설정을 자료실에서 직접 추가/삭제하고, 체크박스로 다음 검증에
// 사용할 기준 설정을 직접 고를 수 있다 (자동 임베딩 유사도 검색을 수동으로 오버라이드).
'use client';

import { useState } from 'react';
import { CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { ThreePanelLayout } from '@/components/layout/ThreePanelLayout';
import { Button } from '@/components/ui/Button';
import { FilterPill } from '@/components/ui/FilterPill';
import { AddBaselineDialog } from './AddBaselineDialog';
import {
  useCanonStore,
  useAllBaselines,
  getEffectiveBaselines,
} from '@/stores/useCanonStore';
import type { CanonicalBaseline, ConfirmedSetting } from '@/types';

const CATEGORIES: CanonicalBaseline['category'][] = ['아이템', '인물', '사건', '능력'];

const SCOPE_LABEL: Record<ConfirmedSetting['targetScope'], string> = {
  PROJECT: '작품 전체',
  CHAPTER: '해당 챕터',
  SCENE: '해당 장면',
};

type Selected = { kind: 'baseline'; item: CanonicalBaseline } | { kind: 'confirmed'; item: ConfirmedSetting } | null;

export function SettingsView() {
  const confirmedSettings = useCanonStore((s) => s.confirmedSettings);
  const removeConfirmedSetting = useCanonStore((s) => s.removeConfirmedSetting);
  const disabledBaselineIds = useCanonStore((s) => s.disabledBaselineIds);
  const toggleBaselineEnabled = useCanonStore((s) => s.toggleBaselineEnabled);
  const removeBaseline = useCanonStore((s) => s.removeBaseline);
  const addCustomBaseline = useCanonStore((s) => s.addCustomBaseline);

  const allBaselines = useAllBaselines();
  const effectiveBaselines = getEffectiveBaselines(allBaselines, confirmedSettings);

  const [categoryFilter, setCategoryFilter] = useState<CanonicalBaseline['category'] | 'ALL'>('ALL');
  const [selected, setSelected] = useState<Selected>(
    effectiveBaselines[0] ? { kind: 'baseline', item: effectiveBaselines[0] } : null
  );
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const filteredBaselines = effectiveBaselines.filter(
    (b) => categoryFilter === 'ALL' || b.category === categoryFilter
  );

  const handleDeleteBaseline = (id: string) => {
    removeBaseline(id);
    if (selected?.kind === 'baseline' && selected.item.id === id) setSelected(null);
  };

  return (
    <>
      <ThreePanelLayout
        leftTitle="작품 설정 목록"
        rightTitle="설정 메타"
        leftPanel={
          <div className="p-3">
            <div className="mb-3 flex flex-wrap gap-1.5">
              <FilterPill label="전체" active={categoryFilter === 'ALL'} onClick={() => setCategoryFilter('ALL')} />
              {CATEGORIES.map((c) => (
                <FilterPill key={c} label={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)} />
              ))}
            </div>

            <section className="mb-4">
              <div className="mb-2 flex items-center justify-between px-1">
                <h3 className="text-[12px] font-semibold text-text-secondary">기준 설정</h3>
                <button
                  onClick={() => setAddDialogOpen(true)}
                  className="flex items-center gap-0.5 text-[11px] font-semibold text-brand-primary hover:underline"
                >
                  <Plus size={12} /> 추가
                </button>
              </div>
              <p className="mb-2 px-1 text-[11px] text-text-tertiary">
                체크된 항목만 다음 검증 요청에 포함됩니다.
              </p>
              <div className="flex flex-col gap-1.5">
                {filteredBaselines.map((b) => {
                  const enabled = !disabledBaselineIds.includes(b.id);
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelected({ kind: 'baseline', item: b })}
                      className={`group flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 text-left text-[13px] ${
                        selected?.kind === 'baseline' && selected.item.id === b.id
                          ? 'border-brand-primary bg-brand-soft'
                          : 'border-transparent bg-surface hover:bg-background'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={enabled}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleBaselineEnabled(b.id)}
                        className="mt-0.5 accent-brand-primary"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-text-primary">{b.entity}</p>
                        <p className="truncate text-[11px] text-text-tertiary">{b.universe} 기준</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBaseline(b.id);
                        }}
                        className="flex-shrink-0 text-text-tertiary opacity-0 hover:text-status-error-text group-hover:opacity-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
                {filteredBaselines.length === 0 && (
                  <p className="px-1 text-[12px] text-text-tertiary">해당 분류의 기준 설정이 없습니다.</p>
                )}
              </div>
            </section>

            <section>
              <h3 className="mb-2 px-1 text-[12px] font-semibold text-text-secondary">승인한 변경</h3>
              <div className="flex flex-col gap-1.5">
                {confirmedSettings.length === 0 && (
                  <p className="px-1 text-[12px] text-text-tertiary">아직 확정된 설정이 없습니다.</p>
                )}
                {confirmedSettings.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected({ kind: 'confirmed', item: c })}
                    className={`flex items-center justify-between rounded-lg border p-2.5 text-left text-[13px] ${
                      selected?.kind === 'confirmed' && selected.item.id === c.id
                        ? 'border-brand-primary bg-brand-soft'
                        : 'border-transparent bg-surface hover:bg-background'
                    }`}
                  >
                    <span className="truncate font-medium text-text-primary">{c.title}</span>
                    <CheckCircle2 size={13} className="flex-shrink-0 text-status-success-text" />
                  </button>
                ))}
              </div>
            </section>
          </div>
        }
        rightPanel={
          selected ? (
            <div className="flex flex-col gap-3 p-5 text-[13px]">
              {selected.kind === 'baseline' ? (
                <>
                  <p className="text-text-tertiary">출처</p>
                  <p className="font-medium text-text-primary">{selected.item.source}</p>
                  <p className="mt-2 text-text-tertiary">분류</p>
                  <p className="font-medium text-text-primary">{selected.item.category}</p>
                  <p className="mt-2 text-text-tertiary">검증 사용 여부</p>
                  <p className="font-medium text-text-primary">
                    {disabledBaselineIds.includes(selected.item.id) ? '제외됨' : '포함됨'}
                  </p>
                  <Button
                    variant="danger-ghost"
                    className="mt-4"
                    onClick={() => handleDeleteBaseline(selected.item.id)}
                  >
                    이 기준 설정 삭제
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-text-tertiary">적용 범위</p>
                  <p className="font-medium text-text-primary">{SCOPE_LABEL[selected.item.targetScope]}</p>
                  <p className="mt-2 text-text-tertiary">확정일</p>
                  <p className="font-medium text-text-primary">{selected.item.confirmedAt.slice(0, 10)}</p>
                  {selected.item.maintainCondition && (
                    <>
                      <p className="mt-2 text-text-tertiary">유지 조건</p>
                      <p className="font-medium text-text-primary">{selected.item.maintainCondition}</p>
                    </>
                  )}
                  <Button
                    variant="danger-ghost"
                    className="mt-4"
                    onClick={() => {
                      removeConfirmedSetting(selected.item.id);
                      setSelected(null);
                    }}
                  >
                    이 설정 취소
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-5 text-sm text-text-tertiary">
              좌측에서 항목을 선택하세요.
            </div>
          )
        }
      >
        <div className="p-6">
          {selected ? (
            <div className="mx-auto max-w-2xl rounded-xl bg-surface p-6 shadow-sheet">
              {selected.kind === 'baseline' ? (
                <>
                  <h2 className="mb-4 text-lg font-bold text-text-primary">{selected.item.entity}</h2>
                  <ul className="mb-4 list-disc space-y-1.5 pl-5 text-[14px] text-text-secondary">
                    {selected.item.rules.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                  <p className="rounded-lg bg-background p-3 text-[13px] italic text-text-tertiary">
                    "{selected.item.citationText}"
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-text-primary">{selected.item.title}</h2>
                    <span className="rounded bg-status-success-bg px-2 py-1 text-[11px] font-semibold text-status-success-text">
                      승인됨
                    </span>
                  </div>
                  <p className="mb-4 text-[14px] leading-relaxed text-text-secondary">
                    {selected.item.description}
                  </p>
                  {selected.item.replacesBaselineId && (
                    <div className="rounded-lg border border-status-error-text/20 bg-status-error-bg p-3">
                      <p className="mb-1 text-[11px] font-semibold text-status-error-text">원래 기준</p>
                      <p className="text-[13px] text-text-secondary">
                        {allBaselines.find((b) => b.id === selected.item.replacesBaselineId)?.rules[0] ??
                          selected.item.replacesBaselineId}
                      </p>
                    </div>
                  )}
                  {selected.item.authorNote && (
                    <p className="mt-4 text-[13px] text-text-tertiary">작가 메모: {selected.item.authorNote}</p>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-text-tertiary">
              좌측에서 기준 설정 또는 승인한 변경을 선택하세요.
            </div>
          )}
        </div>
      </ThreePanelLayout>

      <AddBaselineDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdded={(baseline) => {
          addCustomBaseline(baseline);
          setSelected({ kind: 'baseline', item: baseline });
        }}
      />
    </>
  );
}
