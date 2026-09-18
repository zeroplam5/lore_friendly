// 집필 탭 우측 패널 — 장면 설정 & 메모. docs/ui_ux.md §3 우측 인스펙터 패턴 재사용(읽기 전용 정보만)
'use client';

import { useState } from 'react';
import { CheckCircle2, Plus, X } from 'lucide-react';
import { useDraftStore } from '@/stores/useDraftStore';
import { useCanonStore } from '@/stores/useCanonStore';
import { useNotesStore } from '@/stores/useNotesStore';

export function SceneMemoPanel() {
  const selectedChapterId = useDraftStore((s) => s.selectedChapterId);
  const selectedSceneId = useDraftStore((s) => s.selectedSceneId);
  const confirmedSettings = useCanonStore((s) => s.confirmedSettings);
  const memos = useNotesStore((s) => s.memos);
  const addMemo = useNotesStore((s) => s.addMemo);
  const removeMemo = useNotesStore((s) => s.removeMemo);

  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');

  const relevantSettings = confirmedSettings.filter((setting) => {
    if (setting.targetScope === 'PROJECT') return true;
    if (setting.targetScope === 'CHAPTER') return setting.chapterId === selectedChapterId;
    return setting.chapterId === selectedChapterId && setting.sceneId === selectedSceneId;
  });

  const sceneMemos = memos.filter(
    (m) => m.chapterId === selectedChapterId && m.sceneId === selectedSceneId
  );

  const submit = () => {
    if (text.trim()) addMemo(selectedChapterId, selectedSceneId, text.trim());
    setText('');
    setAdding(false);
  };

  return (
    <div className="flex flex-col gap-5 p-5">
      <h2 className="text-[15px] font-bold text-text-primary">장면 설정 & 메모</h2>

      <section>
        <h3 className="mb-2 text-[13px] font-semibold text-text-secondary">연결된 설정</h3>
        {relevantSettings.length === 0 ? (
          <p className="text-xs text-text-tertiary">이 장면에 연결된 확정 설정이 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {relevantSettings.map((setting) => (
              <div key={setting.id} className="rounded-lg border border-border bg-surface p-2.5">
                <p className="text-[13px] font-medium text-text-primary">{setting.title}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-status-success-text">
                  <CheckCircle2 size={11} /> 승인된 변경
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-text-secondary">작가 메모</h3>
        </div>
        <div className="flex flex-col gap-2">
          {sceneMemos.map((memo) => (
            <div
              key={memo.id}
              className="group relative rounded-md border border-status-warning-border bg-status-warning-bg p-2.5 text-[12px] text-amber-900"
            >
              {memo.text}
              <button
                onClick={() => removeMemo(memo.id)}
                className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {adding ? (
            <div className="rounded-md border border-border p-2">
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={submit}
                placeholder="메모 입력..."
                className="w-full resize-none bg-transparent text-[12px] outline-none"
                rows={3}
              />
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1 rounded-md px-1 py-1.5 text-[13px] font-medium text-text-secondary hover:bg-background"
            >
              <Plus size={14} /> 메모 추가
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
