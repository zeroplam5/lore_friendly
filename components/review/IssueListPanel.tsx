// 검토 탭 좌측 패널 — ScopeTabs + 상태 필터 칩 + IssueCard 목록. docs/ui_ux.md §3
'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ScopeTabs } from './ScopeTabs';
import { IssueCard } from './IssueCard';
import { FilterPill } from '@/components/ui/FilterPill';
import { useIssueStore, countByStatus } from '@/stores/useIssueStore';
import { useDraftStore } from '@/stores/useDraftStore';
import { useCanonStore, useSelectedBaselinesForValidation } from '@/stores/useCanonStore';
import { buildCheckTargets } from '@/lib/buildCheckTargets';
import { runCheck } from '@/lib/checkClient';
import type { IssueStatus, ValidationScope } from '@/types';

export function IssueListPanel() {
  const project = useDraftStore((s) => s.project);
  const selectedChapterId = useDraftStore((s) => s.selectedChapterId);
  const selectedSceneId = useDraftStore((s) => s.selectedSceneId);
  const confirmedSettings = useCanonStore((s) => s.confirmedSettings);
  const selectedBaselines = useSelectedBaselinesForValidation();

  const issues = useIssueStore((s) => s.issues);
  const scope = useIssueStore((s) => s.scope);
  const selectedIssueId = useIssueStore((s) => s.selectedIssueId);
  const statusFilter = useIssueStore((s) => s.statusFilter);
  const setIssues = useIssueStore((s) => s.setIssues);
  const setScope = useIssueStore((s) => s.setScope);
  const selectIssue = useIssueStore((s) => s.selectIssue);
  const setStatusFilter = useIssueStore((s) => s.setStatusFilter);

  const [isLoading, setIsLoading] = useState(false);

  const counts = countByStatus(issues);

  const handleScopeChange = async (nextScope: ValidationScope) => {
    setScope(nextScope);
    setIsLoading(true);
    try {
      const targets = buildCheckTargets(project, nextScope, selectedChapterId, selectedSceneId);
      if (targets.length === 0) return;
      const response = await runCheck({
        projectId: project.id,
        scope: nextScope,
        chapterId: nextScope !== 'PROJECT' ? selectedChapterId : undefined,
        sceneId: nextScope === 'SCENE' ? selectedSceneId : undefined,
        targets,
        confirmedSettings,
        selectedBaselines,
      });
      setIssues(response.issues, response.meta.isFallback, nextScope);
    } catch (error) {
      console.error('[재검증 실패]', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = issues.filter((issue) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'RESOLVED') return issue.status === 'RESOLVED' || issue.status === 'CONFIRMED';
    return issue.status === statusFilter;
  });

  const filters: { value: IssueStatus | 'ALL'; label: string; count?: number }[] = [
    { value: 'UNRESOLVED', label: '미해결', count: counts.UNRESOLVED },
    { value: 'DEFERRED', label: '보류', count: counts.DEFERRED },
    { value: 'RESOLVED', label: '해결', count: counts.RESOLVED },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 pt-3">
        <ScopeTabs value={scope} onChange={handleScopeChange} disabled={isLoading} />
      </div>
      <div className="flex items-center gap-2 px-3 py-3">
        {filters.map((f) => (
          <FilterPill
            key={f.value}
            label={f.label}
            count={f.count}
            active={statusFilter === f.value}
            onClick={() => setStatusFilter(statusFilter === f.value ? 'ALL' : f.value)}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-text-tertiary">
            <Loader2 size={16} className="animate-spin" /> 검증 중...
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-text-tertiary">
            {issues.length === 0 ? '검증된 쟁점이 없습니다.' : '해당 조건의 쟁점이 없습니다.'}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                isSelected={issue.id === selectedIssueId}
                onSelect={() => selectIssue(issue.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
