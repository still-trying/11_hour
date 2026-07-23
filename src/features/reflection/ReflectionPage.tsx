import React, { useMemo } from 'react';
import {
  Award,
  Trophy,
  TrendingUp,
  CheckCircle2,
  Flame,
  BarChart3,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useTasksQuery } from '@/lib/hooks/useTasksQuery';
import { useAppStore } from '@/lib/store/useAppStore';
import { fireConfetti } from '@/lib/utils/confetti';
import { isPast, isToday, isThisWeek } from 'date-fns';

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="p-4 bg-bg-secondary border border-border-muted rounded-sys-lg flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-text-muted uppercase tracking-wider">{title}</span>
        <Icon size={14} className={color} />
      </div>
      <span className="text-2xl font-bold font-mono text-text-primary">{value}</span>
      <span className={`text-[10px] font-mono ${color}`}>{subtitle}</span>
    </div>
  );
}

export default function ReflectionPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { tasks, isLoading } = useTasksQuery();
  const { user } = useAppStore();

  // Trigger confetti on first load to celebrate reflection
  const hasFired = React.useRef(false);
  React.useEffect(() => {
    if (!hasFired.current) {
      fireConfetti({ particleCount: 60, spread: 80 });
      hasFired.current = true;
    }
  }, []);

  const reflection = useMemo(() => {
    const completed = tasks.filter((t) => t.status === 'completed');
    const completedThisWeek = completed.filter(
      (t) => t.updated_at && isThisWeek(new Date(t.updated_at)),
    );
    const completedToday = completed.filter(
      (t) => t.updated_at && isToday(new Date(t.updated_at)),
    );
    const overdue = tasks.filter(
      (t) => t.status !== 'completed' && t.status !== 'cancelled' && t.deadline && isPast(new Date(t.deadline)),
    );
    const onTime = completed.filter(
      (t) => t.deadline && t.updated_at && new Date(t.updated_at) <= new Date(t.deadline),
    );

    return {
      total: tasks.length,
      completed: completed.length,
      completedThisWeek: completedThisWeek.length,
      completedToday: completedToday.length,
      overdue,
      onTime: onTime.length,
      completionRate: tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0,
      streak: user?.current_streak ?? 0,
      tasksCompleted: user?.tasks_completed ?? completed.length,
    };
  }, [tasks, user]);

  // Recently completed tasks (last 5)
  const recentCompleted = useMemo(
    () =>
      tasks
        .filter((t) => t.status === 'completed' && t.updated_at)
        .sort(
          (a, b) =>
            new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime(),
        )
        .slice(0, 5),
    [tasks],
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-sys-lg p-sys-md animate-pulse">
        <div className="h-8 bg-bg-secondary rounded-sys-md w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-sys-md">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-bg-secondary rounded-sys-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-sys-lg p-sys-md">
      {/* Header */}
      <div className="flex flex-col gap-sys-xs border-b border-border-muted pb-sys-sm">
        <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
          <Award size={14} className="text-accent-emerald" />
          <span>
            COGNITIVE RETROSPECTIVE
            {id ? ` // EPISODE: ${id.slice(0, 8)}` : ''}
          </span>
        </div>
        <h1 className="font-display text-xxl sm:text-xxxl font-semibold tracking-tight text-text-primary flex items-center gap-3">
          <Trophy size={24} className="text-accent-amber" />
          Reflection Summary
        </h1>
        <p className="text-text-muted text-sm max-w-2xl">
          {reflection.completed > 0
            ? `You've rescued ${reflection.completed} task${reflection.completed !== 1 ? 's' : ''}. Take a moment to acknowledge your progress.`
            : 'Complete a few tasks first, then come back here to see your reflection.'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-sys-md">
        <StatCard
          title="Rescued"
          value={String(reflection.completed)}
          subtitle={`${reflection.completionRate}% of all tasks`}
          icon={CheckCircle2}
          color="text-accent-emerald"
        />
        <StatCard
          title="This Week"
          value={String(reflection.completedThisWeek)}
          subtitle="Completed in the last 7 days"
          icon={TrendingUp}
          color="text-accent-blue"
        />
        <StatCard
          title="Focus Streak"
          value={`${reflection.streak}d`}
          subtitle={reflection.streak > 0 ? 'Keep the momentum!' : 'Start today'}
          icon={Flame}
          color={reflection.streak > 0 ? 'text-accent-amber' : 'text-text-muted'}
        />
        <StatCard
          title="On-Time Rate"
          value={reflection.completed > 0 ? `${Math.round((reflection.onTime / reflection.completed) * 100)}%` : '—'}
          subtitle="Completed before deadline"
          icon={Target}
          color={reflection.onTime > 0 ? 'text-accent-emerald' : 'text-text-muted'}
        />
      </div>

      {/* Completion Bar */}
      {reflection.total > 0 && (
        <div className="p-4 bg-bg-secondary border border-border-muted rounded-sys-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
              Overall Progress
            </span>
            <span className="text-xs font-mono text-text-muted">
              {reflection.completed}/{reflection.total} tasks
            </span>
          </div>
          <div className="h-3 bg-bg-primary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-emerald rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${reflection.completionRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] font-mono text-text-muted">
            <span>{reflection.overdue.length} overdue</span>
            <span>{reflection.total - reflection.completed - reflection.overdue.length} active</span>
          </div>
        </div>
      )}

      {/* Recently Completed Tasks */}
      {recentCompleted.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-display font-semibold text-text-primary flex items-center gap-2">
            <BarChart3 size={16} className="text-accent-emerald" />
            Recently Rescued
            <span className="text-sm font-mono text-text-muted">(last 5)</span>
          </h2>
          <div className="flex flex-col gap-2">
            {recentCompleted.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 bg-bg-secondary border border-border-muted rounded-sys-md"
              >
                <CheckCircle2 size={14} className="text-accent-emerald shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-text-primary truncate block">{task.title}</span>
                </div>
                <span className="text-[10px] font-mono text-text-muted shrink-0">
                  {task.updated_at ? formatRelativeTime(task.updated_at) : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {reflection.completed === 0 && (
        <div className="p-sys-lg bg-bg-secondary border border-border-muted rounded-sys-lg flex flex-col gap-sys-sm items-center justify-center min-h-[200px]">
          <Target size={32} className="text-text-muted/40" />
          <span className="font-mono text-sm text-text-muted mt-2">
            No completed tasks yet
          </span>
          <span className="text-xs text-text-muted">
            Tasks you rescue will appear here with stats and progress
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Formats an ISO date string into a human-readable relative time.
 */
function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;

  if (diffMs < 60_000) return 'Just now';
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(iso).toLocaleDateString();
}
