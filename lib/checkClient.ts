// POST /api/check 클라이언트 래퍼 — 서버가 이미 6초 레이스+폴백을 처리하므로
// 클라이언트에서 별도 타임아웃을 두지 않는다 (Backend&DB.md §6).
import type { CheckRequest, CheckResponse } from '@/types';

export async function runCheck(request: CheckRequest): Promise<CheckResponse> {
  const res = await fetch('/api/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error(`검증 요청 실패 (status ${res.status})`);
  }

  return (await res.json()) as CheckResponse;
}
