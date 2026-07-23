/**
 * EmergencyDashboard — Red-alert critical tasks view
 *
 * Dedicated page showing ONLY meltdown, critical, and overdue tasks
 * with countdown timers, pulsing urgency indicators, and one-tap actions.
 * This is the headline feature for "The Last Minute Life Saver" theme.
 */

import React, { useMemo, useEffect, useState } from 'react';
import { Flame, AlertTriangle, Clock, Siren, ChevronLeft, RefreshCw } from 'lucide-react';
import { useTasksQuery } from '@/lib/hooks/useTasksQuery';
import { TaskCard } from '@/components/ui/TaskCard';
import { DefconBadge } from '@/components/ui/DefconBadge';
import { useNavigate } from 'react-router-dom';
import { differenceInSeconds, isPast } from 'date-fns';
import { soundEngine } from '@/lib/utils/sounds';
import type { UrgencyLevel } from '@/lib/utils/urgency';

const LiveCountdown = React.memo(function LiveCountdown({ deadline }: { deadline: string }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Memoize time display so we only recalculate when `now` or `deadline` changes
  const display = React.useMemo(() => {
    const deadlineDate = new Date(deadline);
    const isOverdue = isPast(deadlineDate);
    const totalSeconds = Math.abs(differenceInSeconds(deadlineDate, now));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');

    return {
      isOverdue,
      formatted: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
    };
  }, [deadline, now]);

  return (
    <div
      className={`font-mono text-3xl font-bold tracking-wider ${display.isOverdue ? 'text-defcon-meltdown' : 'text-text-primary'}`}
    >
      {display.isOverdue && <span className="text-sm mr-2">OVERDUE</span>}
      <span
        style={{
          animation: display.isOverdue ? 'countdown-pulse 1s ease-in-out infinite' : undefined,
        }}
      >
        {display.formatted}
      </span>
    </div>
  );
});

export default function EmergencyDashboard(): React.JSX.Element {
  const navigate = useNavigate();
  const { tasks, isLoading, completeTask, deleteTask, snoozeTask } = useTasksQuery();
  const hasSoundedAlert = React.useRef<string | null>(null);

  // Filter to emergency-level tasks only
  const emergencyTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (t.status === 'completed' || t.status === 'cancelled') return false;
        const level = t.defcon_level;
        const isOverdue = t.deadline && isPast(new Date(t.deadline));
        return level === 'meltdown' || level === 'critical' || isOverdue;
      })
      .sort((a, b) => (b.urgency_score ?? 0) - (a.urgency_score ?? 0));
  }, [tasks]);

  // Play alert sounds when emergency tasks have meltdown or critical levels
  // Uses a ref to avoid replaying the same alert on re-renders
  useEffect(() => {
    if (emergencyTasks.length > 0 && !isLoading) {
      const highestDefcon = emergencyTasks.some((t) => t.defcon_level === 'meltdown')
        ? 'meltdown'
        : 'critical';

      if (highestDefcon !== hasSoundedAlert.current) {
        hasSoundedAlert.current = highestDefcon;
        if (highestDefcon === 'meltdown') {
          soundEngine.playMeltdownAlert();
        } else {
          soundEngine.playCriticalAlert();
        }
      }
    }
  }, [emergencyTasks, isLoading]);

  const meltdownCount = emergencyTasks.filter((t) => t.defcon_level === 'meltdown').length;
  const criticalCount = emergencyTasks.filter((t) => t.defcon_level === 'critical').length;
  const overdueCount = emergencyTasks.filter(
    (t) => t.deadline && isPast(new Date(t.deadline)),
  ).length;

  // Find the most urgent task (first in sorted list)
  const primaryTask = emergencyTasks[0] || null;

  const handleStartFocus = (id: string) => {
    soundEngine.playClick();
    navigate(`/rescue/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-sys-lg p-sys-md animate-pulse">
        <div className="h-32 bg-bg-secondary rounded-sys-lg" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-bg-secondary rounded-sys-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-sys-lg p-sys-md">
      {/* Back navigation */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-text-primary transition-colors w-fit"
      >
        <ChevronLeft size={14} />
        Back to Dashboard
      </button>

      {/* Emergency Header */}
      <div
        className={`
          p-6 rounded-sys-lg border-2
          ${emergencyTasks.length > 0 ? 'defcon-meltdown' : 'border-accent-emerald bg-accent-emerald/5'}
        `}
      >
        <div className="flex items-center gap-3 mb-3">
          {emergencyTasks.length > 0 ? (
            <Siren size={24} className="text-defcon-meltdown animate-pulse" />
          ) : (
            <RefreshCw size={24} className="text-accent-emerald" />
          )}
          <h1 className="font-display text-xxl sm:text-xxxl font-bold tracking-tight text-text-primary">
            {emergencyTasks.length > 0 ? 'EMERGENCY DASHBOARD' : 'ALL CLEAR'}
          </h1>
        </div>

        {emergencyTasks.length > 0 ? (
          <div className="flex flex-wrap gap-4 mt-3">
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-defcon-meltdown" />
              <span className="text-sm font-mono text-text-primary">
                {meltdownCount} Meltdown{meltdownCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-defcon-critical" />
              <span className="text-sm font-mono text-text-primary">{criticalCount} Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-defcon-elevated" />
              <span className="text-sm font-mono text-text-primary">{overdueCount} Overdue</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            No meltdown or critical tasks. You're in the clear! 🎉
          </p>
        )}
      </div>

      {/* Primary Task Spotlight (the most urgent task gets a big countdown) */}
      {primaryTask && primaryTask.deadline && (
        <div className="p-6 bg-bg-secondary border-2 border-defcon-meltdown/30 rounded-sys-lg flex flex-col items-center gap-4">
          <span className="text-xs font-mono text-text-muted uppercase tracking-widest">
            MOST URGENT — TACKLE THIS FIRST
          </span>
          <h2 className="text-xl font-display font-bold text-text-primary text-center">
            {primaryTask.title}
          </h2>
          <LiveCountdown deadline={primaryTask.deadline} />
          <div className="flex items-center gap-3">
            <DefconBadge
              level={(primaryTask.defcon_level || 'meltdown') as UrgencyLevel}
              score={primaryTask.urgency_score}
              showScore
            />
          </div>
          <button
            onClick={() => handleStartFocus(primaryTask.id)}
            className="
              mt-2 px-6 py-3 bg-accent-amber text-black font-mono font-bold text-sm
              rounded-sys-md hover:bg-accent-amber/90 transition-all
              hover:shadow-lg hover:shadow-accent-amber/20
            "
          >
            ⚡ START NOW
          </button>
        </div>
      )}

      {/* Emergency Task List */}
      {emergencyTasks.length > 0 && (
        <div className="flex flex-col gap-sys-xs">
          <h2 className="text-lg font-display font-semibold text-text-primary flex items-center gap-2">
            <AlertTriangle size={16} className="text-defcon-critical" />
            All Emergency Tasks
            <span className="text-sm font-mono text-text-muted">({emergencyTasks.length})</span>
          </h2>
          <div className="flex flex-col gap-3">
            {emergencyTasks.map((task) => (
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
        </div>
      )}
    </div>
  );
}
