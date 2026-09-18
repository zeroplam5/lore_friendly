// 3패널 공통 셸(순수 프리젠테이션) — docs/ui_ux.md §2.1 (좌 280 / 중앙 flex-1 / 우 320)
// + §6 반응형(xl 미만: 패널을 슬라이드 오버레이로 접고 아이콘 버튼으로 열기).
// 집필/검토 화면은 이 컴포넌트에 각자의 상태/로직이 담긴 패널 콘텐츠만 슬롯으로 넘긴다 —
// 레이아웃 셸 자체는 어떤 페이지 상태도 알지 못한다.
'use client';

import { useState, type ReactNode } from 'react';
import { PanelLeft, PanelRight } from 'lucide-react';
import { SidePanelSheet } from '@/components/ui/SidePanelSheet';

interface ThreePanelLayoutProps {
  leftPanel?: ReactNode;
  leftTitle?: string;
  rightPanel?: ReactNode;
  rightTitle?: string;
  children: ReactNode;
}

export function ThreePanelLayout({
  leftPanel,
  leftTitle = '목록',
  rightPanel,
  rightTitle = '상세',
  children,
}: ThreePanelLayoutProps) {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  return (
    <div className="flex h-full min-h-0">
      {leftPanel && (
        <aside className="hidden w-[280px] flex-shrink-0 overflow-y-auto border-r border-border bg-surface xl:block">
          {leftPanel}
        </aside>
      )}

      <main className="relative min-w-0 flex-1 overflow-y-auto bg-background">
        {(leftPanel || rightPanel) && (
          <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2 xl:hidden">
            {leftPanel ? (
              <button
                onClick={() => setLeftOpen(true)}
                className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-text-secondary"
              >
                <PanelLeft size={14} /> {leftTitle}
              </button>
            ) : (
              <span />
            )}
            {rightPanel && (
              <button
                onClick={() => setRightOpen(true)}
                className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-text-secondary"
              >
                {rightTitle} <PanelRight size={14} />
              </button>
            )}
          </div>
        )}
        {children}
      </main>

      {rightPanel && (
        <aside className="hidden w-[320px] flex-shrink-0 flex-col overflow-y-auto border-l border-border bg-surface xl:flex">
          {rightPanel}
        </aside>
      )}

      {leftPanel && (
        <SidePanelSheet open={leftOpen} onOpenChange={setLeftOpen} side="left" title={leftTitle}>
          {leftPanel}
        </SidePanelSheet>
      )}
      {rightPanel && (
        <SidePanelSheet open={rightOpen} onOpenChange={setRightOpen} side="right" title={rightTitle}>
          {rightPanel}
        </SidePanelSheet>
      )}
    </div>
  );
}
