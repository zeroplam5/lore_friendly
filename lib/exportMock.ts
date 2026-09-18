// 목업 진행률 — Backend&DB.md §7.2 (원본 값 47페이지/49% 고정 사용)
export const MOCK_TOTAL_PAGES = 47;
export const MOCK_PROGRESS_TARGET = 49;

export async function runMockExportProgress(
  onProgress: (percent: number, currentPage: number) => void
): Promise<void> {
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    await new Promise((r) => setTimeout(r, 150));
    const percent = Math.round((MOCK_PROGRESS_TARGET / steps) * i);
    const currentPage = Math.round((MOCK_TOTAL_PAGES * percent) / 100);
    onProgress(percent, currentPage);
  }
}
