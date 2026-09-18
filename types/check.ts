// 검증 AI API 스키마 — ai.md §2 (검증 요청/응답)
import type { ConfirmedSetting } from './canon';

/** ScopeTabs: 장면 / 챕터 / 작품 전체 */
export type ValidationScope = 'SCENE' | 'CHAPTER' | 'PROJECT';

export interface CheckTarget {
  chapterId: string;
  sceneId: string;
  /** 해당 장면의 에디터 본문 전체 텍스트 */
  content: string;
}

export interface CheckRequest {
  projectId: string;
  scope: ValidationScope;
  /** scope가 'CHAPTER' | 'SCENE' 일 때 필수 */
  chapterId?: string;
  /** scope가 'SCENE' 일 때 필수 */
  sceneId?: string;
  /** scope='SCENE'→1건 / 'CHAPTER'→해당 챕터 전체 장면 / 'PROJECT'→작품 전체 장면 */
  targets: CheckTarget[];
  /** 작가가 확정한 설정 목록 */
  confirmedSettings?: ConfirmedSetting[];
}

/** INTERNAL_CONTRADICTION: 작품 내부 모순 / DIVERGENCE: 원작과 차이 / INFO: 확인 필요 */
export type IssueType = 'INTERNAL_CONTRADICTION' | 'DIVERGENCE' | 'INFO';

/** 미해결 / 해결됨 / 보류 / 설정 확정 / 무시됨 */
export type IssueStatus = 'UNRESOLVED' | 'RESOLVED' | 'DEFERRED' | 'CONFIRMED' | 'IGNORED';

export interface Citation {
  /** 작품 내부 vs 원작 자료 */
  sourceType: 'INTERNAL' | 'CANON';
  /** 예: "본 작품 제1장 장면 3, 14번째 문단" */
  title: string;
  /** 인용 원문 */
  snippet: string;
}

export interface IssueItem {
  /** 고유 UUID (예: "issue-tesseract-color") */
  id: string;
  type: IssueType;
  status: IssueStatus;
  /** 예: "테서렉트 색상 묘사 불일치" */
  title: string;
  /** 이슈가 위치한 챕터 (targets 중 어느 장면인지 역추적) */
  chapterId: string;
  /** 이슈가 위치한 장면 */
  sceneId: string;
  /** 본문 내 치환 대상 구절 ("붉은빛이 감도는 큐브") */
  targetQuote: string;
  /** 치환 오폭 방지용 직전 15~20자 ("스톤의 빛이 방 전체를 감쌌다.") */
  contextPrefix: string;
  /** 해당 장면 content 내 문단 번호 (0-indexed) */
  paragraphIndex: number;
  /** 충돌 사유 및 분석 내용 */
  analysis: string;
  /** 수정 제안 문구 ("푸른빛이 감도는 큐브") */
  suggestion: string;
  citation: Citation;
}

export interface CheckResponseMeta {
  scannedParagraphs: number;
  latencyMs: number;
  isFallback: boolean;
}

export interface CheckResponse {
  success: boolean;
  issues: IssueItem[];
  meta: CheckResponseMeta;
}
