import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lore Friendly',
  description: '2차 창작 작가를 위한 세계관 정합성 린터',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
