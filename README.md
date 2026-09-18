# Lore-Friendly

2차 창작(팬픽)·What-If 스토리를 쓰는 작가를 위한 **세계관 정합성 린터(Narrative Linter)**. 원고를 쓰는 동안 AI가 ①작품 내부 모순과 ②원작(Canon)과의 차이를 실시간으로 잡아내고, 작가가 그 판단을 "수정 / 문제없음 / 보류 / 작품 설정으로 확정" 중 하나로 처리하면서 **작품만의 고유 설정(canon)을 누적**해 가는 3-패널 웹 데스크톱 앱입니다.

BYPP 데모 마켓 제출을 위한 밤샘 해커톤 MVP로 기획되었습니다.

---

## 핵심 컨셉

| 개념 | 설명 |
|---|---|
| 참고 자료 (Reference) | 업로드한 원작 자료. 자료 간 불일치도 감지 |
| 기준 설정 (Baseline) | 원작 기준의 사실. 예: "테서렉트는 공간 이동만 가능하다" |
| 쟁점 (Issue) | 원고 ↔ 기준 설정 충돌. 미해결 / 보류 / 무시됨 / 해결됨 |
| 작품 설정 (Confirmed) | 작가가 "확정"한 변경. 기준 설정을 대체하고 이후 검증 기준이 됨 |

AI는 판정하지 않고 제안만 합니다. 모든 결정권은 작가에게 있고, 모든 조치는 되돌릴 수 있습니다.

---

## 주요 기능

- **집필(Writing)**: 챕터/장면 구조의 에디터. 집중 모드 지원.
- **검토(Review)**: 장면 · 챕터 · 작품 전체 단위로 검증 요청 → AI가 내부 모순/원작 차이를 하이라이트 → 4갈래 조치(반영/문제없음/보류/설정 확정).
- **자료실(Library)**: 참고 자료 등록(참고 자료 탭) + 확정된 작품 설정 열람(작품 설정 탭) + 기준 세계관·원작 준수 정도 등 작품 기본 설정.
- **내보내기(Export)**: 원고를 책 형태의 PDF로 내보내기. 맨 뒤에 작가가 확정한 설정 전체를 정리한 **Canon Index 부록**이 자동으로 붙습니다.

---

## 기술 스택

- **프레임워크**: Next.js App Router (Single-stack — 클라이언트/서버 API를 한 프로젝트에서 처리)
- **AI**: Google Gemini (Structured Output) — 기획 당시 명시된 `Gemini 1.5 Flash`/`text-embedding-004`는 2026-09 기준 API에서 제거되어 실제 구현은 `gemini-3.1-flash-lite`/`gemini-embedding-001`을 사용합니다. 배경은 [진행 상태 §2차 개발](#2차-개발--백엔드--검증-ai-파이프라인-완료) 참조
- **검색**: 인메모리 코사인 유사도 (별도 벡터 DB 없이 Node.js 프로세스 내에서 처리)
- **상태 관리/영속화**: Zustand + `localStorage` (서버 DB 없이 브라우저에 원고·확정 설정·쟁점 해결 이력 저장)
- **스타일**: Tailwind CSS (Slate + Indigo 팔레트)
- **PDF**: `pdf-lib` (클라이언트에서 샘플 PDF에 Canon Index 부록 페이지 동적 병합)

---

## 아키텍처 개요

```
[Client (Next.js App Router)]
        │
        ▼  Internal HTTP / Same-Origin
[Next.js Serverless Route Handlers (/api/*)]
        │
        ├─▶ In-Memory Vector Search (Cosine Similarity)
        ├─▶ Google Gemini 1.5 Flash API
        │
        ▼ Fallback & Static Store
[JSON Datastores (data/canon/*.json, data/drafts/*.json)]
```

해커톤 환경에서 CORS·포트 충돌·복수 배포 파이프라인 같은 부수적 디버깅 비용을 없애기 위해 프론트/백엔드를 하나의 Next.js 프로젝트로 통합했습니다. 네트워크 장애나 API 타임아웃(실측 레이턴시를 반영해 6초로 조정 — 사유는 진행 상태 참조) 발생 시 자동으로 사전 준비된 목업 응답으로 전환되어, 오프라인 상태에서도 데모 시연이 100% 동작합니다.

---

## 문서 구조

| 문서 | 내용 |
|---|---|
| [design/DESIGN.md](design/DESIGN.md) | Figma 원본 디자인 역공학 분석 — 화면 인벤토리, 레이아웃, 컬러/타이포 토큰, 컴포넌트 목록, 원본 파일 결함 기록 |
| [docs/ui_ux.md](docs/ui_ux.md) | 프론트엔드 구현용 디자인 시스템 — Tailwind 토큰, 컴포넌트 명세, 상태 머신, 반응형 규칙, 피그마 결함 방어 가이드, 내보내기/자료실 목업 뷰 명세 |
| [docs/ai.md](docs/ai.md) | 검증 AI 엔진 — 파이프라인, API 스키마(`CheckRequest`/`CheckResponse`), 좌표 매핑·안전 치환 알고리즘, 시스템 프롬프트, 오프라인 Fallback |
| [docs/Backend&DB.md](docs/Backend&DB.md) | 백엔드/데이터 아키텍처 — 데이터 모델, API 엔드포인트, 벡터 검색 엔진, 클라이언트 영속화, 장애 격리, PDF 내보내기·자료실 목업 파이프라인 |
| [docs/test_demonstration.md](docs/test_demonstration.md) | 테스트 체크리스트, 3분 데모 시연 대본, 부스 운영 비상 대응 매뉴얼 |

문서 간 수치·스키마·용어는 상호 교차 검증을 거쳐 통일했습니다 (패널 폭, API 타임아웃, 상태 코드, 반응형 임계값 등).

---

## MVP 범위 — 실제 구현 vs 목업

해커톤 일정상 핵심 가치(세계관 검증 린터)에 개발 리소스를 집중하고, 나머지 두 기능은 **실제 엔진 없이 그럴듯하게 동작하는 목업**으로 처리합니다.

| 기능 | 처리 방식 |
|---|---|
| **검증 AI (집필/검토)** | 실제 Gemini 1.5 Flash 호출. 실패/타임아웃 시에만 목업 Fallback |
| **내보내기 (PDF Export)** | 실제 조판 엔진 없음. CSS로 A5 지면 미리보기 + 진행률 애니메이션(0→49%) 후 미리 준비된 샘플 PDF 다운로드. 단, 맨 뒤 **Canon Index 부록 페이지는 실제 확정 설정 데이터로 동적 생성**. 내보내기 시 작은따옴표(`'…'`)는 큰따옴표(`"…"`)로 자동 정규화 |
| **자료실 (참고자료 업로드/분석)** | 실제 파싱·분석 엔진 없음. 업로드 UI는 정상 동작하되 본문·분석 결과·자료 간 불일치는 고정 데모 데이터로 대체 |

상세 스펙은 [docs/Backend&DB.md §7~8](docs/Backend&DB.md), [docs/ui_ux.md §7~8](docs/ui_ux.md) 참조.

---

## 데모 시나리오 (3분)

1. **인트로(30초)** — 2차 창작 작가가 겪는 '캐붕'/설정 오류 문제 제기
2. **핵심 기능 1(50초)** — 작품 내부 모순 감지 → [원고에 제안 반영] 원클릭 교정
3. **핵심 기능 2(50초)** — 원작과의 차이를 발견 → [설정으로 확정]으로 What-If 설정을 새 캐넌으로 수용
4. **클로징(50초)** — 모바일 QR 체험 유도

전체 대본과 부스 운영 매뉴얼은 [docs/test_demonstration.md](docs/test_demonstration.md) 참조.

---

## 진행 상태

**기획 및 설계 단계** → **1차 개발(데이터 모델링)** → **2차 개발(백엔드/검증 AI 파이프라인)** 까지 완료되었습니다. 다음 단계는 **3차 개발(프론트엔드 UI)** 입니다.

### 1차 개발 — 데이터 모델링 (완료)

- 디자인 분석, UI/UX 명세, AI 검증 엔진 스펙, 백엔드/데이터 아키텍처, 테스트·데모 계획 문서화 및 상호 정합성 검증 완료
- `types/`, `data/`, `lib/`에 `ai.md §2`(검증 API 스키마) 및 `Backend&DB.md §2·§8`(캐논/프로젝트/자료실 스키마) 기준 TypeScript 타입과 정적 목업 데이터를 확정 (`npm run typecheck` 통과)

### 2차 개발 — 백엔드 / 검증 AI 파이프라인 (완료)

Next.js App Router를 스캐폴딩하고 `POST /api/check`가 실제 Gemini를 호출해 원고의 내부 모순(`INTERNAL_CONTRADICTION`)·원작 차이(`DIVERGENCE`)를 탐지하도록 구현했습니다. 실 사용(API 키 발급 후 실제 호출)까지 검증 완료.

**구현 내용**
- `lib/vectorSearch.ts` — `Backend&DB.md §4` 그대로의 코사인 유사도 검색
- `lib/embeddings.ts`, `lib/geminiClient.ts` — Gemini 임베딩/생성 클라이언트
- `lib/prompt.ts` — `ai.md §5` 시스템 프롬프트 + Baseline/확정 설정/내부 컨텍스트 조립
- `lib/gemini.ts` — 구조화 출력(JSON Schema) 호출 및 파싱
- `lib/checkPipeline.ts` — 위 모듈 오케스트레이션 (confirmedSettings로 대체된 baseline 제외 → 임베딩 검색으로 관련 baseline top-2 선정 → targets 외 나머지 장면을 내부 컨텍스트로 수집 → Gemini 호출 → id/status 부여)
- `app/api/check/route.ts` — 요청 검증 + 타임아웃 Race + 실패 시 `DEMO_FALLBACK_RESPONSE` 폴백 (`Backend&DB.md §6`)
- `scripts/generate-baseline-embeddings.mjs` — `marvel_baseline.json`의 embedding 필드를 실제 값으로 재생성하는 1회성 스크립트 (`npm run embed:baseline`)

**문서 스펙과 달라진 점 (구현 중 확인된 사실 기반 조정)**

| 항목 | 문서 명시값 | 실제 적용값 | 사유 |
|---|---|---|---|
| 생성 모델 | Gemini 1.5 Flash | `gemini-3.1-flash-lite` | `gemini-1.5-flash`는 API에서 제거됨(2026-09 확인). 대체 권장 모델 `gemini-3.6-flash`는 현재 수요 폭주로 503·3~4초 지연이 잦아, 구조화 출력 테스트에서 더 빠르고 안정적으로 응답한 lite 버전 채택 |
| 임베딩 모델 | `text-embedding-004` (768차원) | `gemini-embedding-001` + `outputDimensionality: 768` | `text-embedding-004`도 API에서 제거됨. 후속 모델로 교체하되 문서가 명시한 768차원 스펙은 그대로 유지 |
| 검증 타임아웃 | 3초 | 6초 | 임베딩+생성 2회 순차 API 호출의 실측 레이턴시가 2~4.5초로, 3초로는 정상 응답도 거의 항상 타임아웃 폴백되는 문제 확인 → 사용자 확인 후 6초로 조정. "장애/타임아웃 시 즉시 폴백"이라는 fail-safe 취지 자체는 그대로 유지 |

**알려진 제약 (MVP 단순화, 계획서에 명시된 판단)**
- 내부 컨텍스트(작품 이전 설정)는 장면 순서와 무관하게 검증 대상 이외의 전체 장면을 사용 — 데모 프로젝트가 하나뿐이고 장면 수가 적어 채택한 단순화
- baseline 관련도 산정은 별도 키워드 매칭 없이 임베딩 유사도 검색만 사용
- `projectId` 값과 무관하게 항상 `DEMO_PROJECT` 하나만 로드 (다중 프로젝트 미지원)
- `marvel_baseline.json`에 baseline을 추가/수정하면 `npm run embed:baseline`을 다시 실행해야 검색에 반영됨 (미실행 시 새 항목은 조용히 검색 후보에서 제외)

**실사용 검증**: `.env.local`에 `GEMINI_API_KEY`를 설정하고 `npm run embed:baseline` 실행 후, 데모 시나리오(`ch3/scene2`, "보르미르의 결정")로 `/api/check`를 호출해 실제 Gemini 응답(`isFallback:false`)이 원고의 정확한 구절을 인용해 테서렉트 색상 모순과 시간 역행 권능 위반 2건을 올바르게 탐지함을 확인. `GEMINI_API_KEY` 미설정/장애 상황에서는 3초를 기다리지 않고 즉시 `DEMO_FALLBACK_RESPONSE`로 전환됨도 확인.

**일반화 검증 (마블 외 세계관)**: 데모 데이터와 무관한 임의의 baseline(오징어 게임 가면 등급 설정)과 원고로 별도 테스트한 결과, 내부 모순·원작 차이를 모두 정확히 탐지함을 확인 — 파이프라인이 특정 데이터셋에 하드코딩되지 않고 일반화됨을 보여줌. 이 과정에서 `suggestion`이 대체 문구 대신 지시문으로 나오거나 `contextPrefix`가 `targetQuote` 직전 공백을 놓쳐 `applySuggestionSafely`의 앵커 탐색이 실패하는 경우를 발견해, `lib/prompt.ts`(및 `docs/ai.md §5`)의 시스템 프롬프트에 두 규칙을 명시적으로 추가(4번 규칙 보강 + 5번 규칙 신설)했습니다. 재테스트 결과 `suggestion` 문제는 해결, `contextPrefix` 앵커는 개선되었으나 LLM 특성상 100% 보장은 안 되며 — 이 경우를 위해 안전 치환 알고리즘 자체에 앵커 실패 시 단순 매칭으로 폴백하는 로직이 이미 있어 실사용에는 지장 없음을 확인.

> 테스트 시 유의: curl 등으로 한글 본문을 직접 전달할 때 터미널/쉘 인코딩이 UTF-8이 아니면 본문이 깨져 Gemini가 엉뚱한 구절을 인용하는 것처럼 보일 수 있습니다(파이프라인 버그 아님) — UTF-8로 저장된 파일을 `--data-binary @file` 등으로 전달해 확인하세요.

### 코드 구조

```
types/
├── check.ts     — ValidationScope, CheckRequest, IssueItem, CheckResponse 등 (ai.md §2)
├── canon.ts     — CanonicalBaseline, ConfirmedSetting, IssueResolution (Backend&DB.md §2.1)
├── project.ts   — Scene, Chapter, ProjectDraft (Backend&DB.md §2.1-B)
├── library.ts   — ReferenceMaterial, ReferenceInconsistency (Backend&DB.md §8.1)
└── index.ts     — 통합 재노출

data/
├── canon/marvel_baseline.json     — 테서렉트 원작 기준 설정 (embedding은 실제 768차원 값)
├── drafts/demo_project.json       — 데모 프로젝트 《푸른 큐브의 다른 가능성》 3챕터 구조
└── library/demoReferences.ts      — 자료 5건 + 자료 간 불일치 1건 (DEMO_REFERENCES 등)

lib/
├── fallbackData.ts     — DEMO_FALLBACK_RESPONSE (오프라인 목업, ai.md §6)
├── canon.ts            — marvel_baseline.json 타입 로더
├── project.ts          — demo_project.json 타입 로더
├── vectorSearch.ts     — cosineSimilarity / searchRelevantBaselines
├── geminiClient.ts     — Gemini 클라이언트 싱글턴 + 모델 상수
├── embeddings.ts       — embedText()
├── prompt.ts           — 시스템 프롬프트 + 사용자 프롬프트 조립
├── gemini.ts           — 구조화 출력 호출(runNarrativeCheck)
└── checkPipeline.ts    — 검증 파이프라인 오케스트레이션(runCheckPipeline)

app/
├── layout.tsx, page.tsx      — 최소 루트 레이아웃 (UI는 3차 개발 범위)
└── api/check/route.ts        — POST /api/check (요청 검증 + 6초 타임아웃 Race + Fail-Safe)

scripts/
└── generate-baseline-embeddings.mjs  — baseline embedding 재생성 (npm run embed:baseline)
```

### 로컬 실행

```bash
npm install
cp .env.local.example .env.local   # GEMINI_API_KEY 값 채우기
npm run embed:baseline             # baseline embedding을 실제 값으로 1회 생성
npm run dev                        # http://localhost:3000
```

`GEMINI_API_KEY` 없이 `npm run dev`만 실행해도 `/api/check`는 정상 동작합니다(항상 `DEMO_FALLBACK_RESPONSE` 반환).
