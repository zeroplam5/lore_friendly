// Gemini 구조화 출력 호출 — ai.md §1·§2·§5
import { Type, type Schema } from '@google/genai';
import type { IssueItem } from '@/types';
import { getGeminiClient, GEMINI_GENERATION_MODEL } from './geminiClient';
import { SYSTEM_PROMPT } from './prompt';

/** Gemini가 직접 생성하는 필드만 포함 — id/status는 파이프라인에서 부여한다. */
export type RawIssue = Omit<IssueItem, 'id' | 'status'>;

const CITATION_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    sourceType: { type: Type.STRING, enum: ['INTERNAL', 'CANON'] },
    title: { type: Type.STRING },
    snippet: { type: Type.STRING },
  },
  required: ['sourceType', 'title', 'snippet'],
};

const ISSUE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, enum: ['INTERNAL_CONTRADICTION', 'DIVERGENCE', 'INFO'] },
    title: { type: Type.STRING },
    chapterId: { type: Type.STRING },
    sceneId: { type: Type.STRING },
    targetQuote: { type: Type.STRING },
    contextPrefix: { type: Type.STRING },
    paragraphIndex: { type: Type.INTEGER },
    analysis: { type: Type.STRING },
    suggestion: { type: Type.STRING },
    citation: CITATION_SCHEMA,
  },
  required: [
    'type',
    'title',
    'chapterId',
    'sceneId',
    'targetQuote',
    'contextPrefix',
    'paragraphIndex',
    'analysis',
    'suggestion',
    'citation',
  ],
};

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    issues: { type: Type.ARRAY, items: ISSUE_SCHEMA },
  },
  required: ['issues'],
};

export async function runNarrativeCheck(userPrompt: string): Promise<RawIssue[]> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: GEMINI_GENERATION_MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini 응답에 text가 없습니다.');
  }

  const parsed = JSON.parse(text) as { issues: RawIssue[] };
  return parsed.issues ?? [];
}
