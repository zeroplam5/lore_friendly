// 검토 화면 인라인 하이라이트 렌더용 — contextPrefix+targetQuote 앵커링으로 문단 내
// 오프셋을 찾아 세그먼트 배열을 만든다. applySuggestionSafely(ai.md §3)와 동일한
// "복합 앵커 실패 시 단순 매칭 폴백" 원칙을 그대로 따른다.
import type { IssueItem } from '@/types';

export interface HighlightSegment {
  text: string;
  issueId: string | null;
}

interface Match {
  start: number;
  end: number;
  issueId: string;
}

function locateIssue(content: string, issue: IssueItem): Match | null {
  const { contextPrefix, targetQuote } = issue;
  const searchPattern = contextPrefix + targetQuote;
  const anchored = content.indexOf(searchPattern);

  if (anchored !== -1) {
    const start = anchored + contextPrefix.length;
    return { start, end: start + targetQuote.length, issueId: issue.id };
  }

  const fallback = content.indexOf(targetQuote);
  if (fallback === -1) return null;
  return { start: fallback, end: fallback + targetQuote.length, issueId: issue.id };
}

/** 본문을 이슈 하이라이트 기준으로 분해한다. 매칭되지 않는 이슈는 결과에서 제외된다. */
export function buildHighlightSegments(content: string, issues: IssueItem[]): HighlightSegment[] {
  const matches = issues
    .map((issue) => locateIssue(content, issue))
    .filter((m): m is Match => m !== null)
    .sort((a, b) => a.start - b.start);

  const nonOverlapping: Match[] = [];
  let lastEnd = -1;
  for (const match of matches) {
    if (match.start >= lastEnd) {
      nonOverlapping.push(match);
      lastEnd = match.end;
    }
  }

  const segments: HighlightSegment[] = [];
  let cursor = 0;
  for (const match of nonOverlapping) {
    if (match.start > cursor) {
      segments.push({ text: content.slice(cursor, match.start), issueId: null });
    }
    segments.push({ text: content.slice(match.start, match.end), issueId: match.issueId });
    cursor = match.end;
  }
  if (cursor < content.length) {
    segments.push({ text: content.slice(cursor), issueId: null });
  }
  return segments;
}

/** 본문에서 targetQuote를 전혀 찾지 못한 이슈 ID 목록 — "관련 구절 없음" 빈 상태 판정용 */
export function findUnmatchedIssueIds(content: string, issues: IssueItem[]): Set<string> {
  const unmatched = new Set<string>();
  for (const issue of issues) {
    if (locateIssue(content, issue) === null) unmatched.add(issue.id);
  }
  return unmatched;
}
