// 검증 AI 시스템 프롬프트 및 컨텍스트 조립 — ai.md §5
import type { CanonicalBaseline, ConfirmedSetting, CheckTarget } from '@/types';

export const SYSTEM_PROMPT = `역할:
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
6. 출력은 제공된 JSON Schema 형태 외의 어떤 자연어 텍스트도 포함하지 마십시오.`;

interface LabeledScene {
  chapterId: string;
  chapterTitle: string;
  sceneId: string;
  sceneTitle: string;
  content: string;
}

function formatBaselineContext(baselines: CanonicalBaseline[]): string {
  if (baselines.length === 0) return '(해당 없음)';
  return baselines
    .map(
      (b) =>
        `- [${b.entity}] ${b.rules.join(' ')} (출처: ${b.source} — "${b.citationText}")`
    )
    .join('\n');
}

function formatConfirmedSettings(settings: ConfirmedSetting[]): string {
  if (settings.length === 0) return '(해당 없음)';
  return settings
    .map(
      (s) =>
        `- [${s.title}] ${s.description} (적용 대상: ${s.targetScope}${
          s.maintainCondition ? `, 유지 조건: ${s.maintainCondition}` : ''
        })`
    )
    .join('\n');
}

function formatInternalContext(scenes: LabeledScene[]): string {
  if (scenes.length === 0) return '(해당 없음)';
  return scenes
    .map((s) => `- ${s.chapterTitle} ${s.sceneTitle} (chapterId=${s.chapterId}, sceneId=${s.sceneId}): ${s.content}`)
    .join('\n');
}

function formatTargets(targets: CheckTarget[]): string {
  return targets
    .map(
      (t) =>
        `--- chapterId=${t.chapterId}, sceneId=${t.sceneId} ---\n${t.content}`
    )
    .join('\n\n');
}

export function buildUserPrompt(params: {
  baselines: CanonicalBaseline[];
  confirmedSettings: ConfirmedSetting[];
  internalContextScenes: LabeledScene[];
  targets: CheckTarget[];
}): string {
  const { baselines, confirmedSettings, internalContextScenes, targets } = params;

  return `[원작 기준 설정(Baseline)]
${formatBaselineContext(baselines)}

[작품 확정 설정(Confirmed Settings) — Baseline보다 우선 적용]
${formatConfirmedSettings(confirmedSettings)}

[작품 이전 설정 — 검증 대상 이외의 다른 장면들]
${formatInternalContext(internalContextScenes)}

[검증 대상 원고]
${formatTargets(targets)}`;
}

export type { LabeledScene };
