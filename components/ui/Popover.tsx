// NoIssuePopover 겹침 결함 방어 — DESIGN.md §11.1-C: side="top" 기본값으로 트리거 위에 배치
'use client';

import * as RadixPopover from '@radix-ui/react-popover';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Popover({ open, onOpenChange, trigger, children, className }: PopoverProps) {
  return (
    <RadixPopover.Root open={open} onOpenChange={onOpenChange}>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          side="top"
          align="end"
          sideOffset={8}
          className={cn(
            'z-50 w-72 rounded-lg border border-border bg-surface p-4 shadow-modal',
            className
          )}
        >
          {children}
          <RadixPopover.Arrow className="fill-surface" />
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
