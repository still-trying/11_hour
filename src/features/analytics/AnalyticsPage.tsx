/**
 * AnalyticsPage — Performance & History Dashboard
 *
 * Shows task completion stats, urgency distribution, and streak history.
 */

import React, { useMemo } from 'react';
import { BarChart2, Trophy, Flame, Clock, TrendingUp, CheckCircle2, type LucideIcon } from 'lucide-react';
import { useTasksQuery } from '@/lib/hooks/useTasksQuery';
import { useAppStore } from '@/lib/store/useAppStore';
import { isPast } from 'date-fns';

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

function DefconBar({
  level,
  count,
  color,
  total,
}: {
  level: string;
  count: number;
  color: string;
  total: number;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono text-text-muted w-20 uppercase">{level}</span>
      <div className="flex-1 h-3 bg-bg-primary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono text-text-muted w-8 text-right">{count}</span>
    </div>
  );
}

export default function AnalyticsPage(): React.JSX.Element {
  const { tasks } = useTasksQuery();
  const { user } = useAppStore();

  const analytics = useMemo(() => {
    const completed = tasks.filter((t) => t.status === 'completed');
    const active = tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');
    const overdue = active.filter((t) => t.deadline && isPast(new Date(t.deadline)));

    const defconDist = {
      meltdown: active.filter((t) => t.defcon_level === 'meltdown').length,
      critical: active.filter((t) => t.defcon_level === 'critical').length,
      elevated: active.filter((t) => t.defcon_level === 'elevated').length,
      normal: active.filter((t) => t.defcon_level === 'normal').length,
      calm: active.filter((t) => t.defcon_level === 'calm').length,
    };

    const avgUrgency =
      active.length > 0
        ? Math.round(active.reduce((acc, t) => acc + (t.urgency_score ?? 0), 0) / active.length)
        : 0;

    const totalEstimatedMin = active.reduce((acc, t) => acc + (t.estimated_minutes ?? 0), 0);
    const completionRate =
      tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;

    return {
      total: tasks.length,
      completed: completed.length,
      active: active.length,
      overdue: overdue.length,
      avgUrgency,
      totalEstimatedMin,
      completionRate,
      defconDist,
      streak: user?.current_streak ?? 0,
    };
  }, [tasks, user]);

  return (
    <div className="flex flex-col gap-sys-lg p-sys-md">
      {/* Header */}
      <div className="flex flex-col gap-sys-xs border-b border-border-muted pb-sys-sm">
        <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
          <BarChart2 size={14} className="text-accent-amber" />
          <span>PERFORMANCE JOURNAL</span>
        </div>
        <h1 className="font-display text-xxl sm:text-xxxl font-semibold tracking-tight text-text-primary">
          Analytics Hub
        </h1>
        <p className="text-text-muted text-sm max-w-2xl">
          Track your rescue performance, urgency distribution, and focus streaks.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-sys-md">
        <StatCard
          title="Total Tasks"
          value={String(analytics.total)}
          subtitle={`${analytics.completionRate}% completion rate`}
          icon={BarChart2}
          color="text-accent-amber"
        />
        <StatCard
          title="Rescued"
          value={String(analytics.completed)}
          subtitle="Tasks completed"
          icon={Trophy}
          color="text-accent-emerald"
        />
        <StatCard
          title="Avg Urgency"
          value={String(analytics.avgUrgency)}
          subtitle="Across active tasks"
          icon={Flame}
          color={analytics.avgUrgency >= 70 ? 'text-defcon-meltdown' : 'text-defcon-normal'}
        />
        <StatCard
          title="Focus Streak"
          value={`${analytics.streak}d`}
          subtitle={analytics.streak > 0 ? 'Keep going!' : 'Start today'}
          icon={TrendingUp}
          color="text-accent-emerald"
        />
      </div>

      {/* DEFCON Distribution */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-display font-semibold text-text-primary">
          DEFCON Distribution
        </h2>
        <div className="p-4 bg-bg-secondary border border-border-muted rounded-sys-lg flex flex-col gap-3">
          <DefconBar
            level="Meltdown"
            count={analytics.defconDist.meltdown}
            color="var(--sys-color-defcon-meltdown)"
            total={analytics.active}
          />
          <DefconBar
            level="Critical"
            count={analytics.defconDist.critical}
            color="var(--sys-color-defcon-critical)"
            total={analytics.active}
          />
          <DefconBar
            level="Elevated"
            count={analytics.defconDist.elevated}
            color="var(--sys-color-defcon-elevated)"
            total={analytics.active}
          />
          <DefconBar
            level="Normal"
            count={analytics.defconDist.normal}
            color="var(--sys-color-defcon-normal)"
            total={analytics.active}
          />
          <DefconBar
            level="Calm"
            count={analytics.defconDist.calm}
            color="var(--sys-color-defcon-calm)"
            total={analytics.active}
          />
        </div>
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-sys-md">
        <div className="p-4 bg-bg-secondary border border-border-muted rounded-sys-lg">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-accent-blue" />
            <span className="text-sm font-semibold text-text-primary">Time Investment</span>
          </div>
          <span className="text-3xl font-mono font-bold text-text-primary">
            {Math.round(analytics.totalEstimatedMin / 60)}h {analytics.totalEstimatedMin % 60}m
          </span>
          <p className="text-xs text-text-muted mt-1">Estimated remaining across active tasks</p>
        </div>

        <div className="p-4 bg-bg-secondary border border-border-muted rounded-sys-lg">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={14} className="text-accent-emerald" />
            <span className="text-sm font-semibold text-text-primary">Completion Rate</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-mono font-bold text-text-primary">
              {analytics.completionRate}%
            </span>
            <span className="text-xs text-text-muted pb-1">
              ({analytics.completed}/{analytics.total} tasks)
            </span>
          </div>
          <div className="mt-2 h-2 bg-bg-primary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-emerald rounded-full transition-all duration-700"
              style={{ width: `${analytics.completionRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
