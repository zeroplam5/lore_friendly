import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './globals.css';
import { GlobalNavBar } from '@/components/layout/GlobalNavBar';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Lore Friendly',
  description: '2차 창작 작가를 위한 세계관 정합성 린터',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className="font-sans">
        <ToastProvider>
          <div className="flex h-screen flex-col">
            <GlobalNavBar />
            <div className="min-h-0 flex-1">{children}</div>
            <BottomTabBar />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
