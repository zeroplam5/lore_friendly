// 자료실 스토어 — Backend&DB.md §8
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEMO_REFERENCES, DEMO_INCONSISTENCIES } from '@/data/library/demoReferences';
import type { ReferenceMaterial } from '@/types';

interface LibraryState {
  references: ReferenceMaterial[];
  addReference: (reference: ReferenceMaterial) => void;
  updateReferenceStatus: (id: string, status: ReferenceMaterial['status']) => void;
  removeReference: (id: string) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      references: DEMO_REFERENCES,
      addReference: (reference) =>
        set((state) => ({ references: [...state.references, reference] })),
      updateReferenceStatus: (id, status) =>
        set((state) => ({
          references: state.references.map((r) => (r.id === id ? { ...r, status } : r)),
        })),
      removeReference: (id) =>
        set((state) => ({ references: state.references.filter((r) => r.id !== id) })),
    }),
    { name: 'lore_library_references' }
  )
);

/** 자료 간 불일치는 Backend&DB.md §8.3 스펙대로 항상 고정 데모 데이터만 반환 */
export function getInconsistencies() {
  return DEMO_INCONSISTENCIES;
}
