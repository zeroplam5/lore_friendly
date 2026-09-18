// 좌표 매핑 & 안전 치환 — ai.md §3 applySuggestionSafely 그대로 포팅
import type { IssueItem } from '@/types';

export function applySuggestionSafely(fullContent: string, issue: IssueItem): string {
  const { contextPrefix, targetQuote, suggestion } = issue;
  const searchPattern = contextPrefix + targetQuote;
  const targetIndex = fullContent.indexOf(searchPattern);

  if (targetIndex === -1) {
    // 앵커 탐색 실패 시 targetQuote 단순 단일 매칭으로 폴백
    return fullContent.replace(targetQuote, suggestion);
  }

  const replaceStartIndex = targetIndex + contextPrefix.length;
  const replaceEndIndex = replaceStartIndex + targetQuote.length;

  return (
    fullContent.substring(0, replaceStartIndex) +
    suggestion +
    fullContent.substring(replaceEndIndex)
  );
}
