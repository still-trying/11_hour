/**
 * TaskCard — Urgency-aware task card component
 *
 * Displays a task with color-coded border based on DEFCON level,
 * countdown timer to deadline, and quick-action buttons.
 */

import React, { useMemo } from 'react';
import { Clock, Play, Trash2, Pause, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow, isPast, differenceInMinutes, differenceInHours } from 'date-fns';
import { DefconBadge } from './DefconBadge';
import { soundEngine } from '@/lib/utils/sounds';
import type { Task } from '@/types';
import type { UrgencyLevel } from '@/lib/utils/urgency';

interface TaskCardProps {
  task: Task;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSnooze?: (id: string) => void;
  onStartFocus?: (id: string) => void;
  compact?: boolean;
}

function getDefconClass(level?: string): string {
  switch (level) {
    case 'meltdown':
      return 'defcon-meltdown';
    case 'critical':
      return 'defcon-critical';
    case 'elevated':
      return 'defcon-elevated';
    case 'normal':
      return 'defcon-normal';
    case 'calm':
      return 'defcon-calm';
    default:
      return 'defcon-calm';
  }
}

function formatCountdown(deadline: string): { text: string; isOverdue: boolean } {
  const deadlineDate = new Date(deadline);
  const now = new Date();

  if (isPast(deadlineDate)) {
    const minAgo = differenceInMinutes(now, deadlineDate);
    if (minAgo < 60) return { text: `${minAgo}m overdue`, isOverdue: true };
    const hrsAgo = differenceInHours(now, deadlineDate);
    return { text: `${hrsAgo}h overdue`, isOverdue: true };
  }

  return {
    text: formatDistanceToNow(deadlineDate, { addSuffix: false }) + ' left',
    isOverdue: false,
  };
}

export function TaskCard({
  task,
  onComplete,
  onDelete,
  onSnooze,
  onStartFocus,
  compact = false,
}: TaskCardProps): React.JSX.Element {
  const defconClass = getDefconClass(task.defcon_level);
  const level = (task.defcon_level || 'calm') as UrgencyLevel;
  const isCompleted = task.status === 'completed';

  const countdown = useMemo(() => {
    if (!task.deadline) return null;
    return formatCountdown(task.deadline);
  }, [task.deadline]);

  if (compact) {
    return (
      <div
        className={`
          flex items-center gap-3 p-3 rounded-sys-md border-2 transition-all duration-200
          hover:shadow-md cursor-pointer
          ${isCompleted ? 'opacity-50 border-border-muted bg-bg-secondary' : defconClass}
        `}
      >
        <DefconBadge level={level} size="sm" showLabel={false} />
        <span
          className={`flex-1 text-sm font-medium ${isCompleted ? 'line-through text-text-muted' : 'text-text-primary'}`}
        >
          {task.title}
        </span>
        {countdown && (
          <span
            className={`text-xs font-mono ${countdown.isOverdue ? 'text-defcon-meltdown' : 'text-text-muted'}`}
          >
            {countdown.text}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`
        p-4 rounded-sys-lg border-2 transition-all duration-300
        hover:shadow-lg
        ${isCompleted ? 'opacity-50 border-border-muted bg-bg-secondary' : defconClass}
      `}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3
            className={`text-base font-semibold truncate ${isCompleted ? 'line-through text-text-muted' : 'text-text-primary'}`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-text-muted mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        <DefconBadge level={level} score={task.urgency_score} size="sm" showScore />
      </div>

      {/* Meta Row */}
      <div className="flex items-center gap-4 text-xs text-text-muted font-mono mt-3">
        {countdown && (
          <div
            className={`flex items-center gap-1 ${countdown.isOverdue ? 'text-defcon-meltdown font-semibold' : ''}`}
          >
            <Clock size={12} />
            <span>{countdown.text}</span>
          </div>
        )}
        {task.category && (
          <span className="px-1.5 py-0.5 bg-bg-primary rounded-sys-sm text-text-muted">
            {task.category}
          </span>
        )}
        {task.estimated_minutes && <span>{task.estimated_minutes}min est.</span>}
        {(task.times_snoozed ?? 0) > 0 && (
          <span className="text-defcon-elevated">snoozed ×{task.times_snoozed}</span>
        )}
      </div>

      {/* Actions Row */}
      {!isCompleted && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-muted/50">
          {onStartFocus && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onStartFocus(task.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold
                         bg-accent-amber/20 text-accent-amber rounded-sys-md
                         hover:bg-accent-amber/30 transition-colors"
            >
              <Play size={12} />
              Focus
            </button>
          )}
          {onComplete && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onComplete(task.id);
              }}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-mono
                         text-accent-emerald hover:bg-accent-emerald/10 rounded-sys-md transition-colors"
            >
              <CheckCircle2 size={12} />
              Done
            </button>
          )}
          {onSnooze && (
            <button
              onClick={() => {
                soundEngine.playSwoosh();
                onSnooze(task.id);
              }}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-mono
                         text-text-muted hover:bg-bg-primary rounded-sys-md transition-colors"
            >
              <Pause size={12} />
              Snooze
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                soundEngine.playSwoosh();
                onDelete(task.id);
              }}
              className="ml-auto flex items-center gap-1 px-2 py-1.5 text-xs font-mono
                         text-defcon-meltdown/60 hover:text-defcon-meltdown hover:bg-defcon-meltdown-bg
                         rounded-sys-md transition-colors"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default TaskCard;
