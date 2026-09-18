// 원고/프로젝트 구조 스키마 — Backend&DB.md §2.1-B. data/drafts/demo_project.json

export interface Scene {
  id: string;
  title: string;
  order: number;
  /** 마크다운 원고 본문 */
  content: string;
  /** ISO 8601 Timestamp */
  lastSaved: string;
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  scenes: Scene[];
}

export interface ProjectUniverseConfig {
  /** "Earth-616 + MCU 혼합" */
  baselineUniverse: string;
  /** 원작 준수 정도 — 엄격한 고증 / 작가 해석 허용 / 자유 창작 (3-way 세그먼트) */
  complianceLevel: 'STRICT' | 'PERMISSIVE' | 'FREE';
  referencedWorks: string[];
}

export interface ProjectDraft {
  id: string;
  /** "푸른 큐브의 다른 가능성" */
  title: string;
  /** "서하윤" */
  author: string;
  universeConfig: ProjectUniverseConfig;
  chapters: Chapter[];
}
