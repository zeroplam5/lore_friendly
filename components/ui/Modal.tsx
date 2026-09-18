'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onOpenChange, title, description, children, className }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[520px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2',
            'overflow-y-auto rounded-xl bg-surface p-6 shadow-modal focus:outline-none',
            className
          )}
        >
          <div className="mb-1 flex items-start justify-between">
            <Dialog.Title className="text-lg font-bold text-text-primary">{title}</Dialog.Title>
            <Dialog.Close className="rounded p-1 text-text-tertiary hover:bg-background">
              <X size={18} />
            </Dialog.Close>
          </div>
          {description && (
            <Dialog.Description className="mb-4 text-[13px] text-text-secondary">
              {description}
            </Dialog.Description>
          )}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
