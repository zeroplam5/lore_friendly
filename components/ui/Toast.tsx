'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ToastOptions {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast는 ToastProvider 내부에서만 사용할 수 있습니다.');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((options: ToastOptions) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...options, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, options.durationMs ?? 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-center gap-3 rounded-lg bg-text-strong px-4 py-3 text-sm text-white shadow-modal'
            )}
          >
            <CheckCircle2 size={16} className="text-status-success-text" />
            <span>{toast.message}</span>
            {toast.actionLabel && (
              <button
                onClick={() => {
                  toast.onAction?.();
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                }}
                className="font-semibold text-brand-soft underline"
              >
                {toast.actionLabel}
              </button>
            )}
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-white/60 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
