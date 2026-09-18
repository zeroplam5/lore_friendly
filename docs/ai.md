# 3. 검증 AI

작품 원고의 설정 모순과 원작(Canon)과의 괴리를 실시간으로 탐지하고 제어하는 **Narrative Linter AI 엔진**의 기술 아키텍처, 데이터 스키마, 좌표 매핑 알고리즘 및 안전장치 가이드입니다.

---

## 1. 아키텍처 및 검증 파이프라인

단일 LLM 호출의 지연 시간(Latency)을 최소화하기 위해 **경량 인메모리 RAG + 단일 패스 구조화 추론(Single-Pass Structured Extraction)** 구조를 채택합니다.

```
[원고 텍스트 (Editor)]
        │
        ▼
[1. 전처리 & 엔티티 매칭] ─── marvel_baseline.json (정적 사전 구축 데이터)
        │                      (Top-2 연관 기준 설정 주입)
        ▼
[2. Gemini 1.5 Flash] ────── Structured Outputs (JSON Schema 강제)
        │
        ▼
[3. 좌표 해석기 (Resolver)] ── context_prefix + target_quote 매핑
        │
   ┌────┴────────────────────────┐
   ▼                             ▼
[Success]                     [Fail/Timeout]
UI 렌더링                     Demo Fallback Mock 즉각 반환 (0.1s)
(Wavy 하이라이트 & 인스펙터 바인딩)
```

> **3차 개발에서 추가**: 위 "Top-2 연관 기준 설정 주입"은 클라이언트가 `selectedBaselines`를 보내지 않은 경우의 기본(자동) 동작입니다. 자료실 › 작품 설정 화면에서 작가가 기준 설정마다 체크박스로 "이번 검증에 포함" 여부를 직접 고를 수 있고, 체크된 목록이 `selectedBaselines`로 전달되면 1단계의 임베딩 유사도 검색을 건너뛰고 그 목록을 그대로 사용합니다 — §2.1 참조.

---

## 2. API 데이터 스키마 명세

### 2.1 검증 요청 (`POST /api/check`)

작품은 챕터(Chapter) › 장면(Scene) 구조를 가지며, 검증은 `ScopeTabs`(장면 / 챕터 / 작품 전체) 단위로 요청됩니다. `scope`에 따라 `targets`에 담기는 장면 수가 달라집니다 — `SCENE`은 1건, `CHAPTER`는 해당 챕터의 전체 장면, `PROJECT`는 작품의 전체 장면입니다.

```typescript
export type ValidationScope = 'SCENE' | 'CHAPTER' | 'PROJECT';

export interface CheckRequest {
  projectId: string;              // 예: "cube-alt-possibility"
  scope: ValidationScope;         // 검증 범위 (ScopeTabs: 장면 / 챕터 / 작품 전체)
  chapterId?: string;             // scope가 'CHAPTER' | 'SCENE' 일 때 필수
  sceneId?: string;               // scope가 'SCENE' 일 때 필수
  targets: {
    chapterId: string;
    sceneId: string;
    content: string;              // 해당 장면의 에디터 본문 전체 텍스트
  }[];                             // scope='SCENE'→1건 / 'CHAPTER'→해당 챕터 전체 장면 / 'PROJECT'→작품 전체 장면
  confirmedSettings?: ConfirmedSetting[]; // 작가가 확정한 설정 목록
  selectedBaselines?: CanonicalBaseline[]; // (3차 개발 추가) 작가가 자료실에서 체크박스로 직접 고른 기준 설정 전체 목록
}
```

`selectedBaselines`가 오면 서버는 자동 임베딩 유사도 검색(top-2)을 건너뛰고 이 목록을 그대로 검증 근거로 사용합니다. 작가가 자료실에서 직접 만든 커스텀 기준 설정은 서버(`marvel_baseline.json`)에 존재하지 않으므로 id가 아니라 `CanonicalBaseline` 객체 전체를 전달합니다. 필드를 생략하면(과거 호출과의 호환) 기존 자동 검색 동작을 그대로 유지합니다.

### 2.2 검증 응답 (`CheckResponse`)

```typescript
export type IssueType = 'INTERNAL_CONTRADICTION' | 'DIVERGENCE' | 'INFO';
export type IssueStatus = 'UNRESOLVED' | 'RESOLVED' | 'DEFERRED' | 'CONFIRMED' | 'IGNORED';

export interface Citation {
  sourceType: 'INTERNAL' | 'CANON'; // 작품 내부 vs 원작 자료
  title: string;                    // 예: "본 작품 제1장 장면 3, 14번째 문단"
  snippet: string;                  // 인용 원문
}

export interface IssueItem {
  id: string;                       // 고유 UUID (예: "issue-tesseract-color")
  type: IssueType;                  // 내부 모순 | 원작 차이 | 확인 필요
  status: IssueStatus;              // 미해결, 해결됨, 보류, 설정 확정, 무시됨
  title: string;                    // 예: "테서렉트 색상 묘사 불일치"
  chapterId: string;                // 이슈가 위치한 챕터 (targets 중 어느 장면인지 역추적)
  sceneId: string;                  // 이슈가 위치한 장면
  targetQuote: string;              // 본문 내 치환 대상 구절 ("붉은빛이 감도는 큐브")
  contextPrefix: string;            // 치환 오폭 방지용 직전 15~20자 ("스톤의 빛이 방 전체를 감쌌다.")
  paragraphIndex: number;           // 해당 장면 content 내 문단 번호 (0-indexed)
  analysis: string;                 // 충돌 사유 및 분석 내용
  suggestion: string;               // 수정 제안 문구 ("푸른빛이 감도는 큐브")
  citation: Citation;               // 근거 출처 및 발췌문
}

export interface CheckResponse {
  success: boolean;
  issues: IssueItem[];
  meta: {
    scannedParagraphs: number;
    latencyMs: number;
    isFallback: boolean;
  };
}
```

검증 제외 처리(`문제없음` 액션 결과인 `IGNORED`, `보류` 결과인 `DEFERRED`)는 장면 단위로 로컬에 저장됩니다 — 데이터 구조는 `Backend&DB.md §2.1-D IssueResolution` 참조.

### 2.3 기준 설정 DB 포맷 (`data/canon/marvel_baseline.json`)

스키마는 `Backend&DB.md §2.1-A CanonicalBaseline` 인터페이스를 그대로 따릅니다.

```json
[
  {
    "id": "base-tesseract-01",
    "universe": "MCU",
    "entity": "테서렉트",
    "category": "아이템",
    "rules": [
      "테서렉트는 영롱한 푸른빛의 정육면체 형태를 띤다.",
      "내부에 스페이스 스톤을 격납하고 있으며, 주요 권능은 공간 이동 및 차원문 개방이다.",
      "현실 개변(Reality Warping)은 리얼리티 스톤(에테르)의 권능이며, 시간 역행은 타임 스톤(아가모토의 눈)의 영역이다."
    ],
    "source": "MCU Visual Dictionary / Captain America: TFA",
    "citationText": "스페이스 스톤은 사용자를 임의의 공간으로 전송하거나 차원을 여는 능력을 지니며, 시간 축 간섭은 불가능하다.",
    "embedding": [0.0142, -0.0371, 0.0289]  // 768차원 중 일부만 표기 (사전 계산값)
  }
]
```

---

## 3. 좌표 매핑 & 치환 알고리즘 (Safe Replacer)

본문에 동일한 단어가 여러 번 등장할 때 발생하는 치환 오류를 방지하기 위해 `contextPrefix`를 결합한 복합 앵커링 기법을 적용합니다.

```typescript
/**
 * 정확한 위치의 targetQuote를 suggestion으로 치환하는 함수
 */
export function applySuggestionSafely(
  fullContent: string,
  issue: IssueItem
): string {
  const { contextPrefix, targetQuote, suggestion } = issue;
  const searchPattern = contextPrefix + targetQuote;
  const targetIndex = fullContent.indexOf(searchPattern);

  if (targetIndex === -1) {
    // 앵커 탐색 실패 시 targetQuote 단순 단일 매칭으로 폴백
    return fullContent.replace(targetQuote, suggestion);
  }

  // contextPrefix 뒷부분의 targetQuote 정확 치환
  const replaceStartIndex = targetIndex + contextPrefix.length;
  const replaceEndIndex = replaceStartIndex + targetQuote.length;

  return (
    fullContent.substring(0, replaceStartIndex) +
    suggestion +
    fullContent.substring(replaceEndIndex)
  );
}
```

### 상태 동기화 (Dirty State 해제 규칙)
- **에디터 onChange 발생 시:**
  - 본문 변경 감지 즉시 `isDirty = true` 플래그를 세우고 상단 뱃지를 **'재검증 필요'**로 전환.
  - 기존 구절의 하이라이트 인덱스가 틀어지는 것을 방지하기 위해 물결 밑줄을 `opacity-50`으로 처리하거나 비활성화.

---

## 4. 쟁점 상태 전이 모델 (4-Way State Machine)

`DESIGN.md §1`의 핵심 4대 액션에 따른 엔진의 상태 변경 로직입니다.

| 액션 | 엔진 동작 | 쟁점 상태 (`status`) | 후속 파급 효과 |
| :--- | :--- | :--- | :--- |
| **원고에 제안 반영** | `applySuggestionSafely` 실행 | `RESOLVED` | 상단 미해결 카운트 감소 (-1), 본문 즉시 업데이트 |
| **문제없음** | `IssueResolution` 생성, 사유 코드 저장 (`LIE`, `METAPHOR`, `MISUNDERSTOOD`, `CUSTOM`) | `IGNORED` | 해당 장면(`sceneId`)에 한해 동일 검증 제외 (로컬 저장소 캐싱, `Backend&DB.md §2.1-D`) |
| **보류** | 상태 플래그만 전환 | `DEFERRED` | 좌측 필터 카운터 갱신 (미해결 $\rightarrow$ 보류) |
| **작품 설정으로 확정** | `ConfirmedSetting` 오브젝트 생성 | `CONFIRMED` | 기준 설정(Baseline)을 덮어쓰고, 이후 재검증 시 새로운 공식 설정으로 주입 |

---

## 5. 시스템 프롬프트 명세 (System Prompt)

Gemini 1.5 Flash에 적용되는 코어 지침입니다. 모델의 자의적 해석을 배제하고 엄격한 린터 역할을 수행하도록 통제합니다.

```plaintext
역할:
당신은 서브컬처 및 판타지 장르 작가를 위한 '세계관 정합성 린터(Narrative Linter)'입니다.
제공된 [원작 기준 설정(Baseline)]과 [작품 이전 설정]을 바탕으로, 주어진 [원고 텍스트]의 모순점을 탐지하십시오.

원칙:
1. AI는 절대 원고를 판정하거나 평가하지 않으며, '차이'와 '제안'만을 객관적으로 제시합니다.
2. 오류 분류:
   - INTERNAL_CONTRADICTION: 작품 내 이전 장/장면에서 확정된 묘사와의 직접적 충돌
   - DIVERGENCE: 공식 원작 설정(Canon)과의 차이 또는 능력 체계 확장
   - INFO: 인과관계 확인이 필요한 단순 모호 구절
3. targetQuote는 반드시 원고 본문에 존재하는 글자 그대로(Exact match) 추출하십시오.
4. targetQuote 직전 15자 내외의 본문 문장을 contextPrefix로 반드시 제공하십시오. contextPrefix와 targetQuote를 이어 붙였을 때(중간에 공백을 추가하거나 생략하지 말고) 원고 본문의 연속된 부분과 글자 하나까지 정확히 일치해야 합니다.
5. suggestion은 targetQuote를 그 자리에서 그대로 대체할 수 있는 "문구"여야 합니다. "~을 수정하십시오" 같은 지시문이나 설명이 아니라, 수정 후 본문에 들어갈 실제 텍스트만 작성하십시오.
6. 출력은 제공된 JSON Schema 형태 외의 어떤 자연어 텍스트도 포함하지 마십시오.
```

> 2차 개발(백엔드 파이프라인 구현) 중 실제 Gemini 응답을 검증하며 4·5번 규칙을 보강했습니다 — 원래는 각각 "contextPrefix 제공"과 "suggestion 필드 존재"만 요구했는데, 실제 호출에서 ⓐ contextPrefix와 targetQuote 사이 공백이 누락되어 `applySuggestionSafely`의 앵커 탐색이 실패하는 경우, ⓑ suggestion이 대체 문구 대신 지시문으로 나오는 경우가 관찰되어 명시적으로 금지했습니다.

---

## 6. 오프라인 Mock Fallback 안전장치

네트워크 장애, Gemini API 할당량 초과(429), 또는 지연 시간 **3초** 초과 시 프론트엔드가 즉시 가로채어 반환하는 시연용 고정 데이터입니다.

```typescript
export const DEMO_FALLBACK_RESPONSE: CheckResponse = {
  success: true,
  issues: [
    {
      id: "issue-tesseract-color",
      type: "INTERNAL_CONTRADICTION",
      status: "UNRESOLVED",
      title: "테서렉트 색상 묘사 불일치",
      chapterId: "ch3",
      sceneId: "scene2",
      targetQuote: "붉은빛이 감도는 큐브",
      contextPrefix: "스톤의 빛이 방 전체를 감쌌다.",
      paragraphIndex: 0,
      analysis: "본 작품 제1장 장면 3에서 '푸른 광채'로 묘사된 설정과 정면 충돌합니다.",
      suggestion: "푸른빛이 감도는 큐브",
      citation: {
        sourceType: "INTERNAL",
        title: "본 작품 내부 제1장 장면 3, 14번째 문단",
        snippet: "... 그 푸른 광채가 실내 온도마저 떨어뜨리는 듯한 서늘한 색상이었다고 기록되었다."
      }
    },
    {
      id: "issue-cosmic-cube-power",
      type: "DIVERGENCE",
      status: "UNRESOLVED",
      title: "코스믹 큐브 능력 범위 확장",
      chapterId: "ch3",
      sceneId: "scene2",
      targetQuote: "시간을 되돌리는 듯한 파동을 내뿜자",
      contextPrefix: "이전의 관측과는 완전히 달랐다. ",
      paragraphIndex: 0,
      analysis: "공식 MCU 세계관상 테서렉트(스페이스 스톤)는 공간 조작 권능만을 가집니다. 시간을 되돌리는 연출은 타임 스톤의 고유 영역입니다.",
      suggestion: "공간을 일그러뜨리는 듯한 파동을 내뿜자",
      citation: {
        sourceType: "CANON",
        title: "MCU 공식 설정집 인피니티 스톤 편",
        snippet: "스페이스 스톤은 사용자를 임의의 공간으로 전송하거나 차원을 여는 능력을 지니며, 시간 축 간섭은 불가능하다."
      }
    }
  ],
  meta: {
    scannedParagraphs: 1,
    latencyMs: 100,
    isFallback: true
  }
};
```