// 집필 탭 중앙 에디터 — 입력 전용(하이라이트 렌더 없음). docs/ui_ux.md §3.3, §7(집중모드)
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useDraftStore, findScene } from '@/stores/useDraftStore';
import { useCanonStore } from '@/stores/useCanonStore';
import { useIssueStore } from '@/stores/useIssueStore';
import { runCheck } from '@/lib/checkClient';
import { cn } from '@/lib/cn';

const CHAR_GOAL = 5000;
const AUTOSAVE_DELAY_MS = 500;

interface DocumentEditorProps {
  isFocusMode: boolean;
  onEnterFocusMode: () => void;
  onExitFocusMode: () => void;
}

export function DocumentEditor({ isFocusMode, onEnterFocusMode, onExitFocusMode }: DocumentEditorProps) {
  const router = useRouter();
  const project = useDraftStore((s) => s.project);
  const selectedChapterId = useDraftStore((s) => s.selectedChapterId);
  const selectedSceneId = useDraftStore((s) => s.selectedSceneId);
  const updateSceneContent = useDraftStore((s) => s.updateSceneContent);
  const confirmedSettings = useCanonStore((s) => s.confirmedSettings);
  const setIssues = useIssueStore((s) => s.setIssues);

  const { chapter, scene } = findScene(project, selectedChapterId, selectedSceneId);

  const [draft, setDraft] = useState(scene?.content ?? '');
  const [isChecking, setIsChecking] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDraft(scene?.content ?? '');
  }, [scene?.id]);

  if (!chapter || !scene) {
    return <div className="flex h-full items-center justify-center text-text-tertiary">장면을 선택하세요.</div>;
  }

  const handleChange = (value: string) => {
    setDraft(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateSceneContent(chapter.id, scene.id, value);
    }, AUTOSAVE_DELAY_MS);
  };

  const handleValidate = async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    updateSceneContent(chapter.id, scene.id, draft);
    setIsChecking(true);
    try {
      const response = await runCheck({
        projectId: project.id,
        scope: 'SCENE',
        chapterId: chapter.id,
        sceneId: scene.id,
        targets: [{ chapterId: chapter.id, sceneId: scene.id, content: draft }],
        confirmedSettings,
      });
      setIssues(response.issues, response.meta.isFallback, 'SCENE');
      router.push('/review');
    } catch (error) {
      console.error('[검증 요청 실패]', error);
      alert('검증 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsChecking(false);
    }
  };

  const charCount = draft.length;

  return (
    <div
      className={cn(
        'flex h-full flex-col items-center overflow-y-auto',
        isFocusMode ? 'bg-focusBg' : 'bg-background'
      )}
    >
      <div className={cn('flex w-full flex-col items-center px-6 py-6', !isFocusMode && 'gap-3')}>
        {!isFocusMode && (
          <div className="flex w-full max-w-[720px] items-center justify-between">
            <span className="text-[13px] text-text-secondary">
              {chapter.title} · {scene.title}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onEnterFocusMode}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-text-tertiary hover:bg-surface"
              >
                <Maximize2 size={13} /> 집중 모드
              </button>
              <Button variant="primary" onClick={handleValidate} disabled={isChecking}>
                {isChecking ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 size={14} className="animate-spin" /> 검증 중...
                  </span>
                ) : (
                  '현재 장면 검증 →'
                )}
              </Button>
            </div>
          </div>
        )}

        <div
          className={cn(
            'w-full rounded-t-xl bg-surface shadow-sheet',
            isFocusMode ? 'max-w-[680px] rounded-xl p-[60px] shadow-focusSheet' : 'max-w-[720px] p-10'
          )}
        >
          {isFocusMode && (
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-[22px] font-bold text-text-primary">{scene.title}</h1>
              <button
                onClick={onExitFocusMode}
                className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-primary"
              >
                <Minimize2 size={13} /> 집중 모드 끝내기
              </button>
            </div>
          )}

          <textarea
            value={draft}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="이 장면의 이야기를 시작해보세요..."
            className="prose-manuscript min-h-[420px] w-full resize-none bg-transparent text-text-primary outline-none placeholder:text-text-tertiary"
          />

          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <div className="flex flex-shrink-0 items-center gap-2">
              <span className="whitespace-nowrap text-xs text-text-tertiary">
                {charCount.toLocaleString()}자 / 목표 {CHAR_GOAL.toLocaleString()}자
              </span>
              <ProgressBar percent={(charCount / CHAR_GOAL) * 100} className="w-24 flex-shrink-0" />
            </div>
            <span className="flex-shrink-0 whitespace-nowrap text-xs text-text-tertiary">
              자동 저장됨 {new Date(scene.lastSaved).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {isFocusMode && (
          <Button variant="primary" onClick={handleValidate} disabled={isChecking} className="mt-4">
            {isChecking ? '검증 중...' : '현재 장면 검증 →'}
          </Button>
        )}
      </div>
    </div>
  );
}
