// CSS A5 미리보기 — docs/ui_ux.md §7.1 (실제 PDF 아님, aspect-ratio 148/210 재현)
import type { ExportSettings } from './ExportSidebar';

export function ExportPreview({ settings }: { settings: ExportSettings }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 overflow-y-auto bg-background p-8">
      <div
        className="flex w-full max-w-[420px] flex-col items-center justify-between bg-pdfPage p-10 shadow-sheet"
        style={{ aspectRatio: '148 / 210', fontFamily: 'var(--font-serif, serif)' }}
      >
        {settings.includeCover ? (
          <>
            <div className="mt-10 h-px w-10 bg-text-tertiary" />
            <div className="flex flex-col items-center gap-3 text-center">
              <h1 className="font-serif text-2xl font-bold text-text-strong">{settings.title}</h1>
              <div className="h-px w-16 bg-border" />
              <p className="text-sm text-text-secondary">{settings.author} 소설</p>
            </div>
            <p className="mb-4 text-xs tracking-widest text-text-tertiary">LORE FRIENDLY PRESS</p>
          </>
        ) : (
          <p className="m-auto text-sm text-text-tertiary">표지를 포함하지 않았습니다.</p>
        )}
      </div>
      <p className="text-xs text-text-tertiary">
        {settings.paperSize} · {settings.fontFamily === 'nanum-myeongjo' ? '나눔명조' : 'Pretendard'} ·{' '}
        {settings.fontSize}pt · 줄간격 {settings.lineHeight}
      </p>
    </div>
  );
}
