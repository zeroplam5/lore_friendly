// PDF 내보내기 — Backend&DB.md §7.3, §7.4 원안 그대로.
// public/samples/Lore_Friendly_Sample.pdf를 불러와 Canon Index 부록 페이지 1장만 동적으로 append한다.
// Canon Index 부록은 한글을 포함하므로 StandardFonts(WinAnsi, 라틴 전용)로는 인코딩할 수
// 없다 — fontkit으로 Pretendard(public/fonts)를 임베드해 한글 글리프를 지원한다.
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { ConfirmedSetting } from '@/types';

const KOREAN_FONT_URL = '/fonts/Pretendard-Regular.ttf';

export interface CanonIndexEntry {
  title: string;
  description: string;
  scopeLabel: string;
  confirmedAt: string;
}

/** 조판 변환 규칙 — 작은따옴표를 큰따옴표로 정규화 (Backend&DB.md §7.4) */
export function normalizeQuotesForExport(content: string): string {
  return content.replace(/['']([^''""]*)['']/g, '"$1"');
}

export function toCanonIndex(settings: ConfirmedSetting[]): CanonIndexEntry[] {
  return settings.map((s) => ({
    title: s.title,
    description: normalizeQuotesForExport(s.description),
    scopeLabel:
      s.targetScope === 'PROJECT'
        ? '작품 전체'
        : s.targetScope === 'CHAPTER'
          ? `제${s.chapterId} 챕터`
          : `${s.chapterId} · ${s.sceneId}`,
    confirmedAt: s.confirmedAt.slice(0, 10).replace(/-/g, '.'),
  }));
}

function wrapText(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let current = '';
  for (const char of text) {
    current += char;
    if (current.length >= maxChars) {
      lines.push(current);
      current = '';
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function buildExportedPdf(
  sampleUrl: string,
  settings: ConfirmedSetting[]
): Promise<Blob> {
  const sampleBytes = await fetch(sampleUrl).then((r) => r.arrayBuffer());
  const pdfDoc = await PDFDocument.load(sampleBytes);
  const entries = toCanonIndex(settings);

  if (entries.length > 0) {
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = await fetch(KOREAN_FONT_URL).then((r) => r.arrayBuffer());
    const page = pdfDoc.addPage([419.5, 595.3]); // A5 pt 환산 (148x210mm)
    const font = await pdfDoc.embedFont(fontBytes, { subset: true });

    page.drawText('부록 · Canon Index', { x: 56, y: 540, size: 18, font });
    page.drawText('작가가 확정한 고유 설정 목록', {
      x: 56,
      y: 518,
      size: 11,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    let cursorY = 480;
    entries.forEach((entry, i) => {
      if (cursorY < 60) return; // 단일 부록 페이지 용량 초과분은 생략(MVP 단순화)
      page.drawText(`${i + 1}. ${entry.title} - ${entry.scopeLabel} (${entry.confirmedAt})`, {
        x: 56,
        y: cursorY,
        size: 11,
        font,
      });
      const descLines = wrapText(entry.description, 60);
      descLines.forEach((line, li) => {
        page.drawText(line, {
          x: 66,
          y: cursorY - 16 - li * 13,
          size: 9,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
      });
      cursorY -= 40 + descLines.length * 13;
    });
  }

  const mergedBytes = await pdfDoc.save();
  return new Blob([mergedBytes as BlobPart], { type: 'application/pdf' });
}
