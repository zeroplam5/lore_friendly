// SubNavTabs — docs/ui_ux.md §3(자료실 하위 탭) + 사용자 확정: ⚙️ 아이콘으로 기본 설정(3번째 서브뷰) 진입
'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { LibraryView } from '@/app/library/page';

export function LibrarySubNav({
  view,
  onChangeView,
}: {
  view: LibraryView;
  onChangeView: (view: LibraryView) => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5">
      <div className="flex items-center gap-5">
        <button
          onClick={() => onChangeView('references')}
          className={cn(
            'text-[13px] font-semibold',
            view === 'references' ? 'text-brand-primary' : 'text-text-secondary hover:text-text-primary'
          )}
        >
          참고 자료
        </button>
        <button
          onClick={() => onChangeView('settings')}
          className={cn(
            'text-[13px] font-semibold',
            view === 'settings' ? 'text-brand-primary' : 'text-text-secondary hover:text-text-primary'
          )}
        >
          작품 설정
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChangeView('basic')}
          className={cn(
            'rounded-md p-1.5',
            view === 'basic' ? 'bg-brand-soft text-brand-primary' : 'text-text-tertiary hover:bg-background'
          )}
          title="작품 기본 설정"
        >
          <Settings size={16} />
        </button>
        <Link href="/write" className="text-[13px] text-text-secondary hover:text-brand-primary">
          원고로 돌아가기 →
        </Link>
      </div>
    </div>
  );
}
