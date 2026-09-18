// library-basic-settings — 좌우 패널 없는 단일 카드 뷰 (사용자 확정: ⚙️ 아이콘으로 진입하는 3번째 서브뷰)
'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDraftStore } from '@/stores/useDraftStore';
import { useNotesStore } from '@/stores/useNotesStore';
import type { ProjectUniverseConfig } from '@/types';

const COMPLIANCE_OPTIONS: { value: ProjectUniverseConfig['complianceLevel']; label: string }[] = [
  { value: 'STRICT', label: '엄격한 고증' },
  { value: 'PERMISSIVE', label: '작가 해석 허용' },
  { value: 'FREE', label: '자유 창작' },
];

const STAGE_OPTIONS = ['기획 중', '초고 집필 중', '퇴고 중', '완결'];

export function BasicSettingsView() {
  const universeConfig = useDraftStore((s) => s.project.universeConfig);
  const updateUniverseConfig = useDraftStore((s) => s.updateUniverseConfig);
  const projectStage = useNotesStore((s) => s.projectStage);
  const setProjectStage = useNotesStore((s) => s.setProjectStage);

  const [form, setForm] = useState(universeConfig);
  const [stage, setStage] = useState(projectStage);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const toggleWork = (work: string) => {
    setForm((prev) => ({
      ...prev,
      referencedWorks: prev.referencedWorks.includes(work)
        ? prev.referencedWorks.filter((w) => w !== work)
        : [...prev.referencedWorks, work],
    }));
  };

  const handleSave = () => {
    updateUniverseConfig(form);
    setProjectStage(stage);
    setSavedAt(new Date().toLocaleDateString('ko-KR'));
  };

  return (
    <div className="flex h-full items-start justify-center overflow-y-auto bg-background p-10">
      <div className="w-full max-w-xl rounded-xl bg-surface p-8 shadow-sheet">
        <div className="mb-1 flex items-center gap-2">
          <Settings size={18} className="text-text-secondary" />
          <h2 className="text-lg font-bold text-text-primary">작품 기본 설정</h2>
        </div>
        <p className="mb-6 text-[13px] text-text-secondary">작업 도중 언제든지 설정을 수정할 수 있습니다.</p>

        <div className="flex flex-col gap-5 border-t border-border pt-5">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-text-primary">기준 세계관</label>
            <input
              value={form.baselineUniverse}
              onChange={(e) => setForm((p) => ({ ...p, baselineUniverse: e.target.value }))}
              className="w-full rounded-md border border-border px-3 py-2 text-[13px] outline-none focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-text-primary">참조 작품 범위</label>
            <div className="flex flex-col gap-1.5">
              {universeConfig.referencedWorks.map((work) => (
                <label key={work} className="flex items-center gap-2 text-[13px] text-text-primary">
                  <input
                    type="checkbox"
                    checked={form.referencedWorks.includes(work)}
                    onChange={() => toggleWork(work)}
                    className="accent-brand-primary"
                  />
                  {work}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-text-primary">원작 준수 정도</label>
            <div className="grid grid-cols-3 gap-2">
              {COMPLIANCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm((p) => ({ ...p, complianceLevel: opt.value }))}
                  className={`rounded-lg border px-2 py-2 text-[13px] font-medium ${
                    form.complianceLevel === opt.value
                      ? 'border-brand-primary bg-brand-soft text-brand-primary'
                      : 'border-border text-text-secondary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-text-primary">현재 작업 단계</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] outline-none focus:border-brand-primary"
            >
              {STAGE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
          <span className="text-xs text-text-tertiary">
            {savedAt ? `마지막 저장: ${savedAt}` : ' '}
          </span>
          <Button variant="primary" onClick={handleSave}>
            설정 저장
          </Button>
        </div>
      </div>
    </div>
  );
}
