// 캐논(기준/확정 설정) 스토어 — Backend&DB.md §2.1-A, C / §5 lore_confirmed_settings
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MARVEL_BASELINE } from '@/lib/canon';
import type { ConfirmedSetting } from '@/types';

interface CanonState {
  confirmedSettings: ConfirmedSetting[];
  addConfirmedSetting: (setting: ConfirmedSetting) => void;
  removeConfirmedSetting: (id: string) => void;
}

export const useCanonStore = create<CanonState>()(
  persist(
    (set) => ({
      confirmedSettings: [],
      addConfirmedSetting: (setting) =>
        set((state) => ({ confirmedSettings: [...state.confirmedSettings, setting] })),
      removeConfirmedSetting: (id) =>
        set((state) => ({
          confirmedSettings: state.confirmedSettings.filter((s) => s.id !== id),
        })),
    }),
    { name: 'lore_confirmed_settings' }
  )
);

/** confirmedSettings가 대체한 baseline을 제외한 유효 기준 설정 목록 — Backend&DB.md §2.1-C */
export function getEffectiveBaselines(confirmedSettings: ConfirmedSetting[]) {
  const replacedIds = new Set(
    confirmedSettings.map((s) => s.replacesBaselineId).filter(Boolean) as string[]
  );
  return MARVEL_BASELINE.filter((b) => !replacedIds.has(b.id));
}
