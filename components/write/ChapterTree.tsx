// 작품 구조 트리 — docs/ui_ux.md §3.2 참조 컴포넌트 (TreeNode)
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Settings } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useDraftStore } from '@/stores/useDraftStore';

export function ChapterTree() {
  const project = useDraftStore((s) => s.project);
  const selectedChapterId = useDraftStore((s) => s.selectedChapterId);
  const selectedSceneId = useDraftStore((s) => s.selectedSceneId);
  const selectScene = useDraftStore((s) => s.selectScene);
  const addChapter = useDraftStore((s) => s.addChapter);

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggle = (chapterId: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });

  return (
    <div className="flex flex-col">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[13px] font-semibold text-text-secondary">작품 구조</span>
        <Settings size={14} className="text-text-tertiary" />
      </div>

      <div className="flex flex-col gap-1">
        {project.chapters.map((chapter) => {
          const isOpen = !collapsed.has(chapter.id);
          return (
            <div key={chapter.id}>
              <button
                onClick={() => toggle(chapter.id)}
                className="flex w-full items-center gap-1 rounded-md px-1 py-1.5 text-left text-[13px] font-semibold text-text-primary hover:bg-background"
              >
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className="truncate">{chapter.title}</span>
                <span className="ml-auto flex-shrink-0 text-[11px] font-normal text-text-tertiary">
                  ({chapter.scenes.length})
                </span>
              </button>
              {isOpen && (
                <div className="ml-4 flex flex-col gap-0.5 border-l border-border pl-2">
                  {chapter.scenes.map((scene) => {
                    const isSelected = chapter.id === selectedChapterId && scene.id === selectedSceneId;
                    const isEmpty = scene.content.trim().length === 0;
                    return (
                      <button
                        key={scene.id}
                        onClick={() => selectScene(chapter.id, scene.id)}
                        className={cn(
                          'truncate rounded-md px-2 py-1 text-left text-[13px]',
                          isSelected
                            ? 'bg-brand-soft font-semibold text-brand-primary'
                            : isEmpty
                              ? 'text-text-tertiary hover:bg-background'
                              : 'text-text-secondary hover:bg-background'
                        )}
                      >
                        {scene.title}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => addChapter(`제${project.chapters.length + 1}장: 새 챕터`)}
        className="mt-3 flex items-center gap-1 rounded-md px-1 py-1.5 text-[13px] font-medium text-text-secondary hover:bg-background"
      >
        <Plus size={14} /> 챕터 추가
      </button>
    </div>
  );
}
