import { Skeleton, StatsCardSkeleton } from '@/components/ui/Skeleton';

export default function SettingsLoading() {
  return (
    <div className="space-y-8 max-w-3xl animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Profile Section */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-20" />
        <div className="glass-card rounded-xl border border-border p-5 space-y-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="flex gap-2">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </div>

      {/* Notifications Section */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-28" />
        <div className="glass-card rounded-xl border border-border p-5 space-y-4">
          <Skeleton className="h-5 w-full rounded-lg" />
          <Skeleton className="h-5 w-full rounded-lg" />
        </div>
      </div>

      {/* Appearance Section */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <div className="glass-card rounded-xl border border-border p-5 space-y-4">
          <Skeleton className="h-5 w-full rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-18 rounded-full" />
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-20" />
        <div className="glass-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
