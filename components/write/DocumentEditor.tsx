// 집필 탭 중앙 에디터 — 입력 전용(하이라이트 렌더 없음). docs/ui_ux.md §3.3, §7(집중모드)
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useDraftStore, findScene } from '@/stores/useDraftStore';
import { useCanonStore, useSelectedBaselinesForValidation } from '@/stores/useCanonStore';
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
  const selectedBaselines = useSelectedBaselinesForValidation();
  const setIssues = useIssueStore((s) => s.setIssues);

  const { chapter, scene } = findScene(project, selectedChapterId, selectedSceneId);

  const [draft, setDraft] = useState(scene?.content ?? '');
  const [isChecking, setIsChecking] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 디바운스 타이머가 아직 안 끝난 상태에서 장면 전환/탭 이동으로 이 컴포넌트가 언마운트되면
  // setState 클로저가 유실돼 방금 입력한 내용이 조용히 사라진다 — pendingRef에 미반영 값을
  // 들고 있다가 장면 전환·언마운트 시 즉시 flush한다.
  const pendingRef = useRef<{ chapterId: string; sceneId: string; value: string } | null>(null);

  const flushPending = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (pendingRef.current) {
      const { chapterId, sceneId, value } = pendingRef.current;
      updateSceneContent(chapterId, sceneId, value);
      pendingRef.current = null;
    }
  };

  useEffect(() => {
    setDraft(scene?.content ?? '');
  }, [scene?.id]);

  // 장면 전환/탭 이동(같은 앱 안에서의 언마운트)뿐 아니라, 새로고침·탭 닫기처럼 JS 실행
  // 컨텍스트 자체가 종료되는 경우에도 대기 중인 자동저장이 유실되지 않도록 flush한다.
  // beforeunload/pagehide는 언마운트 cleanup이 실행되지 않을 수 있어 별도로 등록한다.
  useEffect(() => {
    window.addEventListener('beforeunload', flushPending);
    window.addEventListener('pagehide', flushPending);
    return () => {
      window.removeEventListener('beforeunload', flushPending);
      window.removeEventListener('pagehide', flushPending);
    };
  });

  useEffect(() => {
    return () => {
      flushPending();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter?.id, scene?.id]);

  if (!chapter || !scene) {
    return <div className="flex h-full items-center justify-center text-text-tertiary">장면을 선택하세요.</div>;
  }

  const handleChange = (value: string) => {
    setDraft(value);
    pendingRef.current = { chapterId: chapter.id, sceneId: scene.id, value };
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateSceneContent(chapter.id, scene.id, value);
      pendingRef.current = null;
      debounceRef.current = null;
    }, AUTOSAVE_DELAY_MS);
  };

  const handleValidate = async () => {
    flushPending();
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
        selectedBaselines,
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
