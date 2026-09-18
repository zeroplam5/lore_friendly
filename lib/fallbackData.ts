// 오프라인 Mock Fallback — ai.md §6
// 네트워크 장애, Gemini API 할당량 초과(429), 또는 지연 시간 3초 초과 시
// 프론트엔드가 즉시 가로채어 반환하는 시연용 고정 데이터.
import type { CheckResponse } from '@/types';

export const DEMO_FALLBACK_RESPONSE: CheckResponse = {
  success: true,
  issues: [
    {
      id: 'issue-tesseract-color',
      type: 'INTERNAL_CONTRADICTION',
      status: 'UNRESOLVED',
      title: '테서렉트 색상 묘사 불일치',
      chapterId: 'ch3',
      sceneId: 'scene2',
      targetQuote: '붉은빛이 감도는 큐브',
      contextPrefix: '스톤의 빛이 방 전체를 감쌌다. ',
      paragraphIndex: 0,
      analysis: "본 작품 제1장 장면 3에서 '푸른 광채'로 묘사된 설정과 정면 충돌합니다.",
      suggestion: '푸른빛이 감도는 큐브',
      citation: {
        sourceType: 'INTERNAL',
        title: '본 작품 내부 제1장 장면 3, 14번째 문단',
        snippet: '... 그 푸른 광채가 실내 온도마저 떨어뜨리는 듯한 서늘한 색상이었다고 기록되었다.',
      },
    },
    {
      id: 'issue-cosmic-cube-power',
      type: 'DIVERGENCE',
      status: 'UNRESOLVED',
      title: '코스믹 큐브 능력 범위 확장',
      chapterId: 'ch3',
      sceneId: 'scene2',
      targetQuote: '시간을 되돌리는 듯한 파동을 내뿜자',
      contextPrefix: '이전의 관측과는 완전히 달랐다. ',
      paragraphIndex: 0,
      analysis:
        '공식 MCU 세계관상 테서렉트(스페이스 스톤)는 공간 조작 권능만을 가집니다. 시간을 되돌리는 연출은 타임 스톤의 고유 영역입니다.',
      suggestion: '공간을 일그러뜨리는 듯한 파동을 내뿜자',
      citation: {
        sourceType: 'CANON',
        title: 'MCU 공식 설정집 인피니티 스톤 편',
        snippet:
          '스페이스 스톤은 사용자를 임의의 공간으로 전송하거나 차원을 여는 능력을 지니며, 시간 축 간섭은 불가능하다.',
      },
    },
  ],
  meta: {
    scannedParagraphs: 1,
    latencyMs: 100,
    isFallback: true,
  },
};
