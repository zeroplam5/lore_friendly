// 쟁점(Issue) 스토어 — ai.md §2.2, §4 / Backend&DB.md §2.1-D lore_issue_resolutions
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IssueItem, IssueResolution, IssueStatus, ValidationScope } from '@/types';

interface IssueState {
  /** 최신 /api/check 응답 — 세션 한정, 영속화하지 않음 */
  issues: IssueItem[];
  isFallback: boolean;
  scope: ValidationScope;
  selectedIssueId: string | null;
  statusFilter: IssueStatus | 'ALL';

  /** 문제없음/보류 이력 — 장면 단위로 영속화 */
  issueResolutions: IssueResolution[];

  setIssues: (issues: IssueItem[], isFallback: boolean, scope: ValidationScope) => void;
  setScope: (scope: ValidationScope) => void;
  selectIssue: (id: string | null) => void;
  setStatusFilter: (status: IssueStatus | 'ALL') => void;
  updateIssueStatus: (id: string, status: IssueStatus) => void;
  addResolution: (resolution: IssueResolution) => void;
}

export const useIssueStore = create<IssueState>()(
  persist(
    (set) => ({
      issues: [],
      isFallback: false,
      scope: 'SCENE',
      selectedIssueId: null,
      statusFilter: 'ALL',
      issueResolutions: [],

      setIssues: (issues, isFallback, scope) =>
        set({ issues, isFallback, scope, selectedIssueId: issues[0]?.id ?? null }),
      setScope: (scope) => set({ scope }),
      selectIssue: (id) => set({ selectedIssueId: id }),
      setStatusFilter: (status) => set({ statusFilter: status }),
      updateIssueStatus: (id, status) =>
        set((state) => ({
          issues: state.issues.map((issue) => (issue.id === id ? { ...issue, status } : issue)),
        })),
      addResolution: (resolution) =>
        set((state) => ({ issueResolutions: [...state.issueResolutions, resolution] })),
    }),
    {
      name: 'lore_issue_resolutions',
      partialize: (state) => ({ issueResolutions: state.issueResolutions }),
    }
  )
);

export function countByStatus(issues: IssueItem[]) {
  return {
    UNRESOLVED: issues.filter((i) => i.status === 'UNRESOLVED').length,
    DEFERRED: issues.filter((i) => i.status === 'DEFERRED').length,
    RESOLVED: issues.filter((i) => i.status === 'RESOLVED' || i.status === 'CONFIRMED').length,
  };
}
