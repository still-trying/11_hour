import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular';
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'rectangular', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse bg-bg-secondary/60 border border-border-muted/30',
          variant === 'circular' ? 'rounded-full' : 'rounded-sys-md',
          className
        )}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

/**
 * Pre-composed stats card skeleton used by dashboard loading pages.
 */
export function StatsCardSkeleton() {
  return (
    <div className="bg-bg-secondary/40 border border-border-muted/30 rounded-sys-lg p-4 space-y-3">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

/**
 * Pre-composed generic card skeleton.
 */
export function CardSkeleton() {
  return (
    <div className="bg-bg-secondary/40 border border-border-muted/30 rounded-sys-lg p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="h-10 w-10" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-sys-md" />
    </div>
  );
}

interface ListSkeletonProps {
  rows?: number;
}

/**
 * Pre-composed list skeleton representing rows of text items.
 */
export function ListSkeleton({ rows = 3 }: ListSkeletonProps) {
  return (
    <div className="bg-bg-secondary/40 border border-border-muted/30 rounded-sys-lg p-5 space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between border-b border-border-muted/20 pb-3 last:border-0 last:pb-0">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton variant="circular" className="h-5 w-5" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
