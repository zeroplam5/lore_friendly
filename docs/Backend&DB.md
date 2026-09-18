# Lore-Friendly — 백엔드 및 데이터 아키텍처 명세서 (BACKEND_DB.md)

이 문서는 밤샘 해커톤 MVP 및 향후 실서비스 확장을 고려한 **Lore-Friendly**의 서버 아키텍처, 데이터 영속성 모델, API 라우팅 및 인메모리 벡터 검색 파이프라인 명세서입니다.

---

## 1. 아키텍처 개요 (Single-Stack Next.js Architecture)

해커톤 환경의 디버깅 복잡도(CORS, 포트 충돌, 복수 배포 파이프라인)를 최소화하기 위해 **Next.js App Router 기반의 단일 풀스택(Single-stack)** 구조를 채택합니다.

```
[Client (Next.js App Router)]
        │
        ▼  Internal HTTP / Same-Origin
[Next.js Serverless Route Handlers (/api/*)]
        │
        ├─▶ In-Memory Vector Search (Cosine Similarity on Static Embeddings)
        ├─▶ Google Gemini 1.5 Flash API (Structured Output)
        │
        ▼ Fallback & Static Store
[JSON Datastores (data/canon/*.json, data/drafts/*.json)]
```

### 환경 분리 전략
* **MVP (해커톤/데모 마켓)**:
  * 서버: Next.js API Route Handlers (`app/api/*`).
  * DB: 서버 측 정적 JSON 파일 + 클라이언트 측 `localStorage` 영속화.
  * 검색: Node.js 런타임 메모리 내 코사인 유사도(Cosine Similarity) 연산.
* **Production (향후 확장)**:
  * 검증 엔진을 FastAPI + ChromaDB/Milvus 마이크로서비스로 분리. Next.js API는 게이트웨이 프록시 역할로 전환.

---

## 2. 데이터 영속성 모델 (Data Modeling)

### 2.1 파일 기반 데이터베이스 스키마

#### A. 원작 기준 설정 (`data/canon/marvel_baseline.json`)
공식 원작(Canon)의 불변 규칙 및 사전 임베딩 벡터를 보관합니다.

```typescript
export interface CanonicalBaseline {
  id: string;                      // 고유 ID (예: "base-tesseract-01")
  universe: "MCU" | "Earth-616";   // 세계관 분류
  entity: string;                  // 대상 개체 (예: "테서렉트", "캡틴 아메리카")
  category: "아이템" | "인물" | "사건" | "능력";
  rules: string[];                 // 공식 규칙 명제 리스트
  source: string;                  // 출처 문헌 (예: "MCU Visual Dictionary")
  citationText: string;            // 실제 인용구
  embedding?: number[];            // 768차원 임베딩 벡터 (사전 계산값)
}
```

#### B. 로컬 초안 및 메타데이터 (`data/drafts/demo_project.json`)
데모 시연용 프로젝트 기본값입니다.

```typescript
export interface Chapter {
  id: string;
  title: string;
  order: number;
  scenes: Scene[];
}

export interface Scene {
  id: string;
  title: string;
  order: number;
  content: string;                 // 마크다운 원고 본문
  lastSaved: string;               // ISO 8601 Timestamp
}

export interface ProjectDraft {
  id: string;
  title: string;                   // "푸른 큐브의 다른 가능성"
  author: string;                  // "서하윤"
  universeConfig: {
    baselineUniverse: string;      // "Earth-616 + MCU 혼합"
    complianceLevel: "STRICT" | "PERMISSIVE" | "FREE"; // 3-way 세그먼트
    referencedWorks: string[];
  };
  chapters: Chapter[];
}
```

#### C. 확정된 작품 설정 (`ConfirmedSettings` - 클라이언트 `localStorage`)
작가가 `[설정으로 확정]`을 클릭하여 기준 설정을 대체한 고유 설정(Canon) 목록입니다. `confirm-setting-dialog`의 5개 입력 필드(변경 내용 / 적용 대상 / 적용 시작 / 유지할 조건 / 대체하는 기존 설정)를 모두 반영합니다.

```typescript
export interface ConfirmedSetting {
  id: string;                      // "conf-01"
  replacesBaselineId?: string;     // 대체하는 기존 원작 ID ("base-tesseract-01")
  title: string;                   // "코스믹 큐브의 시간 간섭 능력"
  description: string;             // 변경 내용 (변경 확정 내용)
  targetScope: "PROJECT" | "CHAPTER" | "SCENE"; // 적용 대상 — 작품 전체 / 특정 챕터 / 특정 장면
  chapterId?: string;              // targetScope가 'CHAPTER' | 'SCENE' 일 때 필수
  sceneId?: string;                // targetScope가 'SCENE' 일 때 필수
  effectiveFromSceneId: string;    // 적용 시작 — 이 장면부터(포함) 새 설정을 유효한 것으로 간주
  maintainCondition?: string;      // 유지할 조건 — 예: "스톤이 파괴되기 전까지" (깨지면 재검토 필요)
  status: "APPROVED";
  confirmedAt: string;             // ISO Timestamp
  authorNote: string;              // 작가 메모
}
```

#### D. 검증 제외 이력 (`IssueResolution` - 클라이언트 `localStorage`)
`문제없음`(무시) 또는 `보류` 처리된 쟁점을 장면 단위로 기억해, 동일 구절을 반복 지적하지 않기 위한 데이터입니다.

```typescript
export type IgnoreReasonCode = 'LIE' | 'METAPHOR' | 'MISUNDERSTOOD' | 'CUSTOM';

export interface IssueResolution {
  issueId: string;                 // 대상 쟁점 ID
  chapterId: string;
  sceneId: string;                 // 제외가 적용되는 장면 — "이 구절에만 적용" 범위
  status: 'IGNORED' | 'DEFERRED';
  reasonCode?: IgnoreReasonCode;   // status가 'IGNORED'일 때 필수 (문제없음 사유 라디오 4종)
  reasonNote?: string;             // reasonCode가 'CUSTOM'일 때 직접 입력한 내용
  resolvedAt: string;              // ISO Timestamp
}
```

---

## 3. 백엔드 API 엔드포인트 명세

### 3.1 `POST /api/check` — 원고 세계관 검증

원고 텍스트와 현재 설정 덮어쓰기 목록을 전달받아 모순점을 검출합니다.

* **요청 헤더**: `Content-Type: application/json`
* **요청 본문 (Request Body)**: (`scope='SCENE'` 예시 — `ai.md §2.1 CheckRequest` 참조)
  ```json
  {
    "projectId": "cube-alt-possibility",
    "scope": "SCENE",
    "chapterId": "ch3",
    "sceneId": "scene2",
    "targets": [
      {
        "chapterId": "ch3",
        "sceneId": "scene2",
        "content": "스톤의 빛이 방 전체를 감쌌다. 붉은빛이 감도는 큐브는 스컬의 손 위에서..."
      }
    ],
    "confirmedSettings": [
      {
        "id": "conf-01",
        "title": "큐브 색상 붉은색 허용",
        "targetScope": "PROJECT"
      }
    ]
  }
  ```

* **처리 파이프라인**:
  1. `marvel_baseline.json`(+ 요청에 포함된 `selectedBaselines`)에서 `confirmedSettings`에 의해 대체된 규칙 필터링.
  2. `targets[].content`에서 핵심 키워드(엔티티) 추출 (장면별로 반복).
  3. 경량 벡터 연산(유사도 상위 2개 청크 선정) — **단, 요청에 `selectedBaselines`가 있으면 이 자동 검색을 건너뛰고 그 목록을 그대로 사용** (3차 개발 추가: 자료실 › 작품 설정 체크박스로 작가가 직접 검증 대상을 고르는 기능, `ai.md §1·§2.1` 참조).
  4. Gemini 1.5 Flash에 System Prompt 및 Context 주입 후 구조화된 JSON 요청.
  5. API 타임아웃(**3초**) 발생 시 즉각 `DEMO_FALLBACK_RESPONSE` 반환.

* **응답 본문 (Response Body)**:
  ```json
  {
    "success": true,
    "issues": [
      {
        "id": "issue-01",
        "type": "INTERNAL_CONTRADICTION",
        "status": "UNRESOLVED",
        "title": "테서렉트 색상 묘사 불일치",
        "chapterId": "ch3",
        "sceneId": "scene2",
        "targetQuote": "붉은빛이 감도는 큐브",
        "contextPrefix": "스톤의 빛이 방 전체를 감쌌다. ",
        "paragraphIndex": 0,
        "analysis": "본 작품 제1장 장면 3 내부 설정과 충돌합니다.",
        "suggestion": "푸른빛이 감도는 큐브",
        "citation": {
          "sourceType": "INTERNAL",
          "title": "본 작품 내부 - 제1장 장면 3, 14번째 문단",
          "snippet": "...그 푸른 광채가 실내 온도마저 떨어뜨리는 듯한 서늘한 색상이었다고 기록되었다."
        }
      }
    ],
    "meta": {
      "scannedParagraphs": 1,
      "latencyMs": 850,
      "isFallback": false
    }
  }
  ```

---

## 4. 인메모리 벡터 검색 및 유사도 계산 엔진

별도의 벡터 DB 인프라(Pinecone, ChromaDB 등) 없이 단일 Node.js 프로세스 내에서 동작하는 코사인 유사도 함수입니다.

```typescript
// lib/vectorSearch.ts
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
```

---

## 5. 클라이언트 영속성 계층 (Local Storage Store)

서버 DB 연결 없이 브라우저 상에서 작품 초안과 쟁점 해결 상태를 완벽히 유지하기 위한 Zustand/React Hook 영속화 설계입니다.

* **Key 관리**:
  * `lore_current_draft`: 현재 집필 중인 원고 텍스트 및 챕터 트리
  * `lore_confirmed_settings`: 작가가 승인한 `ConfirmedSetting[]` 목록. **(3차 개발 추가)** 같은 키에 아래 필드도 함께 저장:
    * `customBaselines`: 작가가 자료실에서 직접 만든 `CanonicalBaseline[]` (marvel_baseline.json에는 없는, 클라이언트 전용 데이터)
    * `hiddenBaselineIds`: 삭제된 기준 설정 id 목록 (built-in은 원본 JSON을 지울 수 없어 숨김 처리, 커스텀은 배열에서 완전히 제거)
    * `disabledBaselineIds`: 체크 해제되어 다음 검증 요청(`selectedBaselines`, `ai.md §2.1`)에서 제외되는 기준 설정 id 목록 — 삭제와는 별개의 토글
  * `lore_issue_resolutions`: 특정 구절 무시(`IGNORED`) 및 보류(`DEFERRED`) 상태를 장면 단위로 저장하는 `IssueResolution[]` 목록 (§2.1-D)

```typescript
// hooks/useDraftStore.ts (예시)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DraftState {
  content: string;
  confirmedSettings: ConfirmedSetting[];
  setContent: (content: string) => void;
  confirmSetting: (setting: ConfirmedSetting) => void;
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      content: "스톤의 빛이 방 전체를 감쌌다. 붉은빛이 감도는 큐브는...",
      confirmedSettings: [],
      setContent: (content) => set({ content }),
      confirmSetting: (setting) =>
        set((state) => ({
          confirmedSettings: [...state.confirmedSettings, setting],
        })),
    }),
    {
      name: 'lore_draft_storage',
    }
  )
);
```

---

## 6. 장애 격리 및 안전장치 (Fail-Safe Implementation)

데모 시연 중 발생할 수 있는 네트워크 끊김, 외부 LLM 장애(Rate Limit 429), 지연 시간 초과에 대응하는 방어벽 로직입니다.

```typescript
// app/api/check/route.ts 내부 예시
import { NextResponse } from 'next/server';
import { DEMO_FALLBACK_RESPONSE } from '@/lib/fallbackData';

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    const body = await req.json();

    // 3초 제한 타임아웃 프로미스 생성
    const checkPromise = performGeminiCheck(body);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), 3000)
    );

    const result = await Promise.race([checkPromise, timeoutPromise]);
    return NextResponse.json(result);

  } catch (error) {
    console.warn('[Check API Warning] Falling back to pre-cached demo response:', error);
    
    // 에러 발생 시 즉각 목 데이터 반환 (클라이언트는 정상 응답으로 인식)
    return NextResponse.json({
      ...DEMO_FALLBACK_RESPONSE,
      meta: {
        latencyMs: Date.now() - startTime,
        isFallback: true,
      },
    });
  }
}
```

---

## 7. PDF 내보내기(Export) — 클라이언트 목업 파이프라인

해커톤 MVP에서는 실제 서버 사이드 조판 엔진을 구현하지 않습니다. 대신 **① CSS로 재현한 실시간 미리보기 + ② 목업 진행률 애니메이션 + ③ 미리 준비된 샘플 PDF에 부록 페이지만 동적으로 병합**하는 클라이언트 전용 파이프라인을 사용합니다.

### 7.1 미리보기 (`export-pdf-preview`) — 실제 PDF 아님
- 화면에 보이는 지면은 실제 PDF 렌더링이 아니라 **Tailwind/CSS로 A5 비율을 그대로 재현한 HTML**입니다.
- `aspect-ratio: 148 / 210`, 배경 `#F1F0EE`(PDF 미리보기 지면, `DESIGN.md §4`), 폰트 나눔명조/`Lora` 세리프 폴백, `font-size: 11pt`, `line-height: 1.8`, `padding: 25mm 20mm`(상하/좌우) — `DESIGN.md §2 export-pdf-preview` 조판 기본값과 동일.
- 서버 전송 없이 브라우저 내에서만 렌더링되므로 페이지 수·글자 배치는 실제 다운로드 파일과 다를 수 있습니다(데모용 근사치).

### 7.2 생성 (`export-pdf-generating`) — 목업 진행률
- 실제 렌더링 작업 없이 `setInterval` 기반으로 진행률을 0 → **49%**까지 애니메이션합니다. (`DESIGN.md` 원본 값 "47페이지 중 23페이지 처리 중, 49%"를 고정 목업 상수로 사용)
- 애니메이션 종료 직후 §7.3의 병합 PDF 다운로드를 즉시 트리거합니다. 로컬 정적 파일 기반이라 실패·재시도 로직은 불필요합니다.

```typescript
// lib/exportMock.ts
const MOCK_TOTAL_PAGES = 47;
const MOCK_PROGRESS_TARGET = 49; // DESIGN.md 원본 값 고정 사용

export async function runMockExportProgress(
  onProgress: (percent: number, currentPage: number) => void
): Promise<void> {
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    await new Promise((r) => setTimeout(r, 150));
    const percent = Math.round((MOCK_PROGRESS_TARGET / steps) * i);
    const currentPage = Math.round((MOCK_TOTAL_PAGES * percent) / 100);
    onProgress(percent, currentPage);
  }
}
```

### 7.3 병합 & 다운로드 — 샘플 PDF + Canon Index 부록

정적 샘플 파일 `public/samples/Lore_Friendly_Sample.pdf`을 그대로 쓰되, 작가가 그동안 확정한 `ConfirmedSetting[]`(§2.1-C)을 **책 맨 뒤에 부록 1페이지**로 브라우저에서 동적 병합합니다. 서버 API 없이 `pdf-lib`로 클라이언트에서 처리합니다.

```typescript
// lib/exportPdf.ts
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface CanonIndexEntry {
  title: string;            // ConfirmedSetting.title
  description: string;      // ConfirmedSetting.description (정규화 적용, §7.4)
  scopeLabel: string;       // targetScope를 사람이 읽는 문구로 변환
  confirmedAt: string;      // "2026.09.15" 형식
}

export function toCanonIndex(settings: ConfirmedSetting[]): CanonIndexEntry[] {
  return settings.map((s) => ({
    title: s.title,
    description: normalizeQuotesForExport(s.description),
    scopeLabel:
      s.targetScope === 'PROJECT' ? '작품 전체' :
      s.targetScope === 'CHAPTER' ? `제${s.chapterId} 챕터` : `${s.chapterId} · ${s.sceneId}`,
    confirmedAt: s.confirmedAt.slice(0, 10).replace(/-/g, '.'),
  }));
}

export async function buildExportedPdf(
  sampleUrl: string,
  settings: ConfirmedSetting[]
): Promise<Blob> {
  const sampleBytes = await fetch(sampleUrl).then((r) => r.arrayBuffer());
  const pdfDoc = await PDFDocument.load(sampleBytes);
  const entries = toCanonIndex(settings);

  // 확정된 설정이 0건이면 빈 부록 페이지를 만들지 않고 샘플 PDF를 그대로 반환
  if (entries.length > 0) {
    const page = pdfDoc.addPage([419.5, 595.3]); // A5 pt 환산 (148×210mm)
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    page.drawText('부록 · Canon Index', { x: 56, y: 540, size: 18, font });
    page.drawText('작가가 확정한 고유 설정 목록', {
      x: 56, y: 518, size: 11, font, color: rgb(0.4, 0.4, 0.4),
    });

    let cursorY = 480;
    entries.forEach((entry, i) => {
      page.drawText(`${i + 1}. ${entry.title} — ${entry.scopeLabel} (${entry.confirmedAt})`, {
        x: 56, y: cursorY, size: 11, font,
      });
      page.drawText(entry.description, {
        x: 66, y: cursorY - 16, size: 10, font, color: rgb(0.3, 0.3, 0.3),
      });
      cursorY -= 40;
    });
  }

  const mergedBytes = await pdfDoc.save();
  return new Blob([mergedBytes], { type: 'application/pdf' });
}
```

### 7.4 따옴표 정규화 규칙 (조판 변환 — 확정)

`DESIGN.md §10.2-3`에서 발견된 "앱 내 작은따옴표 `'…'` vs PDF 큰따옴표 `"…"`" 불일치는 버그가 아니라 **의도된 조판 변환 규칙**으로 확정합니다. 에디터 원고의 작은따옴표(대사·강조용)는 내보내기 시 인쇄 관례에 맞춰 큰따옴표로 자동 치환됩니다.

```typescript
export function normalizeQuotesForExport(content: string): string {
  // 작은따옴표(직선/스마트 따옴표 모두 포함)로 감싼 구간을 큰따옴표로 치환
  return content.replace(/['']([^''""]*)['']/g, '"$1"');
}
```

- 샘플 PDF(`Lore_Friendly_Sample.pdf`) 본문은 이미 정규화가 반영된 상태로 미리 준비되어 있어 런타임 처리가 필요 없습니다.
- §7.3에서 동적으로 생성하는 Canon Index 부록의 `description`에는 위 함수를 실제로 적용합니다(작가가 확정 메모에 작은따옴표를 썼더라도 인쇄본에는 큰따옴표로 노출).

---

## 8. 자료실(Library) — 참고자료 목업 파이프라인

`§7`의 내보내기와 동일한 원칙으로, 실제 PDF/DOCX 파싱이나 LLM 기반 자료 간 불일치 분석 엔진을 구현하지 않습니다. 업로드·URL 등록은 **UI 인터랙션만 실제로 동작**하고, 본문 추출·분석 결과는 사전에 준비된 고정 데모 데이터를 사용합니다.

### 8.1 데이터 스키마

```typescript
export type ReferenceStatus = '추출 중' | '검토 가능' | '확인 필요';
export type ReferenceSourceType = 'PDF' | 'URL' | '직접 작성';

export interface ReferenceMaterial {
  id: string;
  title: string;                  // 자료명 (업로드 시 사용자 입력을 그대로 사용)
  sourceType: ReferenceSourceType;
  status: ReferenceStatus;
  appliedUniverse: string;        // 적용 세계관 (예: "MCU")
  addedAt: string;                // ISO Timestamp
  bodyPreview: string;            // 자료 본문 미리보기 — 목업 고정 텍스트
}

export interface ReferenceInconsistency {
  id: string;
  involvedReferenceIds: string[]; // 불일치가 발견된 자료 2건 이상의 ID
  summary: string;                // 예: "테서렉트 권능 범위 서술이 자료 간 다름"
}
```

### 8.2 고정 데모 데이터 (`data/library/demo_references.json`)

`library-references` 화면의 자료 5건 + 자료 간 불일치 1건을 그대로 목업 상수로 사용합니다.

```typescript
export const DEMO_REFERENCES: ReferenceMaterial[] = [
  { id: 'ref-01', title: 'MCU Visual Dictionary — 테서렉트 편', sourceType: 'PDF', status: '검토 가능', appliedUniverse: 'MCU', addedAt: '2026-09-12T09:00:00+09:00', bodyPreview: '테서렉트는 스페이스 스톤을 격납한 정육면체로, 공간 이동과 차원문 개방에만 사용된다.' },
  { id: 'ref-02', title: 'Captain America: The First Avenger 설정집', sourceType: 'PDF', status: '검토 가능', appliedUniverse: 'MCU', addedAt: '2026-09-12T09:05:00+09:00', bodyPreview: '1943년 하이드라 연구소, 레드 스컬이 테서렉트의 힘을 처음 확인하는 장면 기록.' },
  { id: 'ref-03', title: 'Agents of S.H.I.E.L.D. 위키 발췌', sourceType: 'URL', status: '확인 필요', appliedUniverse: 'MCU', addedAt: '2026-09-13T14:20:00+09:00', bodyPreview: '테서렉트를 범용 "에너지원"으로 서술 — 공식 설정집과 표현이 다름.' },
  { id: 'ref-04', title: '레드 스컬 캐릭터 연표 정리', sourceType: '직접 작성', status: '검토 가능', appliedUniverse: 'Earth-616 + MCU 혼합', addedAt: '2026-09-14T21:10:00+09:00', bodyPreview: '작가가 직접 정리한 레드 스컬 등장 시점·계급 연표.' },
  { id: 'ref-05', title: 'Thor(2011) 인피니티 스톤 설정', sourceType: 'PDF', status: '추출 중', appliedUniverse: 'MCU', addedAt: '2026-09-15T08:30:00+09:00', bodyPreview: '(추출 중) 리얼리티 스톤·타임 스톤과의 권능 구분 자료.' },
];

export const DEMO_INCONSISTENCIES: ReferenceInconsistency[] = [
  {
    id: 'inc-01',
    involvedReferenceIds: ['ref-01', 'ref-03'],
    summary: '테서렉트 권능 범위 서술 불일치 — 자료 1은 "공간 이동 전용", 자료 3은 "범용 에너지원"으로 설명',
  },
];

export const MOCK_ANALYSIS_PROGRESS = 84; // DESIGN.md 원본 값 고정 사용
```

### 8.3 목업 업로드 흐름 (`library-add-dialog` → `library-references`)

드래그앤드롭 파일(PDF/DOCX/TXT, 최대 50MB) 또는 URL 입력은 **실제로 읽거나 파싱하지 않습니다**. 사용자가 입력한 자료명·출처 유형·적용 세계관만 그대로 반영하고, 본문·분석 결과는 고정 템플릿으로 대체합니다.

```typescript
// lib/libraryMock.ts
export async function mockUploadReference(
  input: {
    title: string;
    sourceType: ReferenceSourceType;
    appliedUniverse: string;
  },
  onProgress: (percent: number) => void
): Promise<ReferenceMaterial> {
  // '추출 중' 상태에서 MOCK_ANALYSIS_PROGRESS(84%)까지 진행률만 재생 (실제 분석 없음)
  const steps = 8;
  for (let i = 1; i <= steps; i++) {
    await new Promise((r) => setTimeout(r, 120));
    onProgress(Math.round((MOCK_ANALYSIS_PROGRESS / steps) * i));
  }

  return {
    id: `ref-${Date.now()}`,
    title: input.title,
    sourceType: input.sourceType,
    status: '검토 가능',
    appliedUniverse: input.appliedUniverse,
    addedAt: new Date().toISOString(),
    bodyPreview: '(목업) 데모 환경에서는 실제 파일 내용을 분석하지 않으며, 고정된 샘플 본문으로 대체됩니다.',
  };
}
```

- 새로 추가된 자료는 `DEMO_REFERENCES` 뒤에 이어붙여 목록에 노출하되, `DEMO_INCONSISTENCIES`(자료 간 불일치)는 항상 §8.2의 고정 1건만 표시합니다 — 새로 추가한 자료를 기준으로 한 실시간 불일치 재계산은 수행하지 않습니다.
- `library-empty-state`(자료 0건)는 `DEMO_REFERENCES`를 비운 초기 상태로, "자료 추가" 클릭 시 위 목업 흐름을 그대로 따릅니다.