'use client'

import { useState, useMemo } from 'react'
import type { Task } from '@/types'
import { getUrgencyInfo, getDefconColor } from '@/lib/utils/urgency'
import { cn } from '@/lib/utils/cn'
import { fireConfetti } from '@/lib/utils/confetti'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { useTasks } from '@/lib/hooks/useTasks'

export function CalendarView() {
  const { tasks, completeTask } = useTasks()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const today = new Date().toDateString()

  // Group tasks by deadline date
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {}
    for (const task of tasks) {
      if (!task.deadline) continue
      const dateKey = new Date(task.deadline).toISOString().split('T')[0]
      if (!map[dateKey]) map[dateKey] = []
      map[dateKey].push(task)
    }
    return map
  }, [tasks])

  const selectedTasks = selectedDate ? tasksByDate[selectedDate] || [] : []

  const navigate = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1))
    setSelectedDate(null)
  }

  const goToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date().toISOString().split('T')[0])
  }

  const days = []
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(<div key={'empty-' + i} className="h-24 sm:h-28" />)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateStr = date.toISOString().split('T')[0]
    const dayTasks = tasksByDate[dateStr] || []
    const isToday = date.toDateString() === today
    const isSelected = selectedDate === dateStr
    const isPast = date < new Date(new Date().toDateString())

    days.push(
      <button
        key={day}
        onClick={() => setSelectedDate(dateStr)}
        className={cn(
          'h-24 sm:h-28 p-1.5 rounded-lg border text-left transition-all duration-200 flex flex-col',
          'hover:bg-white/5',
          isToday && 'ring-2 ring-brand/40 border-brand/30',
          isSelected ? 'bg-brand/10 border-brand/30' : 'border-border',
          isPast && !isToday && 'opacity-40',
        )}
      >
        <span className={cn(
          'text-xs font-medium mb-1',
          isToday ? 'text-brand' : 'text-[#475569]',
        )}>
          {day}
        </span>
        <div className="flex-1 space-y-0.5 overflow-hidden">
          {dayTasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              className="text-[9px] leading-tight px-1 py-0.5 rounded truncate font-medium"
              style={{
                backgroundColor: getDefconColor(task.defcon_level) + '20',
                color: getDefconColor(task.defcon_level),
              }}
            >
              {task.title}
            </div>
          ))}
          {dayTasks.length > 3 && (
            <span className="text-[9px] text-[#475569] pl-1">
              +{dayTasks.length - 3} more
            </span>
          )}
        </div>
      </button>,
    )
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg text-[#475569] hover:text-[#F8FAFC] hover:bg-white/5 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-[#F8FAFC] min-w-[200px] text-center">
            {monthName}
          </h2>
          <button
            onClick={() => navigate(1)}
            className="p-1.5 rounded-lg text-[#475569] hover:text-[#F8FAFC] hover:bg-white/5 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={goToday}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-brand bg-brand/10 rounded-lg hover:bg-brand/20 transition-all font-medium"
        >
          <CalendarDays className="w-3.5 h-3.5" />
          Today
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-[#475569] uppercase tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>

      {/* Selected day tasks */}
      {selectedDate && (
        <div className="glass-card p-5 animate-slideUp">
          <h3 className="text-xs font-medium text-[#94A3B8] mb-3">
            Tasks for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          {selectedTasks.length > 0 ? (
            <div className="space-y-2">
              {selectedTasks.map((task) => {
                const urgency = getUrgencyInfo(
                  task.deadline || null,
                  task.importance,
                  task.estimated_minutes,
                  task.times_snoozed,
                  task.status,
                )
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg border transition-all"
                    style={{
                      borderColor: urgency.borderColor,
                      backgroundColor: urgency.bgColor,
                    }}
                  >
                    <button
                      onClick={() => {
                        if (task.status !== 'completed') {
                          fireConfetti({ particleCount: 20, spread: 35 })
                        }
                        completeTask(task.id)
                      }}
                      className={cn(
                        'w-4 h-4 rounded-full border-2 shrink-0 transition-all',
                        task.status === 'completed'
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-[#475569] hover:border-brand',
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm text-[#F8FAFC] truncate',
                        task.status === 'completed' && 'line-through opacity-50',
                      )}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-[10px] font-semibold uppercase"
                          style={{ color: urgency.color }}
                        >
                          {urgency.label}
                        </span>
                        <span className="text-[10px] text-[#475569]">
                          {urgency.timeLabel}
                        </span>
                      </div>
                    </div>
                    {task.estimated_minutes && (
                      <span className="text-[10px] text-[#475569] shrink-0">
                        {task.estimated_minutes}m
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-[#475569] text-center py-4">
              No tasks scheduled for this day
            </p>
          )}
        </div>
      )}
    </div>
  )
}
