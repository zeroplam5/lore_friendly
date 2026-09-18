// 모바일(<xl) 하단 탭바 — docs/ui_ux.md §6
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PenLine, ClipboardCheck, Library } from 'lucide-react';
import { cn } from '@/lib/cn';

const TABS = [
  { href: '/write', label: '집필', Icon: PenLine },
  { href: '/review', label: '검토', Icon: ClipboardCheck },
  { href: '/library', label: '자료실', Icon: Library },
] as const;

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-shrink-0 items-center justify-around border-t border-border bg-surface py-1.5 xl:hidden">
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-md px-4 py-1 text-[11px] font-medium',
              active ? 'text-brand-primary' : 'text-text-tertiary'
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
