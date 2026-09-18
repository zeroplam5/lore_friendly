// GlobalNavBar — docs/ui_ux.md §3.1, DESIGN.md §3 (56px, 로고/브레드크럼/세그먼트탭/내보내기)
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useDraftStore, findScene } from '@/stores/useDraftStore';

const TABS = [
  { href: '/write', label: '집필' },
  { href: '/review', label: '검토' },
  { href: '/library', label: '자료실' },
] as const;

export function GlobalNavBar() {
  const pathname = usePathname();
  const project = useDraftStore((s) => s.project);
  const selectedChapterId = useDraftStore((s) => s.selectedChapterId);
  const selectedSceneId = useDraftStore((s) => s.selectedSceneId);
  const { chapter, scene } = findScene(project, selectedChapterId, selectedSceneId);

  const activeTab = TABS.find((t) => pathname.startsWith(t.href))?.href;

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border bg-surface px-6">
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/write" className="flex items-baseline gap-0.5 flex-shrink-0">
          <span className="font-serif text-base font-bold italic text-brand-primary">lore</span>
          <span className="text-[15px] text-text-primary">friendly</span>
        </Link>
        <div className="h-4 w-px bg-border flex-shrink-0" />
        <button className="flex h-6 flex-shrink-0 items-center gap-1 rounded-md bg-background px-2 text-[13px] text-text-primary">
          <span className="max-w-[140px] truncate">{project.title}</span>
          <ChevronDown size={12} className="text-text-tertiary" />
        </button>
        {chapter && (
          <nav className="flex min-w-0 items-center gap-1 text-[13px] text-text-secondary">
            <span className="flex-shrink-0">/</span>
            <span className="flex-shrink-0">{chapter.title.replace(/^제(\d+)장.*/, '제$1장')}</span>
            {scene && (
              <>
                <span className="flex-shrink-0">›</span>
                <span className="truncate font-medium text-text-primary">{scene.title}</span>
              </>
            )}
          </nav>
        )}
      </div>

      <div className="flex flex-shrink-0 items-center gap-4">
        <span className="hidden text-xs text-text-tertiary sm:inline">자동 저장됨</span>
        <div className="hidden items-center gap-0.5 rounded-lg bg-background p-0.5 xl:flex">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'rounded-md px-4 py-1.5 text-[13px] font-semibold transition-colors',
                activeTab === tab.href
                  ? 'bg-surface text-brand-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <Link
          href="/export"
          className={cn(
            'rounded-lg border border-border px-3 py-1.5 text-[13px] font-semibold text-text-primary hover:bg-background',
            pathname.startsWith('/export') && 'border-brand-primary text-brand-primary'
          )}
        >
          내보내기
        </Link>
      </div>
    </header>
  );
}
