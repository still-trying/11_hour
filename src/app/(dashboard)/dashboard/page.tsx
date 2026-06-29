'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store/useAppStore'
import { UrgencyMeter } from '@/components/dashboard/UrgencyMeter'
import { QuickCapture } from '@/components/tasks/QuickCapture'
import { TaskList } from '@/components/tasks/TaskList'
import { HabitRing } from '@/components/habits/HabitRing'
import { FocusTimer } from '@/components/dashboard/FocusTimer'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { useTasks } from '@/lib/hooks/useTasks'
import { useHabits } from '@/lib/hooks/useHabits'
import { calculateUrgencyScore, getDefconFromScore } from '@/lib/utils/urgency'

export default function DashboardPage() {
  const { tasks } = useAppStore()
  const { fetchTasks, updateTask } = useTasks()
  const { habits, toggleHabit, isCompletedToday } = useHabits()

  const activeTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'cancelled',
  )

  // 60-second urgency recalculation tick
  useEffect(() => {
    const recalculateUrgency = async () => {
      const currentTasks = useAppStore.getState().tasks
      const urgentTasks = currentTasks.filter(
        (t) =>
          t.status !== 'completed' &&
          t.status !== 'cancelled' &&
          t.deadline,
      )

      for (const task of urgentTasks) {
        const newScore = calculateUrgencyScore(
          task.deadline!,
          task.importance,
          task.estimated_minutes,
          task.times_snoozed,
        )

        if (Math.abs(newScore - task.urgency_score) > 1) {
          const newDefcon = getDefconFromScore(newScore)
          await updateTask(task.id, {
            urgency_score: newScore,
            defcon_level: newDefcon,
          })
        }
      }
    }

    // Run immediately, then every 60 seconds
    recalculateUrgency()
    const interval = setInterval(recalculateUrgency, 60_000)
    return () => clearInterval(interval)
  }, [updateTask])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#F8FAFC]">Dashboard</h1>
          <p className="text-sm text-[#475569] mt-0.5">
            {activeTasks.length > 0
              ? `${activeTasks.length} active task${activeTasks.length !== 1 ? 's' : ''}`
              : 'No active tasks — you\'re all clear!'}
          </p>
        </div>
        <NotificationBell />
      </div>

      {/* Quick Capture */}
      <QuickCapture />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Urgency + Habits */}
        <div className="space-y-6">
          <UrgencyMeter />

          {/* Habit Rings */}
          {habits.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-xs font-medium text-[#94A3B8] mb-3">
                Today&apos;s Habits
              </h3>
              <div className="flex flex-wrap gap-4 justify-center">
                {habits.map((habit) => (
                  <HabitRing
                    key={habit.id}
                    habit={habit}
                    completed={isCompletedToday(habit.id)}
                    progress={
                      isCompletedToday(habit.id) ? 1 : habit.total_completions > 0 ? 0.3 : 0
                    }
                    onClick={() => toggleHabit(habit.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center/Right: Tasks & Focus */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top tasks (highest urgency) */}
          <div className="glass-card p-5">
            <h3 className="text-xs font-medium text-[#94A3B8] mb-3">
              Top Priority
            </h3>
            {activeTasks.length > 0 ? (
              <TaskList tasks={activeTasks.slice(0, 5)} />
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-[#475569]">
                  No tasks yet. Use the input above to create one!
                </p>
              </div>
            )}
          </div>

          {/* Focus Timer + Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FocusTimer />

            {/* Stats panel */}
            <div className="glass-card p-5">
              <h3 className="text-xs font-medium text-[#94A3B8] mb-3">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: 'Total Tasks',
                    value: tasks.length,
                    color: '#6C63FF',
                  },
                  {
                    label: 'Completed',
                    value: tasks.filter((t) => t.status === 'completed').length,
                    color: '#10B981',
                  },
                  {
                    label: 'Overdue',
                    value: tasks.filter((t) => t.status === 'overdue').length,
                    color: '#EF4444',
                  },
                  {
                    label: 'Habits Today',
                    value: habits.filter((h) => isCompletedToday(h.id)).length,
                    color: '#22D3EE',
                  },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <span
                      className="text-2xl font-bold"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </span>
                    <p className="text-[10px] text-[#475569] mt-0.5">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
