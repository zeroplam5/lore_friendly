// 텍스트 임베딩 — Backend&DB.md §2.1-A (768차원 임베딩 벡터) / ai.md §1
import { getGeminiClient, GEMINI_EMBEDDING_MODEL, GEMINI_EMBEDDING_DIMENSIONS } from './geminiClient';

export async function embedText(text: string): Promise<number[]> {
  const ai = getGeminiClient();
  const response = await ai.models.embedContent({
    model: GEMINI_EMBEDDING_MODEL,
    contents: text,
    config: { outputDimensionality: GEMINI_EMBEDDING_DIMENSIONS },
  });

  const values = response.embeddings?.[0]?.values;
  if (!values || values.length === 0) {
    throw new Error('임베딩 응답에 values가 없습니다.');
  }
  return values;
}
