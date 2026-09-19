// 원고/프로젝트 구조 스토어 — Backend&DB.md §5 lore_current_draft
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import demoProjectRaw from '@/data/drafts/demo_project.json';
import type { Chapter, ProjectDraft, ProjectUniverseConfig } from '@/types';

const demoProject = demoProjectRaw as ProjectDraft;

interface DraftState {
  project: ProjectDraft;
  selectedChapterId: string;
  selectedSceneId: string;
  selectScene: (chapterId: string, sceneId: string) => void;
  updateSceneContent: (chapterId: string, sceneId: string, content: string) => void;
  updateUniverseConfig: (patch: Partial<ProjectUniverseConfig>) => void;
  addChapter: (title: string) => void;
  removeChapter: (chapterId: string) => void;
  moveChapter: (chapterId: string, direction: 'up' | 'down') => void;
  renameChapter: (chapterId: string, title: string) => void;
  addScene: (chapterId: string) => void;
  removeScene: (chapterId: string, sceneId: string) => void;
  moveScene: (chapterId: string, sceneId: string, direction: 'up' | 'down') => void;
}

const firstChapter = demoProject.chapters[0];
const firstScene = firstChapter?.scenes[0];

/** project.chapters 중 하나만 골라 바꾸는 헬퍼 — 나머지 챕터는 그대로 둔다 */
function mapChapter(
  chapters: Chapter[],
  chapterId: string,
  updater: (chapter: Chapter) => Chapter
): Chapter[] {
  return chapters.map((c) => (c.id === chapterId ? updater(c) : c));
}

/** 첫 번째로 장면이 있는 챕터의 첫 장면 — 챕터/장면 삭제 후 대체 선택지를 찾을 때 사용 */
function firstAvailableScene(chapters: Chapter[]): { chapterId: string; sceneId: string } | null {
  for (const chapter of chapters) {
    if (chapter.scenes[0]) return { chapterId: chapter.id, sceneId: chapter.scenes[0].id };
  }
  return null;
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      project: demoProject,
      selectedChapterId: firstChapter?.id ?? '',
      selectedSceneId: firstScene?.id ?? '',

      selectScene: (chapterId, sceneId) =>
        set({ selectedChapterId: chapterId, selectedSceneId: sceneId }),

      updateSceneContent: (chapterId, sceneId, content) =>
        set((state) => ({
          project: {
            ...state.project,
            chapters: mapChapter(state.project.chapters, chapterId, (chapter) => ({
              ...chapter,
              scenes: chapter.scenes.map((scene) =>
                scene.id !== sceneId
                  ? scene
                  : { ...scene, content, lastSaved: new Date().toISOString() }
              ),
            })),
          },
        })),

      updateUniverseConfig: (patch) =>
        set((state) => ({
          project: {
            ...state.project,
            universeConfig: { ...state.project.universeConfig, ...patch },
          },
        })),

      addChapter: (title) =>
        set((state) => {
          const nextOrder = state.project.chapters.length + 1;
          return {
            project: {
              ...state.project,
              chapters: [
                ...state.project.chapters,
                {
                  id: `ch-${Date.now()}`,
                  title,
                  order: nextOrder,
                  scenes: [
                    {
                      id: `scene-${Date.now()}`,
                      title: '장면 1',
                      order: 1,
                      content: '',
                      lastSaved: new Date().toISOString(),
                    },
                  ],
                },
              ],
            },
          };
        }),

      removeChapter: (chapterId) =>
        set((state) => {
          const remaining = state.project.chapters
            .filter((c) => c.id !== chapterId)
            .map((c, i) => ({ ...c, order: i + 1 }));

          const wasSelected = state.selectedChapterId === chapterId;
          const nextChapter = wasSelected ? remaining[0] : undefined;

          return {
            project: { ...state.project, chapters: remaining },
            ...(wasSelected && {
              selectedChapterId: nextChapter?.id ?? '',
              selectedSceneId: nextChapter?.scenes[0]?.id ?? '',
            }),
          };
        }),

      moveChapter: (chapterId, direction) =>
        set((state) => {
          const chapters = [...state.project.chapters];
          const index = chapters.findIndex((c) => c.id === chapterId);
          const targetIndex = direction === 'up' ? index - 1 : index + 1;
          if (index === -1 || targetIndex < 0 || targetIndex >= chapters.length) {
            return state;
          }
          [chapters[index], chapters[targetIndex]] = [chapters[targetIndex], chapters[index]];
          const reordered = chapters.map((c, i) => ({ ...c, order: i + 1 }));
          return { project: { ...state.project, chapters: reordered } };
        }),

      renameChapter: (chapterId, title) =>
        set((state) => ({
          project: {
            ...state.project,
            chapters: mapChapter(state.project.chapters, chapterId, (chapter) => ({
              ...chapter,
              title,
            })),
          },
        })),

      addScene: (chapterId) =>
        set((state) => {
          const newSceneId = `scene-${Date.now()}`;
          const chapters = mapChapter(state.project.chapters, chapterId, (chapter) => ({
            ...chapter,
            scenes: [
              ...chapter.scenes,
              {
                id: newSceneId,
                title: `장면 ${chapter.scenes.length + 1}`,
                order: chapter.scenes.length + 1,
                content: '',
                lastSaved: new Date().toISOString(),
              },
            ],
          }));
          return { project: { ...state.project, chapters } };
        }),

      removeScene: (chapterId, sceneId) =>
        set((state) => {
          const chapters = mapChapter(state.project.chapters, chapterId, (chapter) => ({
            ...chapter,
            scenes: chapter.scenes
              .filter((s) => s.id !== sceneId)
              .map((s, i) => ({ ...s, order: i + 1 })),
          }));

          const wasSelected = state.selectedSceneId === sceneId && state.selectedChapterId === chapterId;
          if (!wasSelected) {
            return { project: { ...state.project, chapters } };
          }

          const ownerChapter = chapters.find((c) => c.id === chapterId);
          const fallback = ownerChapter?.scenes[0]
            ? { chapterId, sceneId: ownerChapter.scenes[0].id }
            : firstAvailableScene(chapters);

          return {
            project: { ...state.project, chapters },
            selectedChapterId: fallback?.chapterId ?? '',
            selectedSceneId: fallback?.sceneId ?? '',
          };
        }),

      moveScene: (chapterId, sceneId, direction) =>
        set((state) => {
          const chapters = mapChapter(state.project.chapters, chapterId, (chapter) => {
            const scenes = [...chapter.scenes];
            const index = scenes.findIndex((s) => s.id === sceneId);
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            if (index === -1 || targetIndex < 0 || targetIndex >= scenes.length) {
              return chapter;
            }
            [scenes[index], scenes[targetIndex]] = [scenes[targetIndex], scenes[index]];
            return { ...chapter, scenes: scenes.map((s, i) => ({ ...s, order: i + 1 })) };
          });
          return { project: { ...state.project, chapters } };
        }),
    }),
    { name: 'lore_current_draft' }
  )
);

export function findScene(project: ProjectDraft, chapterId: string, sceneId: string) {
  const chapter = project.chapters.find((c) => c.id === chapterId);
  const scene = chapter?.scenes.find((s) => s.id === sceneId);
  return { chapter, scene };
}
