import { cn } from '@/lib/cn';

export function ProgressBar({ percent, className }: { percent: number; className?: string }) {
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-background', className)}>
      <div
        className="h-full rounded-full bg-brand-primary transition-all duration-150"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}
