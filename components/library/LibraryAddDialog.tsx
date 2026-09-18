// library-add-dialog — DESIGN.md §2, 목업 업로드(Backend&DB.md §8.3)
'use client';

import { useState } from 'react';
import { UploadCloud, Link2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/cn';
import { MOCK_ANALYSIS_PROGRESS } from '@/data/library/demoReferences';
import type { ReferenceMaterial, ReferenceSourceType } from '@/types';

export function LibraryAddDialog({
  open,
  onOpenChange,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: (reference: ReferenceMaterial) => void;
}) {
  const [mode, setMode] = useState<'file' | 'url'>('file');
  const [title, setTitle] = useState('');
  const [sourceType, setSourceType] = useState<ReferenceSourceType>('PDF');
  const [appliedUniverse, setAppliedUniverse] = useState('MCU');
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  const reset = () => {
    setTitle('');
    setSourceType('PDF');
    setAppliedUniverse('MCU');
    setProgress(null);
    setMode('file');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
      setSourceType('PDF');
    }
  };

  const runMockUpload = async () => {
    const steps = 8;
    for (let i = 1; i <= steps; i++) {
      await new Promise((r) => setTimeout(r, 120));
      setProgress(Math.round((MOCK_ANALYSIS_PROGRESS / steps) * i));
    }
    onAdded({
      id: `ref-${Date.now()}`,
      title: title || '제목 없는 자료',
      sourceType,
      status: '검토 가능',
      appliedUniverse,
      addedAt: new Date().toISOString(),
      bodyPreview:
        '(목업) 데모 환경에서는 실제 파일 내용을 분석하지 않으며, 고정된 샘플 본문으로 대체됩니다.',
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
      title="자료 추가"
      description="원작 자료 또는 2차 정리 문서를 등록합니다."
    >
      {progress !== null ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <p className="text-sm text-text-secondary">추출 중... {progress}%</p>
          <ProgressBar percent={progress} className="w-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('file')}
              className={cn(
                'flex-1 rounded-md border px-3 py-1.5 text-[13px] font-medium',
                mode === 'file' ? 'border-brand-primary bg-brand-soft text-brand-primary' : 'border-border text-text-secondary'
              )}
            >
              파일 업로드
            </button>
            <button
              onClick={() => {
                setMode('url');
                setSourceType('URL');
              }}
              className={cn(
                'flex-1 rounded-md border px-3 py-1.5 text-[13px] font-medium',
                mode === 'url' ? 'border-brand-primary bg-brand-soft text-brand-primary' : 'border-border text-text-secondary'
              )}
            >
              URL 입력
            </button>
          </div>

          {mode === 'file' ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-center',
                isDragging ? 'border-brand-primary bg-brand-soft' : 'border-border'
              )}
            >
              <UploadCloud size={24} className="text-text-tertiary" />
              <p className="text-[13px] text-text-secondary">
                파일을 드래그하거나 클릭해서 업로드 (PDF/DOCX/TXT, 최대 50MB)
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
              <Link2 size={16} className="text-text-tertiary" />
              <input
                onChange={(e) => setTitle(e.target.value)}
                placeholder="https://..."
                className="w-full bg-transparent text-[13px] outline-none"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-[12px] font-semibold text-text-secondary">자료명</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="자료 제목을 입력하세요"
              className="w-full rounded-md border border-border px-2.5 py-2 text-[13px] outline-none focus:border-brand-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-text-secondary">출처 유형</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as ReferenceSourceType)}
                className="w-full rounded-md border border-border bg-surface px-2.5 py-2 text-[13px] outline-none focus:border-brand-primary"
              >
                <option value="PDF">PDF</option>
                <option value="URL">URL</option>
                <option value="직접 작성">직접 작성</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-text-secondary">적용 세계관</label>
              <input
                value={appliedUniverse}
                onChange={(e) => setAppliedUniverse(e.target.value)}
                className="w-full rounded-md border border-border px-2.5 py-2 text-[13px] outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button variant="primary" onClick={runMockUpload} disabled={!title.trim()}>
              자료 등록
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
