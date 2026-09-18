# 2. UI/UX 디자인

Lore-Friendly의 프론트엔드 구현을 위한 디자인 시스템, 컴포넌트 명세, 반응형 규칙 및 피그마 결함 방어 가이드입니다.

---

## 1. 디자인 시스템 토큰 (Design Tokens)

피그마 프레임 17개에서 역공학한 표준 디자인 토큰입니다. 모든 수치와 색상은 임의 변경 없이 엄격히 준수합니다.

### 1.1 Color System (Tailwind CSS v3/v4 매핑)

```typescript
// tailwind.config.ts 확장 가이드
module.exports = {
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC', // --surface-sunken (캔버스 배경)
        surface: '#FFFFFF',    // --surface (패널, 카드, 시트)
        border: '#E2E8F0',     // --border (기본 1px 라인)
        text: {
          primary: '#1E293B',   // 본문, 주요 타이틀
          secondary: '#64748B', // 보조 라벨, 메타데이터
          tertiary: '#94A3B8',  // 플레이스홀더, 자동저장 상태
          strong: '#0F172A',    // 고대비 텍스트
        },
        brand: {
          primary: '#4F46E5',   // --primary (Indigo-600)
          soft: '#EEF2FF',      // 활성 카드/버튼 연배경
          alt: '#EEEFFA',       // 보조 연배경
        },
        status: {
          error: {
            text: '#EF4444',    // 작품 내부 모순
            bg: '#FEF2F2',
          },
          warning: {
            text: '#92400E',    // 원작과 차이
            border: '#FDE68A',
            bg: '#FFFBEB',
          },
          success: {
            text: '#16A34A',    // 해결됨
            bg: '#DCFCE7',
          },
          info: {
            text: '#3B82F6',    // 확인 필요
          },
        },
      },
    },
  },
};
```

### 1.2 Typography & Sizing

한글 가독성을 위해 **Inter**와 **Pretendard** 폴백을 기본 적용합니다.

- **로고(Lore):** Inter Bold Italic 16px (`#4F46E5`)
- **로고(Friendly):** Inter Regular 15px (`#1E293B`)
- **문서 본문(원고):** Pretendard/Inter Regular 15px, line-height: 2, 단락 간격 `mb-6` (24px)
- **UI 헤딩/타이틀:** SemiBold 14px / 16px
- **UI 기본 라벨:** SemiBold 13px
- **설명문:** Regular 13px
- **캡션/배지:** SemiBold 11px
- **마이크로 메타:** Regular 10px / 12px

---

## 2. 레이아웃 구조 (3-Panel Unified Grid)

전체 화면은 1440x900 기준 고정 높이 뷰포트 레이아웃으로 동작합니다.

```
+-----------------------------------------------------------------------------------------+
| GlobalNavBar (H: 56px, Border-B: 1px #E2E8F0)                                           |
+-------------------+-------------------------------------------------+-------------------+
| LeftPanel         | Center Editor Workspace                         | Right Inspector   |
| Width: 280px      | Width: flex-1                                   | Width: 320px      |
| Border-R: 1px     | Background: #F8FAFC                             | Border-L: 1px     |
| (이슈/자료 목록)  |                                                 | (검증 결과/조치)  |
|                   |  +-------------------------------------------+  |                   |
|                   |  | Document Sheet (Max-W: 720px, Bg: #FFFFFF) |  |                   |
|                   |  | Padding: 40px, Radius: 12px 12px 0 0       |  |                   |
|                   |  +-------------------------------------------+  |                   |
+-------------------+-------------------------------------------------+-------------------+
```

### 2.1 패널 폭 규격 통일 (확정)
- **Left Panel:** 280px 고정
- **Right Panel:** 320px 고정
- **Center Panel:** `flex-1` (가용 폭 792px 확보로 720px 문서 시트 중앙 정렬 수용)
- **예외 규격:** `export-pdf`의 조판 설정 사이드바는 단독 380px 유지

---

## 3. 핵심 컴포넌트 명세

### 3.1 GlobalNavBar (H: 56px)
- **좌측:** 로고(`Lore` + `Friendly`) + 수직 디바이더 + 프로젝트 셀렉트(162×24, r6, `#F8FAFC`) + 브레드크럼(제3장 장면 2)
- **우측:** 자동 저장 인디케이터(12px, `#94A3B8`) + SegmentedTabs (188×32, r8, 집필 \| 검토 [활성] \| 자료실) + 내보내기 버튼(80×28, r8)

### 3.2 LeftPanel: IssueCard (H: 82px)
- **구조:**
  - **상단:** 5px 상태 도트 + 타입 라벨(11px SemiBold, 상태별 색상)
  - **중단:** 이슈 제목 (13px SemiBold, `#1E293B`)
  - **하단:** 위치 메타 (11px Regular, `#64748B`, 예: 제3장 장면 2 구절 3개)
- **활성 상태:** `box-shadow: inset 0 0 0 1.5px #4F46E5`, 배경 `#FFFFFF`

### 3.3 Center: DocumentSheet & Linter Highlight
- **문서 시트:** `max-w-[720px] bg-white rounded-t-xl border border-slate-200 p-10 shadow-sm`
- **인라인 하이라이팅:**
  - 문제 구절(`target_quote`)에 `#FEF2F2` 배경색 적용
  - 텍스트 하단에 빨간색 물결 밑줄(`decoration-wavy decoration-red-500 underline`) 렌더링
  - 단순 볼드 처리 남발 금지
- **하단 알림 배너:** 시트 하단에 위치하며, 본문 수정 시 실시간 갱신 경고 문구 표시 (`#FFFBEB`, `#FDE68A`)

### 3.4 RightPanel: Inspector & Actions
- **헤더:** TypeBadge (작품 내부 모순) + StatusBadge (미해결)
- **내용 카드:**
  - `QuoteCard`: 문제 구절 표시 (좌측 3px 블루 인디케이터 바)
  - `SourceCard`: 근거 출처 아코디언 컴포넌트
- **하단 액션 푸터 (min-h-[92px]):**
  - **1차 메인 버튼:** 원고에 제안 반영 (`h-10 w-full bg-indigo-600 text-white rounded-lg font-semibold`)
  - **2차 보조 버튼 행:** `[설정으로 확정]` (Outlined), `[문제없음]` (Ghost), `[보류]` (Ghost)

---

## 4. 피그마 디자인 결함 방어 가이드 (Critical Fixes)

`DESIGN.md §3` 및 `§11`에서 보고된 피그마 원본의 렌더링 오류를 프론트엔드에서 사전에 방어하기 위한 필수 CSS 구현 규칙입니다.

| 컴포넌트/화면 | 발견된 결함 | 필수 CSS/컴포넌트 방어 코드 |
| :--- | :--- | :--- |
| **SourceCard** | 출처 헤더 260px 고정폭으로 인해 24px 오버플로우 발생 | `flex-1 min-w-0 truncate` 적용하여 텍스트 자동 말줄임 처리 |
| **Inspector Actions** | 3개 보조 버튼이 272px 폭을 초과해 버튼 잘림 발생 | 버튼 컨테이너에 `flex-wrap: wrap; gap: 8px;`, 푸터에 `min-h-[92px]` 지정 |
| **NoIssue Popover** | 팝오버의 확인 버튼이 뒷단 메인 버튼과 완벽히 겹침 | Radix UI / Popover의 `side="top"` 설정으로 트리거 버튼 상단에 팝오버 배치 |
| **Export Sidebar** | 완료 시 푸터(118px)가 커지면서 위쪽 스크롤 영역과 버튼이 겹침 | 스크롤 영역에 `min-h-0 flex-1 overflow-y-auto` 반드시 명시 |

---

## 5. 쟁점 상태 머신 (Interaction State Flow)

```
[초기 검토 진입]
       │
       ▼
[이슈 카드 선택] ── 본문 Wavy 밑줄 포커싱 & 인스펙터 출처 바인딩
       │
       ├─► [원고에 제안 반영] ── 본문 문자열 치환, 쟁점 상태 '해결됨' 전환, 카운터 갱신
       │
       ├─► [문제없음] ────────── NoIssuePopover 오픈 (사유 라디오 선택) ── 해당 구절 무시
       │
       ├─► [보류] ────────────── 상태 뱃지 '보류'로 전환
       │
       └─► [설정으로 확정] ──── ConfirmSettingDialog 오픈 ── Baseline 대체 & 토스트 발생
```

---

## 6. 모바일 반응형 방어 (xl: 브레이크포인트 미만)

데모 마켓의 모바일 QR 접속에 대비한 방어 뷰 규칙입니다:

- `xl(1280px)` 미만에서는 3-패널 가로 스택을 비활성화하고 **단일 뷰 + 하단 탭바** 형태로 전환합니다. (`DESIGN.md §9` 기준)
- **하단 탭바:** 데스크톱 `GlobalNavBar`의 세그먼트 탭과 동일한 이름을 사용합니다 — `[집필]` \| `[검토]` \| `[자료실]`
- 패널 간 데이터 및 하이라이트 동기화 상태는 모바일 탭 전환 시에도 유지됩니다.

---

## 7. 내보내기(Export) 뷰 명세 — CSS 목업 + 목업 진행률

실제 PDF 조판 엔진 없이 프론트엔드에서 "진짜처럼 보이는" 내보내기 경험을 구현합니다. 백엔드 파이프라인은 `Backend&DB.md §7` 참조.

### 7.1 미리보기 지면 (`export-pdf-preview`)
- 컨테이너: `aspect-ratio: 148 / 210`(A5), `bg-[#F1F0EE]`, 중앙 정렬, 그림자로 종이 두께감 표현.
- 타이포: `Lora`/나눔명조 세리프 폴백, `11pt`, `line-height: 1.8`, `padding: 25mm 20mm`(상하/좌우, 컨테이너 대비 비율로 환산해 반응형으로 스케일).
- 표지 페이지: 제목 / `{author} 소설` / `LORE FRIENDLY PRESS` (Lora 세리프) — `DESIGN.md §10.1` 그대로.

### 7.2 생성 상태 (`export-pdf-generating`)
- `runMockExportProgress`(`Backend&DB.md §7.2`)의 콜백을 받아 `ProgressBar`를 0 → 49%까지 채웁니다.
- 라벨: `"{MOCK_TOTAL_PAGES}페이지 중 {currentPage}페이지 처리 중"`, 퍼센트 텍스트 병기.
- 애니메이션 종료 시 자동으로 §7.3 다운로드를 트리거하고 `export-pdf-complete`로 전환합니다.

### 7.3 완료 상태 (`export-pdf-complete`)
- 파일명 `Lore_Friendly_Sample.pdf` 노출, 사이드바 버튼 「다운로드 완료」+ 상단 토스트(중복 안내는 `DESIGN.md §11.3-J` 참고해 한쪽만 노출 권장).
- **다시 다운로드**: 매번 `buildExportedPdf`를 재실행하지 않고, 최초 생성한 `Blob`을 캐싱해 즉시 재다운로드합니다(그 사이 새로 확정된 설정이 있다면 재생성).
- `Backend&DB.md §4 피그마 디자인 결함 방어 가이드`의 Export Sidebar 겹침 방어(`min-h-0 flex-1 overflow-y-auto`)를 완료 상태에도 동일 적용.

### 7.4 부록 페이지(Canon Index) 비주얼
다운로드된 PDF 맨 뒤에 동적으로 붙는 부록 페이지의 지면 스타일입니다(실제로는 `pdf-lib`로 그려지므로 아래는 디자인 참조용 스펙):
- 제목 `부록 · Canon Index` — Lora Bold 18, 부제 `작가가 확정한 고유 설정 목록` — Regular 11 `#64748B`.
- 항목: 번호 + 제목 + 적용 범위(작품 전체 / 제N장 / 제N장 장면M) + 확정일, 그 아래 변경 내용 설명 1~2줄.
- 확정된 설정이 **0건이면 부록 페이지 자체를 생략**합니다(빈 페이지 노출 방지, `DESIGN.md §9` 빈 상태 원칙과 동일선상).

### 7.5 따옴표 정규화 (조판 변환)
원고의 작은따옴표(`'…'`)는 내보내기 시 큰따옴표(`"…"`)로 자동 치환되어 인쇄본에 노출됩니다 — 미리보기(§7.1)에서는 원본 그대로 보여주고, 최종 다운로드 파일에서만 치환 결과가 반영됩니다. 상세 규칙은 `Backend&DB.md §7.4` 참조.

---

## 8. 자료실(Library) 뷰 명세 — 참고자료 목업 파이프라인

실제 파싱·분석 엔진 없이 UI 인터랙션만 완전히 동작하는 목업입니다. 데이터 스펙은 `Backend&DB.md §8` 참조.

### 8.1 `library-empty-state`
- 자료 0건 상태에서 "자료 추가" / "바로 집필" 두 갈래 CTA를 노출합니다.
- "자료 추가" 클릭 시 §8.3 `library-add-dialog`로 진입.

### 8.2 `library-add-dialog`
- 드래그앤드롭 영역(PDF/DOCX/TXT, 최대 50MB) 또는 URL 입력 탭 전환.
- 필드: 자료명(텍스트 입력, 실제 값 사용) · 출처 유형(`PDF`/`URL`/`직접 작성`) · 적용 세계관(드롭다운).
- **파일을 실제로 읽지 않습니다** — 드롭한 파일명이 자료명 입력창에 자동 채워지는 정도의 UX만 제공하고, 본문은 `Backend&DB.md §8.3 mockUploadReference`의 고정 템플릿을 사용합니다.
- [자료 등록] 클릭 시 다이얼로그를 닫고 `library-references`로 이동하며 §8.3 진행률 애니메이션을 시작합니다.

### 8.3 `library-references`
- **좌측 목록**: `DEMO_REFERENCES` 5건 + 방금 추가한 자료(있다면) — `RefCard`, 상태 배지(`추출 중` / `검토 가능` / `확인 필요`) + 유형 배지(`PDF`/`URL`/`직접 작성`).
- **필터 칩**: `전체 / 원작 자료 / 2차 정리` (원작 자료 = `sourceType` PDF·URL, 2차 정리 = `직접 작성`).
- **중앙**: 선택한 자료의 `bodyPreview` 표시.
- **우측 메타 패널**:
  - 분석 진행률 게이지 — 신규 업로드 중일 때만 애니메이션(0→84%), 그 외에는 고정 84% 표시.
  - 자료 간 불일치 카드 — `DEMO_INCONSISTENCIES`의 고정 1건(`inc-01`)을 항상 노출. 관련 자료 2건을 클릭하면 좌측 목록에서 하이라이트.

### 8.4 상태 전이
```
library-empty-state → [자료 추가] → library-add-dialog
  → [자료 등록] → library-references ('추출 중' 카드 삽입, 진행률 0→84% 애니메이션)
  → 애니메이션 종료 → 상태 '검토 가능'으로 전환, DEMO_INCONSISTENCIES는 변동 없이 그대로 유지
```