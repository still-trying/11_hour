import { Skeleton } from '@/components/ui/Skeleton';

export default function HabitsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Habits Grid */}
      <div className="glass-card rounded-xl border border-border p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <Skeleton variant="circular" className="h-20 w-20" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Progress Summary */}
      <Skeleton className="h-10 w-48 rounded-lg mx-auto" />
    </div>
  );
}
