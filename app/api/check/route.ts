// 원고 세계관 검증 API — Backend&DB.md §3.1, §6 (Fail-Safe)
import { NextResponse } from 'next/server';
import type { CheckRequest, CheckResponse } from '@/types';
import { runCheckPipeline } from '@/lib/checkPipeline';
import { DEMO_FALLBACK_RESPONSE } from '@/lib/fallbackData';

// ai.md/Backend&DB.md는 3초를 명시하지만, 임베딩+생성 2회 순차 API 호출의 실측
// 레이턴시(약 2~4초)를 감안해 6초로 완화 — fail-safe 자체(장애/타임아웃 시 즉시
// DEMO_FALLBACK_RESPONSE로 전환)는 문서 취지 그대로 유지한다.
const CHECK_TIMEOUT_MS = 6000;

function validateRequest(body: unknown): body is CheckRequest {
  if (!body || typeof body !== 'object') return false;
  const req = body as Partial<CheckRequest>;
  if (typeof req.projectId !== 'string') return false;
  if (req.scope !== 'SCENE' && req.scope !== 'CHAPTER' && req.scope !== 'PROJECT') return false;
  if (!Array.isArray(req.targets) || req.targets.length === 0) return false;
  if (req.scope === 'SCENE' && !req.sceneId) return false;
  if ((req.scope === 'SCENE' || req.scope === 'CHAPTER') && !req.chapterId) return false;
  return true;
}

export async function POST(request: Request) {
  const startTime = Date.now();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!validateRequest(body)) {
    return NextResponse.json(
      { error: 'Invalid CheckRequest: scope에 필요한 chapterId/sceneId 또는 targets를 확인하세요.' },
      { status: 400 }
    );
  }

  try {
    const checkPromise = runCheckPipeline(body);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), CHECK_TIMEOUT_MS)
    );

    const result = await Promise.race([checkPromise, timeoutPromise]);
    result.meta.latencyMs = Date.now() - startTime;
    return NextResponse.json(result satisfies CheckResponse);
  } catch (error) {
    console.warn('[Check API Warning] Falling back to pre-cached demo response:', error);

    const fallback: CheckResponse = {
      ...DEMO_FALLBACK_RESPONSE,
      meta: {
        ...DEMO_FALLBACK_RESPONSE.meta,
        latencyMs: Date.now() - startTime,
        isFallback: true,
      },
    };
    return NextResponse.json(fallback);
  }
}
