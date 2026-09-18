// 캐논(원작 기준/확정 설정) 스키마 — Backend&DB.md §2.1-A, C, D

/** 공식 원작(Canon)의 불변 규칙 및 사전 임베딩 벡터. data/canon/marvel_baseline.json */
export interface CanonicalBaseline {
  /** 고유 ID (예: "base-tesseract-01") */
  id: string;
  universe: 'MCU' | 'Earth-616';
  /** 대상 개체 (예: "테서렉트", "캡틴 아메리카") */
  entity: string;
  category: '아이템' | '인물' | '사건' | '능력';
  /** 공식 규칙 명제 리스트 */
  rules: string[];
  /** 출처 문헌 (예: "MCU Visual Dictionary") */
  source: string;
  /** 실제 인용구 */
  citationText: string;
  /** 768차원 임베딩 벡터 (사전 계산값) */
  embedding?: number[];
}

/** 작가가 [설정으로 확정]을 클릭하여 기준 설정을 대체한 고유 설정(Canon). localStorage: lore_confirmed_settings */
export interface ConfirmedSetting {
  /** "conf-01" */
  id: string;
  /** 대체하는 기존 원작 ID ("base-tesseract-01") */
  replacesBaselineId?: string;
  /** "코스믹 큐브의 시간 간섭 능력" */
  title: string;
  /** 변경 내용 (변경 확정 내용) */
  description: string;
  /** 적용 대상 — 작품 전체 / 특정 챕터 / 특정 장면 */
  targetScope: 'PROJECT' | 'CHAPTER' | 'SCENE';
  /** targetScope가 'CHAPTER' | 'SCENE' 일 때 필수 */
  chapterId?: string;
  /** targetScope가 'SCENE' 일 때 필수 */
  sceneId?: string;
  /** 적용 시작 — 이 장면부터(포함) 새 설정을 유효한 것으로 간주 */
  effectiveFromSceneId: string;
  /** 유지할 조건 — 예: "스톤이 파괴되기 전까지" (깨지면 재검토 필요) */
  maintainCondition?: string;
  status: 'APPROVED';
  /** ISO Timestamp */
  confirmedAt: string;
  /** 작가 메모 */
  authorNote: string;
}

/** 문제없음 사유 코드 — 인물의 거짓말 / 회상 또는 비유 / 문맥 오해 / 직접 입력 */
export type IgnoreReasonCode = 'LIE' | 'METAPHOR' | 'MISUNDERSTOOD' | 'CUSTOM';

/**
 * `문제없음`(무시) 또는 `보류` 처리된 쟁점을 장면 단위로 기억해, 동일 구절을 반복 지적하지 않기 위한 데이터.
 * localStorage: lore_issue_resolutions
 */
export interface IssueResolution {
  /** 대상 쟁점 ID */
  issueId: string;
  chapterId: string;
  /** 제외가 적용되는 장면 — "이 구절에만 적용" 범위 */
  sceneId: string;
  status: 'IGNORED' | 'DEFERRED';
  /** status가 'IGNORED'일 때 필수 */
  reasonCode?: IgnoreReasonCode;
  /** reasonCode가 'CUSTOM'일 때 직접 입력한 내용 */
  reasonNote?: string;
  /** ISO Timestamp */
  resolvedAt: string;
}
