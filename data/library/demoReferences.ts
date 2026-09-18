// 자료실 고정 데모 데이터 — Backend&DB.md §8.2
import type { ReferenceMaterial, ReferenceInconsistency } from '@/types';

export const DEMO_REFERENCES: ReferenceMaterial[] = [
  {
    id: 'ref-01',
    title: 'MCU Visual Dictionary — 테서렉트 편',
    sourceType: 'PDF',
    status: '검토 가능',
    appliedUniverse: 'MCU',
    addedAt: '2026-09-12T09:00:00+09:00',
    bodyPreview: '테서렉트는 스페이스 스톤을 격납한 정육면체로, 공간 이동과 차원문 개방에만 사용된다.',
  },
  {
    id: 'ref-02',
    title: 'Captain America: The First Avenger 설정집',
    sourceType: 'PDF',
    status: '검토 가능',
    appliedUniverse: 'MCU',
    addedAt: '2026-09-12T09:05:00+09:00',
    bodyPreview: '1943년 하이드라 연구소, 레드 스컬이 테서렉트의 힘을 처음 확인하는 장면 기록.',
  },
  {
    id: 'ref-03',
    title: 'Agents of S.H.I.E.L.D. 위키 발췌',
    sourceType: 'URL',
    status: '확인 필요',
    appliedUniverse: 'MCU',
    addedAt: '2026-09-13T14:20:00+09:00',
    bodyPreview: '테서렉트를 범용 "에너지원"으로 서술 — 공식 설정집과 표현이 다름.',
  },
  {
    id: 'ref-04',
    title: '레드 스컬 캐릭터 연표 정리',
    sourceType: '직접 작성',
    status: '검토 가능',
    appliedUniverse: 'Earth-616 + MCU 혼합',
    addedAt: '2026-09-14T21:10:00+09:00',
    bodyPreview: '작가가 직접 정리한 레드 스컬 등장 시점·계급 연표.',
  },
  {
    id: 'ref-05',
    title: 'Thor(2011) 인피니티 스톤 설정',
    sourceType: 'PDF',
    status: '추출 중',
    appliedUniverse: 'MCU',
    addedAt: '2026-09-15T08:30:00+09:00',
    bodyPreview: '(추출 중) 리얼리티 스톤·타임 스톤과의 권능 구분 자료.',
  },
];

export const DEMO_INCONSISTENCIES: ReferenceInconsistency[] = [
  {
    id: 'inc-01',
    involvedReferenceIds: ['ref-01', 'ref-03'],
    summary: '테서렉트 권능 범위 서술 불일치 — 자료 1은 "공간 이동 전용", 자료 3은 "범용 에너지원"으로 설명',
  },
];

/** DESIGN.md 원본 값 고정 사용 (자료 분석 진행률) */
export const MOCK_ANALYSIS_PROGRESS = 84;
