// 원고/프로젝트 구조 스토어 — Backend&DB.md §5 lore_current_draft
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import demoProjectRaw from '@/data/drafts/demo_project.json';
import type { ProjectDraft, ProjectUniverseConfig } from '@/types';

const demoProject = demoProjectRaw as ProjectDraft;

interface DraftState {
  project: ProjectDraft;
  selectedChapterId: string;
  selectedSceneId: string;
  selectScene: (chapterId: string, sceneId: string) => void;
  updateSceneContent: (chapterId: string, sceneId: string, content: string) => void;
  updateUniverseConfig: (patch: Partial<ProjectUniverseConfig>) => void;
  addChapter: (title: string) => void;
}

const firstChapter = demoProject.chapters[0];
const firstScene = firstChapter?.scenes[0];

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
            chapters: state.project.chapters.map((chapter) =>
              chapter.id !== chapterId
                ? chapter
                : {
                    ...chapter,
                    scenes: chapter.scenes.map((scene) =>
                      scene.id !== sceneId
                        ? scene
                        : { ...scene, content, lastSaved: new Date().toISOString() }
                    ),
                  }
            ),
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
    }),
    { name: 'lore_current_draft' }
  )
);

export function findScene(project: ProjectDraft, chapterId: string, sceneId: string) {
  const chapter = project.chapters.find((c) => c.id === chapterId);
  const scene = chapter?.scenes.find((s) => s.id === sceneId);
  return { chapter, scene };
}
