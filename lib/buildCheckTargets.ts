// scope별 targets 조립 — ai.md §2.1 (SCENE→1건 / CHAPTER→해당 챕터 전체 장면 / PROJECT→작품 전체 장면)
import type { CheckTarget, ProjectDraft, ValidationScope } from '@/types';

export function buildCheckTargets(
  project: ProjectDraft,
  scope: ValidationScope,
  chapterId: string,
  sceneId: string
): CheckTarget[] {
  if (scope === 'SCENE') {
    const chapter = project.chapters.find((c) => c.id === chapterId);
    const scene = chapter?.scenes.find((s) => s.id === sceneId);
    if (!chapter || !scene) return [];
    return [{ chapterId: chapter.id, sceneId: scene.id, content: scene.content }];
  }

  if (scope === 'CHAPTER') {
    const chapter = project.chapters.find((c) => c.id === chapterId);
    if (!chapter) return [];
    return chapter.scenes.map((scene) => ({
      chapterId: chapter.id,
      sceneId: scene.id,
      content: scene.content,
    }));
  }

  // PROJECT
  return project.chapters.flatMap((chapter) =>
    chapter.scenes.map((scene) => ({
      chapterId: chapter.id,
      sceneId: scene.id,
      content: scene.content,
    }))
  );
}
