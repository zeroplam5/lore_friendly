// 원작 기준 설정(Baseline) 로더 — ai.md §2.3 / Backend&DB.md §2.1-A
// data/canon/marvel_baseline.json 을 CanonicalBaseline[] 타입으로 노출한다.
//
// embedding 값은 768차원 벡터 중 일부만 표기된 사전 계산 placeholder다
// (실제 임베딩은 검증 엔진 구현 단계에서 채워 넣는다).
import rawBaselines from '@/data/canon/marvel_baseline.json';
import type { CanonicalBaseline } from '@/types';

export const MARVEL_BASELINE: CanonicalBaseline[] = rawBaselines as CanonicalBaseline[];
