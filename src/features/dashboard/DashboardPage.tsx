/**
 * DashboardPage — Live Workspace Dashboard
 *
 * Shows real-time task stats, DEFCON status summary, and an urgency-sorted
 * task list. Pulls live data from useTasksQuery and useHabitsQuery hooks.
 */

import React, { useMemo } from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useTasksQuery } from '@/lib/hooks/useTasksQuery';
import { useHabitsQuery } from '@/lib/hooks/useHabitsQuery';
import { useAppStore } from '@/lib/store/useAppStore';
import { TaskCard } from '@/components/ui/TaskCard';
import { DefconBadge } from '@/components/ui/DefconBadge';
import type { UrgencyLevel } from '@/lib/utils/urgency';
import { useNavigate } from 'react-router-dom';
import { isToday, isPast } from 'date-fns';
import { soundEngine } from '@/lib/utils/sounds';
import { AIRecommendation } from './components/AIRecommendation';

const DEFCON_PRIORITY: Record<string, number> = {
  meltdown: 5,
  critical: 4,
  elevated: 3,
  normal: 2,
  calm: 1,
};

export default function DashboardPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const { tasks, isLoading, completeTask, deleteTask, snoozeTask } = useTasksQuery();
  const { habits } = useHabitsQuery();

  // Computed stats
  const stats = useMemo(() => {
    const activeTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');
    const completedTasks = tasks.filter((t) => t.status === 'completed');
    const overdueTasks = activeTasks.filter((t) => t.deadline && isPast(new Date(t.deadline)));
    const dueToday = activeTasks.filter((t) => t.deadline && isToday(new Date(t.deadline)));
    const meltdowns = activeTasks.filter((t) => t.defcon_level === 'meltdown');
    const criticals = activeTasks.filter((t) => t.defcon_level === 'critical');

    // Highest DEFCON level across active tasks
    let highestDefcon: UrgencyLevel = 'calm';
    for (const task of activeTasks) {
      const level = task.defcon_level as UrgencyLevel;
      if (level && (DEFCON_PRIORITY[level] || 0) > (DEFCON_PRIORITY[highestDefcon] || 0)) {
        highestDefcon = level;
      }
    }

    return {
      active: activeTasks.length,
      completed: completedTasks.length,
      overdue: overdueTasks.length,
      dueToday: dueToday.length,
      meltdowns: meltdowns.length,
      criticals: criticals.length,
      highestDefcon,
      streak: user?.current_streak ?? 0,
    };
  }, [tasks, user]);

  // Sort tasks by urgency (highest first)
  const sortedActiveTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status !== 'completed' && t.status !== 'cancelled')
      .sort((a, b) => (b.urgency_score ?? 0) - (a.urgency_score ?? 0));
  }, [tasks]);

  const handleStartFocus = (id: string) => {
    soundEngine.playClick();
    navigate(`/rescue/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-sys-lg p-sys-md animate-pulse">
        <div className="h-8 bg-bg-secondary rounded-sys-md w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-sys-md">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-bg-secondary rounded-sys-lg" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-bg-secondary rounded-sys-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-sys-lg p-sys-md">
      {/* Page Header */}
      <div className="flex flex-col gap-sys-xs border-b border-border-muted pb-sys-sm">
        <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
          <LayoutDashboard size={14} className="text-accent-amber" />
          <span>WORKSPACE DIRECTORY</span>
          {stats.highestDefcon !== 'calm' && <DefconBadge level={stats.highestDefcon} size="sm" />}
        </div>
        <h1 className="font-display text-xxl sm:text-xxxl font-semibold tracking-tight text-text-primary">
          {user?.displayName ? `${user.displayName}'s Dashboard` : 'Workspace Dashboard'}
        </h1>
        <p className="text-text-muted text-sm max-w-2xl">
          {stats.meltdowns > 0
            ? `🚨 ${stats.meltdowns} task${stats.meltdowns > 1 ? 's' : ''} at MELTDOWN level — immediate action required.`
            : stats.overdue > 0
              ? `⚠️ ${stats.overdue} overdue task${stats.overdue > 1 ? 's' : ''} need attention.`
              : stats.active > 0
                ? `You have ${stats.active} active task${stats.active > 1 ? 's' : ''}. Stay focused.`
                : 'All clear — no active tasks. Create one to get started.'}
        </p>
      </div>

      {/* DEFCON Alert Banner (only shows for meltdown/critical) */}
      {(stats.meltdowns > 0 || stats.criticals > 0) && (
        <button
          onClick={() => navigate('/emergency')}
          className="
            flex items-center gap-3 p-4 rounded-sys-lg border-2 cursor-pointer
            transition-all duration-300 hover:scale-[1.01]
            defcon-meltdown
          "
        >
          <Flame size={20} className="text-defcon-meltdown animate-pulse" />
          <div className="flex-1 text-left">
            <span className="text-sm font-semibold text-text-primary">
              {stats.meltdowns + stats.criticals} critical task
              {stats.meltdowns + stats.criticals > 1 ? 's' : ''} need immediate attention
            </span>
            <span className="text-xs text-text-muted ml-2">→ Open Emergency Dashboard</span>
          </div>
          <AlertTriangle size={16} className="text-defcon-meltdown" />
        </button>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-sys-md">
        {[
          {
            title: 'Active Tasks',
            value: String(stats.active),
            icon: Zap,
            color: stats.active > 0 ? 'text-accent-amber' : 'text-text-muted',
            status: stats.active > 0 ? 'Running' : 'Idle',
          },
          {
            title: 'Due Today',
            value: String(stats.dueToday),
            icon: Clock,
            color: stats.dueToday > 0 ? 'text-defcon-elevated' : 'text-text-muted',
            status: stats.dueToday > 0 ? 'Time-sensitive' : 'Clear',
          },
          {
            title: 'Focus Streak',
            value: `${stats.streak} Day${stats.streak !== 1 ? 's' : ''}`,
            icon: TrendingUp,
            color: stats.streak > 0 ? 'text-accent-emerald' : 'text-text-muted',
            status: stats.streak > 0 ? 'Active' : 'Start today',
          },
          {
            title: 'Rescued',
            value: `${stats.completed} Task${stats.completed !== 1 ? 's' : ''}`,
            icon: CheckCircle2,
            color: stats.completed > 0 ? 'text-accent-emerald' : 'text-text-muted',
            status: stats.completed > 0 ? 'Completed' : 'None yet',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-sys-md bg-bg-secondary border border-border-muted rounded-sys-lg flex flex-col gap-sys-xs
                       transition-all duration-200 hover:border-border-muted/80 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
                {stat.title}
              </span>
              <stat.icon size={14} className={stat.color} />
            </div>
            <span className="text-xxl font-semibold font-mono text-text-primary">{stat.value}</span>
            <span className={`text-[10px] font-mono ${stat.color}`}>{stat.status}</span>
          </div>
        ))}
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-sys-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-semibold text-text-primary">
            Active Tasks
            {sortedActiveTasks.length > 0 && (
              <span className="text-sm font-mono text-text-muted ml-2">
                ({sortedActiveTasks.length})
              </span>
            )}
          </h2>
          <span className="text-xs font-mono text-text-muted">sorted by urgency</span>
        </div>

        {sortedActiveTasks.length === 0 ? (
          <div className="p-sys-lg bg-bg-secondary border border-border-muted rounded-sys-lg flex flex-col gap-sys-sm items-center justify-center min-h-[200px]">
            <CheckCircle2 size={32} className="text-accent-emerald/40" />
            <span className="font-mono text-sm text-text-muted mt-2">
              All clear — no active tasks
            </span>
            <span className="text-xs text-text-muted">Use the + button to create a task</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedActiveTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={completeTask}
                onDelete={deleteTask}
                onSnooze={snoozeTask}
                onStartFocus={handleStartFocus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Habits Summary (compact) */}
      {habits.length > 0 && (
        <div className="flex flex-col gap-sys-xs mt-sys-md">
          <h2 className="text-lg font-display font-semibold text-text-primary">
            Active Habits
            <span className="text-sm font-mono text-text-muted ml-2">({habits.length})</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {habits.slice(0, 6).map((habit) => (
              <div
                key={habit.id}
                className="flex items-center gap-2 p-3 bg-bg-secondary border border-border-muted rounded-sys-md"
              >
                <span className="text-lg">{habit.icon || '📌'}</span>
                <span className="text-sm text-text-primary truncate">{habit.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendation Widget */}
      {sortedActiveTasks.length > 0 && (
        <AIRecommendation tasks={tasks} onNavigateToTask={(id) => navigate(`/rescue/${id}`)} />
      )}
    </div>
  );
}
