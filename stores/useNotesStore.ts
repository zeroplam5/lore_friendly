// 구상함(아이디어)·장면 메모 — 정식 데이터 모델(types/*.ts)에 없는 시각적 보강 기능.
// 별도의 non-canonical localStorage 키(lore_scene_ideas / lore_scene_memos)만 사용하고
// ProjectDraft/ConfirmedSetting/IssueResolution 스키마는 건드리지 않는다.
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Idea {
  id: string;
  text: string;
}

export interface SceneMemo {
  id: string;
  chapterId: string;
  sceneId: string;
  text: string;
  createdAt: string;
}

interface NotesState {
  ideas: Idea[];
  memos: SceneMemo[];
  /** 현재 작업 단계 — ProjectUniverseConfig 스키마에 없는 순수 UI 표시용 값 */
  projectStage: string;
  addIdea: (text: string) => void;
  removeIdea: (id: string) => void;
  addMemo: (chapterId: string, sceneId: string, text: string) => void;
  removeMemo: (id: string) => void;
  setProjectStage: (stage: string) => void;
}

const DEFAULT_IDEAS: Idea[] = [
  { id: 'idea-1', text: '테서렉트가 의식을 가지고 있다면?' },
  { id: 'idea-2', text: '하워드와 페기의 대화 장면 아이디어' },
  { id: 'idea-3', text: '히드라 내부 반란 서브플롯' },
];

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      ideas: DEFAULT_IDEAS,
      memos: [],
      projectStage: '초고 집필 중',
      setProjectStage: (stage) => set({ projectStage: stage }),
      addIdea: (text) =>
        set((state) => ({ ideas: [...state.ideas, { id: `idea-${Date.now()}`, text }] })),
      removeIdea: (id) => set((state) => ({ ideas: state.ideas.filter((i) => i.id !== id) })),
      addMemo: (chapterId, sceneId, text) =>
        set((state) => ({
          memos: [
            ...state.memos,
            { id: `memo-${Date.now()}`, chapterId, sceneId, text, createdAt: new Date().toISOString() },
          ],
        })),
      removeMemo: (id) => set((state) => ({ memos: state.memos.filter((m) => m.id !== id) })),
    }),
    { name: 'lore_scene_notes' }
  )
);
