// data/canon/marvel_baseline.json 의 embedding 필드를 text-embedding-004 실값으로 재생성한다.
// 사용법: npm run embed:baseline (GEMINI_API_KEY가 .env.local에 설정되어 있어야 함)
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = path.join(__dirname, '..', 'data', 'canon', 'marvel_baseline.json');
// lib/geminiClient.ts 와 동일한 모델/차원을 사용한다 (text-embedding-004는 API에서 제거됨).
const EMBEDDING_MODEL = 'gemini-embedding-001';
const OUTPUT_DIMENSIONS = 768;

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY 환경 변수가 없습니다. .env.local을 확인하세요.');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  const raw = await readFile(BASELINE_PATH, 'utf-8');
  const baselines = JSON.parse(raw);

  for (const baseline of baselines) {
    const text = `${baseline.entity} ${baseline.rules.join(' ')} ${baseline.citationText}`;
    const response = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text,
      config: { outputDimensionality: OUTPUT_DIMENSIONS },
    });
    const values = response.embeddings?.[0]?.values;
    if (!values) {
      throw new Error(`임베딩 실패: ${baseline.id}`);
    }
    baseline.embedding = values;
    console.log(`✓ ${baseline.id} (${values.length}차원)`);
  }

  await writeFile(BASELINE_PATH, JSON.stringify(baselines, null, 2) + '\n', 'utf-8');
  console.log(`완료: ${BASELINE_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
