// 구상함 — 정식 데이터 모델 밖의 시각적 보강 기능 (lore_scene_notes, useNotesStore 참조)
'use client';

import { useState } from 'react';
import { Lightbulb, Plus, X } from 'lucide-react';
import { useNotesStore } from '@/stores/useNotesStore';

export function IdeaBox() {
  const ideas = useNotesStore((s) => s.ideas);
  const addIdea = useNotesStore((s) => s.addIdea);
  const removeIdea = useNotesStore((s) => s.removeIdea);
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');

  const submit = () => {
    if (text.trim()) addIdea(text.trim());
    setText('');
    setAdding(false);
  };

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[13px] font-semibold text-text-secondary">구상함</span>
        <button onClick={() => setAdding(true)} className="text-text-tertiary hover:text-text-primary">
          <Plus size={14} />
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        {ideas.map((idea) => (
          <div
            key={idea.id}
            className="group flex items-start gap-1.5 rounded-md bg-background px-2 py-1.5 text-[12px] text-text-secondary"
          >
            <Lightbulb size={12} className="mt-0.5 flex-shrink-0 text-amber-500" />
            <span className="min-w-0 flex-1 truncate">{idea.text}</span>
            <button
              onClick={() => removeIdea(idea.id)}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100"
            >
              <X size={11} className="text-text-tertiary" />
            </button>
          </div>
        ))}
        {adding && (
          <div className="flex items-center gap-1 rounded-md border border-border px-2 py-1">
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              onBlur={submit}
              placeholder="아이디어 입력..."
              className="w-full bg-transparent text-[12px] outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
