import { Skeleton, StatsCardSkeleton } from '@/components/ui/Skeleton';

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl border border-border p-5 space-y-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <div className="glass-card rounded-xl border border-border p-5 space-y-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>

      {/* Habits Overview */}
      <div className="glass-card rounded-xl border border-border p-5 space-y-4">
        <Skeleton className="h-5 w-28" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
