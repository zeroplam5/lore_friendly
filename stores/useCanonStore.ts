// 캐논(기준/확정 설정) 스토어 — Backend&DB.md §2.1-A, C / §5 lore_confirmed_settings
// 기준 설정(Baseline)은 marvel_baseline.json(서버에도 존재)에 더해, 작가가 자료실에서
// 직접 만든 커스텀 기준 설정(customBaselines, 클라이언트 전용)을 함께 관리한다.
// built-in이든 커스텀이든 "삭제"는 hiddenBaselineIds에 넣어 목록에서 감추는 방식으로 처리하고
// (커스텀은 배열에서 완전히 제거), "검증에 사용할지"는 별도의 disabledBaselineIds 체크박스로 다룬다.
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MARVEL_BASELINE } from '@/lib/canon';
import type { CanonicalBaseline, ConfirmedSetting } from '@/types';

interface CanonState {
  confirmedSettings: ConfirmedSetting[];
  customBaselines: CanonicalBaseline[];
  /** 삭제된 기준 설정 id (built-in은 원본 JSON을 지울 수 없으므로 숨김 처리) */
  hiddenBaselineIds: string[];
  /** 체크 해제되어 다음 검증 요청에서 제외되는 기준 설정 id (삭제와는 별개) */
  disabledBaselineIds: string[];

  addConfirmedSetting: (setting: ConfirmedSetting) => void;
  removeConfirmedSetting: (id: string) => void;
  addCustomBaseline: (baseline: CanonicalBaseline) => void;
  removeBaseline: (id: string) => void;
  toggleBaselineEnabled: (id: string) => void;
}

export const useCanonStore = create<CanonState>()(
  persist(
    (set) => ({
      confirmedSettings: [],
      customBaselines: [],
      hiddenBaselineIds: [],
      disabledBaselineIds: [],

      addConfirmedSetting: (setting) =>
        set((state) => ({ confirmedSettings: [...state.confirmedSettings, setting] })),
      removeConfirmedSetting: (id) =>
        set((state) => ({
          confirmedSettings: state.confirmedSettings.filter((s) => s.id !== id),
        })),

      addCustomBaseline: (baseline) =>
        set((state) => ({ customBaselines: [...state.customBaselines, baseline] })),

      removeBaseline: (id) =>
        set((state) => ({
          customBaselines: state.customBaselines.filter((b) => b.id !== id),
          hiddenBaselineIds: state.hiddenBaselineIds.includes(id)
            ? state.hiddenBaselineIds
            : [...state.hiddenBaselineIds, id],
        })),

      toggleBaselineEnabled: (id) =>
        set((state) => ({
          disabledBaselineIds: state.disabledBaselineIds.includes(id)
            ? state.disabledBaselineIds.filter((x) => x !== id)
            : [...state.disabledBaselineIds, id],
        })),
    }),
    { name: 'lore_confirmed_settings' }
  )
);

// 선택자가 매 렌더마다 새 배열 리터럴을 반환하면 useSyncExternalStore가 스냅샷이 항상
// 바뀐 것으로 오인해 무한 리렌더 루프에 빠진다 — 파생 배열은 훅 안에서 한 번만 계산한다.

/** built-in(marvel_baseline.json) + 커스텀 기준 설정 중 삭제되지 않은 전체 목록 */
export function useAllBaselines(): CanonicalBaseline[] {
  const customBaselines = useCanonStore((s) => s.customBaselines);
  const hiddenBaselineIds = useCanonStore((s) => s.hiddenBaselineIds);
  return [...MARVEL_BASELINE, ...customBaselines].filter(
    (b) => !hiddenBaselineIds.includes(b.id)
  );
}

/** confirmedSettings가 대체한 baseline을 제외한 유효 기준 설정 목록. Backend&DB.md §2.1-C */
export function getEffectiveBaselines(
  baselines: CanonicalBaseline[],
  confirmedSettings: ConfirmedSetting[]
): CanonicalBaseline[] {
  const replacedIds = new Set(
    confirmedSettings.map((s) => s.replacesBaselineId).filter(Boolean) as string[]
  );
  return baselines.filter((b) => !replacedIds.has(b.id));
}

/**
 * 다음 검증 요청(CheckRequest.selectedBaselines)에 포함할 기준 설정 —
 * 삭제되지 않고, confirmedSettings로 대체되지 않고, 체크박스가 켜져 있는 것만.
 */
export function useSelectedBaselinesForValidation(): CanonicalBaseline[] {
  const allBaselines = useAllBaselines();
  const confirmedSettings = useCanonStore((s) => s.confirmedSettings);
  const disabledBaselineIds = useCanonStore((s) => s.disabledBaselineIds);
  const effective = getEffectiveBaselines(allBaselines, confirmedSettings);
  return effective.filter((b) => !disabledBaselineIds.includes(b.id));
}
