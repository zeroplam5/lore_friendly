// 자료실(Library) 목업 스키마 — Backend&DB.md §8.1

export type ReferenceStatus = '추출 중' | '검토 가능' | '확인 필요';
export type ReferenceSourceType = 'PDF' | 'URL' | '직접 작성';

export interface ReferenceMaterial {
  id: string;
  /** 자료명 (업로드 시 사용자 입력을 그대로 사용) */
  title: string;
  sourceType: ReferenceSourceType;
  status: ReferenceStatus;
  /** 적용 세계관 (예: "MCU") */
  appliedUniverse: string;
  /** ISO Timestamp */
  addedAt: string;
  /** 자료 본문 미리보기 — 목업 고정 텍스트 */
  bodyPreview: string;
}

export interface ReferenceInconsistency {
  id: string;
  /** 불일치가 발견된 자료 2건 이상의 ID */
  involvedReferenceIds: string[];
  /** 예: "테서렉트 권능 범위 서술이 자료 간 다름" */
  summary: string;
}
