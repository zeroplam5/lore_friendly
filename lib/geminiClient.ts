// Gemini API 클라이언트 싱글턴 — GEMINI_API_KEY 환경 변수 필요
import { GoogleGenAI } from '@google/genai';

let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.');
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

// ai.md는 'Gemini 1.5 Flash'를 명시하지만 해당 모델은 API에서 제거되어(2026-09 확인),
// gemini-3.6-flash(API 권장 대체 모델)는 현재 수요 폭주로 503/3~4초 지연이 잦아
// 구조화 출력 테스트에서 훨씬 빠르고 안정적으로 응답한 lite 버전을 채택한다.
export const GEMINI_GENERATION_MODEL = 'gemini-3.1-flash-lite';
// 'text-embedding-004' 역시 제거되어 후속 모델로 대체. outputDimensionality:768로
// Backend&DB.md가 명시한 768차원 스펙을 그대로 유지한다.
export const GEMINI_EMBEDDING_MODEL = 'gemini-embedding-001';
export const GEMINI_EMBEDDING_DIMENSIONS = 768;
