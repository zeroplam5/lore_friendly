// 모바일(<xl) 좌/우 패널을 슬라이드 오버레이로 여는 공용 셸 — docs/ui_ux.md §6
'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface SidePanelSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side: 'left' | 'right';
  title: string;
  children: ReactNode;
}

export function SidePanelSheet({ open, onOpenChange, side, title, children }: SidePanelSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content
          className={cn(
            'fixed top-0 z-50 h-full w-[85vw] max-w-sm overflow-y-auto bg-surface p-4 shadow-modal focus:outline-none',
            side === 'left' ? 'left-0' : 'right-0'
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <Dialog.Title className="text-sm font-bold text-text-primary">{title}</Dialog.Title>
            <Dialog.Close className="rounded p-1 text-text-tertiary hover:bg-background">
              <X size={18} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
