// 작품 구조 트리 — docs/ui_ux.md §3.2 참조 컴포넌트 (TreeNode)
// 사용자 확정 기능: 챕터/장면 추가·삭제·순서 이동 + 챕터 이름 수정
'use client';

import { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Settings,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useDraftStore } from '@/stores/useDraftStore';

export function ChapterTree() {
  const project = useDraftStore((s) => s.project);
  const selectedChapterId = useDraftStore((s) => s.selectedChapterId);
  const selectedSceneId = useDraftStore((s) => s.selectedSceneId);
  const selectScene = useDraftStore((s) => s.selectScene);
  const addChapter = useDraftStore((s) => s.addChapter);
  const removeChapter = useDraftStore((s) => s.removeChapter);
  const moveChapter = useDraftStore((s) => s.moveChapter);
  const renameChapter = useDraftStore((s) => s.renameChapter);
  const addScene = useDraftStore((s) => s.addScene);
  const removeScene = useDraftStore((s) => s.removeScene);
  const moveScene = useDraftStore((s) => s.moveScene);

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const toggle = (chapterId: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });

  const startEditing = (chapterId: string, currentTitle: string) => {
    setEditingChapterId(chapterId);
    setEditingTitle(currentTitle);
  };

  const commitEditing = () => {
    if (editingChapterId && editingTitle.trim()) {
      renameChapter(editingChapterId, editingTitle.trim());
    }
    setEditingChapterId(null);
  };

  return (
    <div className="flex flex-col">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[13px] font-semibold text-text-secondary">작품 구조</span>
        <Settings size={14} className="text-text-tertiary" />
      </div>

      <div className="flex flex-col gap-1">
        {project.chapters.map((chapter, chapterIndex) => {
          const isOpen = !collapsed.has(chapter.id);
          const isFirstChapter = chapterIndex === 0;
          const isLastChapter = chapterIndex === project.chapters.length - 1;
          const isEditing = editingChapterId === chapter.id;

          return (
            <div key={chapter.id}>
              <div
                onClick={() => !isEditing && toggle(chapter.id)}
                className="group flex w-full cursor-pointer items-center gap-1 rounded-md px-1 py-1.5 text-left text-[13px] font-semibold text-text-primary hover:bg-background"
              >
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                {isEditing ? (
                  <input
                    autoFocus
                    value={editingTitle}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={commitEditing}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEditing();
                      if (e.key === 'Escape') setEditingChapterId(null);
                    }}
                    className="min-w-0 flex-1 rounded border border-brand-primary bg-surface px-1 py-0.5 text-[13px] font-semibold outline-none"
                  />
                ) : (
                  <span className="truncate">{chapter.title}</span>
                )}
                <span className="flex-shrink-0 text-[11px] font-normal text-text-tertiary">
                  ({chapter.scenes.length})
                </span>
                {!isEditing && (
                  <div className="ml-auto flex flex-shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(chapter.id, chapter.title);
                      }}
                      className="rounded p-0.5 text-text-tertiary hover:text-brand-primary"
                      title="이름 수정"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      disabled={isFirstChapter}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveChapter(chapter.id, 'up');
                      }}
                      className="rounded p-0.5 text-text-tertiary hover:text-brand-primary disabled:pointer-events-none disabled:opacity-30"
                      title="위로 이동"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      disabled={isLastChapter}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveChapter(chapter.id, 'down');
                      }}
                      className="rounded p-0.5 text-text-tertiary hover:text-brand-primary disabled:pointer-events-none disabled:opacity-30"
                      title="아래로 이동"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeChapter(chapter.id);
                      }}
                      className="rounded p-0.5 text-text-tertiary hover:text-status-error-text"
                      title="챕터 삭제"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
              {isOpen && (
                <div className="ml-4 flex flex-col gap-0.5 border-l border-border pl-2">
                  {chapter.scenes.map((scene, sceneIndex) => {
                    const isSelected = chapter.id === selectedChapterId && scene.id === selectedSceneId;
                    const isEmpty = scene.content.trim().length === 0;
                    const isFirstScene = sceneIndex === 0;
                    const isLastScene = sceneIndex === chapter.scenes.length - 1;
                    return (
                      <div
                        key={scene.id}
                        onClick={() => selectScene(chapter.id, scene.id)}
                        className={cn(
                          'group flex cursor-pointer items-center gap-1 truncate rounded-md px-2 py-1 text-left text-[13px]',
                          isSelected
                            ? 'bg-brand-soft font-semibold text-brand-primary'
                            : isEmpty
                              ? 'text-text-tertiary hover:bg-background'
                              : 'text-text-secondary hover:bg-background'
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate">{scene.title}</span>
                        <div className="ml-auto flex flex-shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100">
                          <button
                            disabled={isFirstScene}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveScene(chapter.id, scene.id, 'up');
                            }}
                            className="rounded p-0.5 text-text-tertiary hover:text-brand-primary disabled:pointer-events-none disabled:opacity-30"
                            title="위로 이동"
                          >
                            <ArrowUp size={11} />
                          </button>
                          <button
                            disabled={isLastScene}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveScene(chapter.id, scene.id, 'down');
                            }}
                            className="rounded p-0.5 text-text-tertiary hover:text-brand-primary disabled:pointer-events-none disabled:opacity-30"
                            title="아래로 이동"
                          >
                            <ArrowDown size={11} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeScene(chapter.id, scene.id);
                            }}
                            className="rounded p-0.5 text-text-tertiary hover:text-status-error-text"
                            title="장면 삭제"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addScene(chapter.id);
                    }}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-left text-[12px] font-medium text-text-tertiary hover:bg-background hover:text-text-secondary"
                  >
                    <Plus size={11} /> 장면 추가
                  </button>
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
