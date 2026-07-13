import { Skeleton, ListSkeleton } from '@/components/ui/Skeleton'

export default function TasksLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Quick Capture & Search */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>

      {/* DEFCON Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {['Meltdown', 'Critical', 'Urgent', 'Active'].map((_, i) => (
          <div
            key={i}
            className="glass-card rounded-xl border border-border p-4 space-y-2"
          >
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Section Header */}
      <Skeleton className="h-5 w-24" />

      {/* Task List */}
      <ListSkeleton rows={5} />
    </div>
  )
}
