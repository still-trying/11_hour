'use client'

import { memo, useCallback } from 'react'
import type { Task } from '@/types'
import { getUrgencyInfo } from '@/lib/utils/urgency'
import { cn } from '@/lib/utils/cn'
import { fireConfetti } from '@/lib/utils/confetti'
import { CheckCircle2, Clock, Trash2, ChevronDown, ChevronUp, Edit3 } from 'lucide-react'

interface TaskCardProps {
  task: Task
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  onEdit?: (task: Task) => void
  expanded?: boolean
  onToggleExpand?: (id: string) => void
}

export const TaskCard = memo(function TaskCard({
  task,
  onComplete,
  onDelete,
  onEdit,
  expanded,
  onToggleExpand,
}: TaskCardProps) {
  const urgency = getUrgencyInfo(
    task.deadline || null,
    task.importance,
    task.estimated_minutes,
    task.times_snoozed,
    task.status,
  )

  const steps = task.ai_generated_steps || []

  const handleComplete = useCallback(() => {
    if (task.status !== 'completed') {
      fireConfetti({ particleCount: 30, spread: 45 })
    }
    onComplete(task.id)
  }, [task.id, task.status, onComplete])

  return (
    <div
      className={cn(
        'group glass-card-hover p-4 transition-all duration-300',
        'animate-slideUp',
        urgency.shouldPulse && 'defcon-meltdown',
        task.status === 'completed' && 'opacity-50',
      )}
      style={{
        borderColor: urgency.borderColor,
        background: urgency.bgColor,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Status indicator */}
        <button
          onClick={handleComplete}
          className={cn(
            'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 shrink-0',
            task.status === 'completed'
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-[#475569] hover:border-brand',
          )}
        >
          {task.status === 'completed' && (
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ color: urgency.color, backgroundColor: urgency.bgColor }}
            >
              {urgency.label}
            </span>

            <span className="text-xs text-[#475569]">{urgency.timeLabel}</span>

            {task.category !== 'general' && (
              <span className="text-[10px] text-[#475569] bg-white/5 px-1.5 py-0.5 rounded">
                {task.category}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className={cn(
              'text-sm font-medium text-[#F8FAFC] mb-1',
              task.status === 'completed' && 'line-through',
            )}
          >
            {task.title}
          </h3>

          {/* Steps */}
          {steps.length > 0 && onToggleExpand && (
            <>
              <button
                onClick={() => onToggleExpand(task.id)}
                className="flex items-center gap-1 text-xs text-[#475569] hover:text-[#94A3B8] transition-colors mb-2"
              >
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {steps.length} step{steps.length > 1 ? 's' : ''}
              </button>

              {expanded && (
                <div className="space-y-1 mb-2 pl-2 border-l border-border">
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-[#94A3B8]">
                      <span className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        step.is_completed ? 'bg-emerald-500' : 'bg-[#475569]',
                      )} />
                      <span className={step.is_completed ? 'line-through' : ''}>
                        {step.title}
                      </span>
                      {step.estimated_minutes && (
                        <span className="text-[#475569]">({step.estimated_minutes}m)</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 text-[10px] text-[#475569]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {task.estimated_minutes}m
            </span>
            <span>Score: {urgency.score}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && task.status !== 'completed' && (
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg text-[#475569] hover:text-brand hover:bg-brand/10 transition-all"
              title="Edit task"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg text-[#475569] hover:text-defcon-meltdown hover:bg-defcon-meltdown/10 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
})
