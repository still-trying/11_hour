import { CardSkeleton, StatsCardSkeleton, Skeleton } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton variant="circular" className="h-10 w-10" />
      </div>

      {/* Quick Capture */}
      <Skeleton className="h-12 w-full rounded-xl" />

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Priority */}
          <div className="glass-card rounded-xl border border-border p-5 space-y-4">
            <Skeleton className="h-5 w-28" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton variant="circular" className="h-5 w-5" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
