// 데모 프로젝트 초안 로더 — Backend&DB.md §2.1-B
// data/drafts/demo_project.json 을 ProjectDraft 타입으로 노출한다.
import rawProject from '@/data/drafts/demo_project.json';
import type { ProjectDraft } from '@/types';

export const DEMO_PROJECT: ProjectDraft = rawProject as ProjectDraft;
