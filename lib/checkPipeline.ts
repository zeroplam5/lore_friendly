// 검증 파이프라인 오케스트레이션 — ai.md §1, Backend&DB.md §3.1
import { randomUUID } from 'crypto';
import type { CheckRequest, CheckResponse, IssueItem, CanonicalBaseline } from '@/types';
import { MARVEL_BASELINE } from './canon';
import { DEMO_PROJECT } from './project';
import { embedText } from './embeddings';
import { searchRelevantBaselines } from './vectorSearch';
import { runNarrativeCheck } from './gemini';
import { buildUserPrompt, type LabeledScene } from './prompt';

function countParagraphs(content: string): number {
  return content.split(/\n+/).filter((p) => p.trim().length > 0).length;
}

/** confirmedSettings가 대체한 baseline을 제외한 유효 baseline 목록. Backend&DB.md §3.1-1 */
function filterActiveBaselines(
  baselines: CanonicalBaseline[],
  confirmedSettings: CheckRequest['confirmedSettings']
): CanonicalBaseline[] {
  const replacedIds = new Set(
    (confirmedSettings ?? [])
      .map((s) => s.replacesBaselineId)
      .filter((id): id is string => Boolean(id))
  );
  return baselines.filter((b) => !replacedIds.has(b.id));
}

/**
 * targets에 포함되지 않은 나머지 모든 장면을 내부 컨텍스트로 수집한다.
 * MVP 단순화: 순서(장면이 targets보다 앞인지)와 무관하게 targets 이외 전체 장면을 사용한다.
 * 데모 프로젝트가 하나뿐이고 장면 수가 적어 이 단순화로도 데모 목적엔 충분하다.
 */
function collectInternalContext(targets: CheckRequest['targets']): LabeledScene[] {
  const targetSceneKeys = new Set(targets.map((t) => `${t.chapterId}/${t.sceneId}`));
  const scenes: LabeledScene[] = [];

  for (const chapter of DEMO_PROJECT.chapters) {
    for (const scene of chapter.scenes) {
      const key = `${chapter.id}/${scene.id}`;
      if (targetSceneKeys.has(key)) continue;
      if (!scene.content.trim()) continue;
      scenes.push({
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        sceneId: scene.id,
        sceneTitle: scene.title,
        content: scene.content,
      });
    }
  }
  return scenes;
}

export async function runCheckPipeline(request: CheckRequest): Promise<CheckResponse> {
  const confirmedSettings = request.confirmedSettings ?? [];

  let relevantBaselines: CanonicalBaseline[];
  if (request.selectedBaselines) {
    // 작가가 자료실에서 체크박스로 직접 고른 기준 설정 — 자동 임베딩 검색을 건너뛴다.
    // 커스텀 기준 설정은 서버(marvel_baseline.json)에 없으므로 객체 전체를 그대로 신뢰한다.
    relevantBaselines = filterActiveBaselines(request.selectedBaselines, confirmedSettings);
  } else {
    const activeBaselines = filterActiveBaselines(MARVEL_BASELINE, confirmedSettings);
    const combinedTargetText = request.targets.map((t) => t.content).join('\n\n');
    const queryEmbedding = await embedText(combinedTargetText);
    relevantBaselines = searchRelevantBaselines(queryEmbedding, activeBaselines, 2);
  }

  const internalContextScenes = collectInternalContext(request.targets);

  const userPrompt = buildUserPrompt({
    baselines: relevantBaselines,
    confirmedSettings,
    internalContextScenes,
    targets: request.targets,
  });

  const rawIssues = await runNarrativeCheck(userPrompt);

  const issues: IssueItem[] = rawIssues.map((issue) => ({
    ...issue,
    id: `issue-${randomUUID()}`,
    status: 'UNRESOLVED',
  }));

  const scannedParagraphs = request.targets.reduce(
    (sum, t) => sum + countParagraphs(t.content),
    0
  );

  return {
    success: true,
    issues,
    meta: {
      scannedParagraphs,
      latencyMs: 0, // route.ts에서 실측 후 덮어씀
      isFallback: false,
    },
  };
}
