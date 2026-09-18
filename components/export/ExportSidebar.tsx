// PDF 조판 설정 사이드바(380px) — docs/ui_ux.md §7, DESIGN.md §11.1-A 겹침 결함 방어
// (settings-scroll: flex-1 min-h-0 overflow-y-auto / footer: min-height 고정 금지)
'use client';

import Link from 'next/link';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/cn';

export type ExportScope = 'PROJECT' | 'CHAPTER' | 'SCENE';
export type ExportStage = 'idle' | 'generating' | 'complete';

export interface ExportSettings {
  scope: ExportScope;
  includeCover: boolean;
  title: string;
  author: string;
  includeToc: boolean;
  paperSize: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  newPagePerChapter: boolean;
}

interface ExportSidebarProps {
  projectTitle: string;
  settings: ExportSettings;
  onChange: (patch: Partial<ExportSettings>) => void;
  stage: ExportStage;
  progressPercent: number;
  currentPage: number;
  fileSizeLabel: string | null;
  onDownload: () => void;
  onRedownload: () => void;
}

const SCOPE_OPTIONS: { value: ExportScope; label: string }[] = [
  { value: 'PROJECT', label: '작품 전체' },
  { value: 'CHAPTER', label: '챕터 선택' },
  { value: 'SCENE', label: '현재 장면' },
];

export function ExportSidebar({
  projectTitle,
  settings,
  onChange,
  stage,
  progressPercent,
  currentPage,
  fileSizeLabel,
  onDownload,
  onRedownload,
}: ExportSidebarProps) {
  return (
    <aside className="flex h-full w-full flex-shrink-0 flex-col border-r border-border bg-surface lg:w-[380px]">
      <div className="border-b border-border p-5">
        <h1 className="text-lg font-bold text-text-primary">PDF 내보내기</h1>
        <p className="text-[13px] text-text-tertiary">{projectTitle}</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <section className="mb-6">
          <h3 className="mb-2 text-[13px] font-semibold text-text-primary">내보내기 범위</h3>
          <div className="flex flex-col gap-1.5">
            {SCOPE_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-[13px] text-text-primary">
                <input
                  type="radio"
                  checked={settings.scope === opt.value}
                  onChange={() => onChange({ scope: opt.value })}
                  className="accent-brand-primary"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-text-primary">표지 포함</h3>
            <ToggleSwitch checked={settings.includeCover} onChange={(v) => onChange({ includeCover: v })} />
          </div>
          {settings.includeCover && (
            <div className="flex flex-col gap-2">
              <div>
                <label className="mb-1 block text-[11px] text-text-tertiary">도서 제목</label>
                <input
                  value={settings.title}
                  onChange={(e) => onChange({ title: e.target.value })}
                  className="w-full rounded-md border border-border px-2.5 py-1.5 text-[13px] outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-text-tertiary">작가명</label>
                <input
                  value={settings.author}
                  onChange={(e) => onChange({ author: e.target.value })}
                  className="w-full rounded-md border border-border px-2.5 py-1.5 text-[13px] outline-none focus:border-brand-primary"
                />
              </div>
            </div>
          )}
        </section>

        <section className="mb-6 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-text-primary">목차 포함</h3>
          <ToggleSwitch checked={settings.includeToc} onChange={(v) => onChange({ includeToc: v })} />
        </section>

        <section className="mb-6">
          <h3 className="mb-2 text-[13px] font-semibold text-text-primary">페이지 설정</h3>
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-[11px] text-text-tertiary">용지 크기</label>
              <select
                value={settings.paperSize}
                onChange={(e) => onChange({ paperSize: e.target.value })}
                className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-[13px] outline-none"
              >
                <option value="A5">A5 (148 × 210mm)</option>
                <option value="A4">A4 (210 × 297mm)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-text-tertiary">본문 글꼴</label>
              <select
                value={settings.fontFamily}
                onChange={(e) => onChange({ fontFamily: e.target.value })}
                className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-[13px] outline-none"
              >
                <option value="nanum-myeongjo">나눔명조</option>
                <option value="pretendard">Pretendard</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[11px] text-text-tertiary">글자 크기</label>
                <select
                  value={settings.fontSize}
                  onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
                  className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-[13px] outline-none"
                >
                  {[10, 11, 12].map((s) => (
                    <option key={s} value={s}>
                      {s}pt
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-text-tertiary">줄 간격</label>
                <select
                  value={settings.lineHeight}
                  onChange={(e) => onChange({ lineHeight: Number(e.target.value) })}
                  className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-[13px] outline-none"
                >
                  {[1.5, 1.8, 2].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="mb-2 text-[13px] font-semibold text-text-primary">기타 옵션</h3>
          <label className="flex items-center gap-2 text-[13px] text-text-primary">
            <input
              type="checkbox"
              checked={settings.newPagePerChapter}
              onChange={(e) => onChange({ newPagePerChapter: e.target.checked })}
              className="accent-brand-primary"
            />
            챕터별 새 페이지로 시작
          </label>
        </section>
      </div>

      <div className="flex flex-shrink-0 flex-col gap-2 border-t border-border p-5">
        {stage === 'generating' && (
          <div className="mb-1">
            <p className="mb-1 text-[12px] text-text-secondary">
              {currentPage}페이지 처리 중 ({progressPercent}%)
            </p>
            <ProgressBar percent={progressPercent} />
          </div>
        )}

        {stage === 'complete' ? (
          <>
            <Button variant="primary" fullWidth onClick={onRedownload} className="flex items-center justify-center gap-1.5">
              <Download size={14} /> 다운로드 완료{fileSizeLabel ? ` (${fileSizeLabel})` : ''}
            </Button>
            <button onClick={onRedownload} className="text-center text-xs text-text-tertiary hover:text-brand-primary">
              다시 다운로드
            </button>
          </>
        ) : (
          <Button variant="primary" fullWidth onClick={onDownload} disabled={stage === 'generating'}>
            {stage === 'generating' ? (
              <span className="flex items-center justify-center gap-1.5">
                <Loader2 size={14} className="animate-spin" /> 생성 중...
              </span>
            ) : (
              'PDF 다운로드'
            )}
          </Button>
        )}
        <Link href="/write" className="text-center text-xs text-text-tertiary hover:text-brand-primary">
          취소
        </Link>
      </div>
    </aside>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn('h-5 w-9 rounded-full transition-colors', checked ? 'bg-brand-primary' : 'bg-border')}
    >
      <span
        className={cn(
          'block h-4 w-4 translate-y-0.5 rounded-full bg-white transition-transform',
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}
