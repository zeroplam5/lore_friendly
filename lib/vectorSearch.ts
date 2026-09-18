// 인메모리 벡터 검색 엔진 — Backend&DB.md §4
import type { CanonicalBaseline } from '@/types';

export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function searchRelevantBaselines(
  queryEmbedding: number[],
  baselines: CanonicalBaseline[],
  topK: number = 2
): CanonicalBaseline[] {
  return baselines
    .filter((item) => item.embedding && item.embedding.length > 0)
    .map((item) => ({
      item,
      score: cosineSimilarity(queryEmbedding, item.embedding!),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((res) => res.item);
}
