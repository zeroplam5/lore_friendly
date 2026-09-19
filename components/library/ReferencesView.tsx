// library-empty-state / library-references — docs/ui_ux.md §8.1, §8.3
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, Link2, PenLine, AlertTriangle, Trash2 } from 'lucide-react';
import { ThreePanelLayout } from '@/components/layout/ThreePanelLayout';
import { Button } from '@/components/ui/Button';
import { FilterPill } from '@/components/ui/FilterPill';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LibraryAddDialog } from './LibraryAddDialog';
import { useLibraryStore, getInconsistencies } from '@/stores/useLibraryStore';
import { MOCK_ANALYSIS_PROGRESS } from '@/data/library/demoReferences';
import { cn } from '@/lib/cn';
import type { ReferenceMaterial } from '@/types';

const STATUS_LABEL: Record<ReferenceMaterial['status'], string> = {
  '추출 중': '추출 중',
  '검토 가능': '검토 가능',
  '확인 필요': '확인 필요',
};

const SOURCE_ICON = { PDF: FileText, URL: Link2, '직접 작성': PenLine } as const;

type FilterValue = 'ALL' | 'ORIGINAL' | 'DERIVED';

export function ReferencesView() {
  const references = useLibraryStore((s) => s.references);
  const addReference = useLibraryStore((s) => s.addReference);
  const removeReference = useLibraryStore((s) => s.removeReference);
  const inconsistencies = getInconsistencies();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<FilterValue>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(references[0]?.id ?? null);

  if (references.length === 0) {
    return (
      <>
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <p className="text-text-secondary">아직 등록된 참고 자료가 없습니다.</p>
          <div className="flex gap-3">
            <Button variant="primary" onClick={() => setDialogOpen(true)}>
              자료 추가
            </Button>
            <Link href="/write">
              <Button variant="secondary">바로 집필</Button>
            </Link>
          </div>
        </div>
        <LibraryAddDialog open={dialogOpen} onOpenChange={setDialogOpen} onAdded={addReference} />
      </>
    );
  }

  const filtered = references.filter((r) => {
    if (filter === 'ALL') return true;
    if (filter === 'ORIGINAL') return r.sourceType === 'PDF' || r.sourceType === 'URL';
    return r.sourceType === '직접 작성';
  });

  const selected = references.find((r) => r.id === selectedId) ?? references[0];
  const isNewUpload = selected.status === '추출 중';

  const handleDelete = (id: string) => {
    const remaining = references.filter((r) => r.id !== id);
    removeReference(id);
    if (selectedId === id) {
      setSelectedId(remaining[0]?.id ?? null);
    }
  };

  return (
    <>
      <ThreePanelLayout
        leftTitle="참고 자료"
        rightTitle="메타 정보"
        leftPanel={
          <div className="flex flex-col p-3">
            <Button variant="primary" fullWidth onClick={() => setDialogOpen(true)} className="mb-3">
              <span className="flex items-center justify-center gap-1">
                <Plus size={14} /> 자료 추가
              </span>
            </Button>
            <div className="mb-2 flex gap-1.5">
              <FilterPill label="전체" active={filter === 'ALL'} onClick={() => setFilter('ALL')} />
              <FilterPill label="원작 자료" active={filter === 'ORIGINAL'} onClick={() => setFilter('ORIGINAL')} />
              <FilterPill label="2차 정리" active={filter === 'DERIVED'} onClick={() => setFilter('DERIVED')} />
            </div>
            <div className="flex flex-col gap-2">
              {filtered.map((ref) => {
                const Icon = SOURCE_ICON[ref.sourceType];
                const isHighlighted = inconsistencies.some((inc) => inc.involvedReferenceIds.includes(ref.id));
                return (
                  <div
                    key={ref.id}
                    onClick={() => setSelectedId(ref.id)}
                    className={cn(
                      'group flex cursor-pointer flex-col gap-1 rounded-lg border p-2.5 text-left',
                      ref.id === selected.id
                        ? 'border-brand-primary bg-brand-soft'
                        : isHighlighted
                          ? 'border-status-warning-border bg-status-warning-bg'
                          : 'border-transparent bg-surface hover:bg-background'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-text-secondary">
                        {STATUS_LABEL[ref.status]}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
                        <Icon size={11} /> {ref.sourceType}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(ref.id);
                          }}
                          className="opacity-0 hover:text-status-error-text group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      </span>
                    </div>
                    <p className="truncate text-[13px] font-medium text-text-primary">{ref.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        }
        rightPanel={
          <div className="flex flex-col gap-4 p-5">
            <h3 className="text-[13px] font-semibold text-text-secondary">자료 메타 정보</h3>
            <div className="flex flex-col gap-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-text-tertiary">적용 세계관</span>
                <span className="font-medium text-text-primary">{selected.appliedUniverse}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">등록일자</span>
                <span className="font-medium text-text-primary">
                  {selected.addedAt.slice(0, 10)}
                </span>
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-[13px]">
                <span className="text-text-secondary">자료 분석 진행률</span>
                <span className="font-semibold text-text-primary">
                  {isNewUpload ? '분석 중' : `${MOCK_ANALYSIS_PROGRESS}% 완료`}
                </span>
              </div>
              <ProgressBar percent={isNewUpload ? 20 : MOCK_ANALYSIS_PROGRESS} />
            </div>

            <div>
              <p className="mb-2 text-[13px] font-semibold text-text-secondary">
                자료 간 불일치 ({inconsistencies.length})
              </p>
              <div className="flex flex-col gap-2">
                {inconsistencies.map((inc) => (
                  <div
                    key={inc.id}
                    className="rounded-lg border border-status-warning-border bg-status-warning-bg p-2.5"
                  >
                    <p className="flex items-start gap-1.5 text-[12px] text-amber-900">
                      <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                      {inc.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="danger-ghost"
              className="flex items-center justify-center gap-1.5"
              onClick={() => handleDelete(selected.id)}
            >
              <Trash2 size={14} /> 자료 삭제
            </Button>
          </div>
        }
      >
        <div className="p-6">
          <div className="mx-auto max-w-2xl rounded-xl bg-surface p-6 shadow-sheet">
            <h2 className="mb-1 text-lg font-bold text-text-primary">{selected.title}</h2>
            <p className="mb-4 text-xs text-text-tertiary">
              {selected.sourceType} · {selected.appliedUniverse}
            </p>
            <p className="text-[14px] leading-relaxed text-text-secondary">{selected.bodyPreview}</p>
          </div>
        </div>
      </ThreePanelLayout>
      <LibraryAddDialog open={dialogOpen} onOpenChange={setDialogOpen} onAdded={addReference} />
    </>
  );
}
