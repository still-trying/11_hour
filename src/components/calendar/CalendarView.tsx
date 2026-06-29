'use client'

import { useState, useMemo } from 'react'
import type { Task } from '@/types'
import { getUrgencyInfo, getDefconColor } from '@/lib/utils/urgency'
import { cn } from '@/lib/utils/cn'
import { fireConfetti } from '@/lib/utils/confetti'
import { ChevronLeft, ChevronRight, CalendarDays, Clock, Zap } from 'lucide-react'
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
  const todayStr = new Date().toISOString().split('T')[0]

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

  // Stats for the month
  const monthStats = useMemo(() => {
    let totalTasks = 0
    let completedTasks = 0
    let urgentDays = 0
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = new Date(year, month, d).toISOString().split('T')[0]
      const dayTasks = tasksByDate[dateStr] || []
      totalTasks += dayTasks.length
      completedTasks += dayTasks.filter(t => t.status === 'completed').length
      if (dayTasks.some(t => t.defcon_level === 'meltdown' || t.defcon_level === 'critical')) {
        urgentDays++
      }
    }
    return { totalTasks, completedTasks, urgentDays }
  }, [tasksByDate, year, month, daysInMonth])

  const navigate = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1))
    setSelectedDate(null)
  }

  const goToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(todayStr)
  }

  // Get the most critical defcon level for a day
  const getDayIndicator = (dayTasks: Task[]) => {
    if (dayTasks.some(t => t.defcon_level === 'meltdown' && t.status !== 'completed')) return '#EF4444'
    if (dayTasks.some(t => t.defcon_level === 'critical' && t.status !== 'completed')) return '#F97316'
    if (dayTasks.some(t => t.defcon_level === 'urgent' && t.status !== 'completed')) return '#F59E0B'
    if (dayTasks.length > 0) return '#6C63FF'
    return null
  }

  const days = []
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(
      <div
        key={'empty-' + i}
        className="h-24 sm:h-28 rounded-lg"
        style={{ background: 'rgba(255,255,255,0.01)' }}
      />,
    )
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateStr = date.toISOString().split('T')[0]
    const dayTasks = tasksByDate[dateStr] || []
    const isToday = date.toDateString() === today
    const isSelected = selectedDate === dateStr
    const isPast = date < new Date(new Date().toDateString())
    const indicator = getDayIndicator(dayTasks)
    const activeTasks = dayTasks.filter(t => t.status !== 'completed')

    days.push(
      <button
        key={day}
        onClick={() => setSelectedDate(dateStr)}
        className={cn(
          'h-24 sm:h-28 p-2 rounded-lg border text-left transition-all duration-200 flex flex-col group relative overflow-hidden',
          'hover:border-[rgba(108,99,255,0.3)] hover:bg-[rgba(108,99,255,0.05)]',
          isToday && 'ring-2 ring-[#6C63FF]/50 border-[#6C63FF]/40 bg-[rgba(108,99,255,0.08)]',
          isSelected
            ? 'bg-[rgba(108,99,255,0.12)] border-[#6C63FF]/40 shadow-lg shadow-[#6C63FF]/10'
            : 'border-[rgba(255,255,255,0.08)]',
          isPast && !isToday && 'opacity-50',
        )}
        style={{ background: isSelected ? 'rgba(108,99,255,0.1)' : isToday ? 'rgba(108,99,255,0.06)' : 'rgba(255,255,255,0.02)' }}
      >
        {/* Day number */}
        <div className="flex items-center justify-between w-full mb-1">
          <span
            className={cn(
              'text-xs font-semibold',
              isToday
                ? 'text-[#6C63FF] bg-[#6C63FF]/20 w-6 h-6 rounded-full flex items-center justify-center'
                : 'text-[#CBD5E1]',
            )}
          >
            {day}
          </span>
          {activeTasks.length > 0 && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: (indicator || '#6C63FF') + '25',
                color: indicator || '#6C63FF',
              }}
            >
              {activeTasks.length}
            </span>
          )}
        </div>

        {/* Task indicators */}
        <div className="flex-1 space-y-0.5 overflow-hidden">
          {dayTasks.slice(0, 2).map((task) => (
            <div
              key={task.id}
              className={cn(
                'text-[9px] leading-tight px-1.5 py-0.5 rounded truncate font-medium',
                task.status === 'completed' && 'line-through opacity-50',
              )}
              style={{
                backgroundColor: getDefconColor(task.defcon_level) + '20',
                color: getDefconColor(task.defcon_level),
              }}
            >
              {task.title}
            </div>
          ))}
          {dayTasks.length > 2 && (
            <span className="text-[9px] text-[#94A3B8] pl-1 font-medium">
              +{dayTasks.length - 2} more
            </span>
          )}
        </div>

        {/* Bottom accent bar for days with tasks */}
        {indicator && (
          <div
            className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: indicator }}
          />
        )}
      </button>,
    )
  }

  return (
    <div className="space-y-5">
      {/* Month stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/15 flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-[#6C63FF]" />
          </div>
          <div>
            <p className="text-lg font-bold text-[#F8FAFC]">{monthStats.totalTasks}</p>
            <p className="text-[10px] text-[#94A3B8]">Tasks this month</p>
          </div>
        </div>
        <div className="glass-card p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 flex items-center justify-center">
            <Clock className="w-4 h-4 text-[#10B981]" />
          </div>
          <div>
            <p className="text-lg font-bold text-[#F8FAFC]">{monthStats.completedTasks}</p>
            <p className="text-[10px] text-[#94A3B8]">Completed</p>
          </div>
        </div>
        <div className="glass-card p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EF4444]/15 flex items-center justify-center">
            <Zap className="w-4 h-4 text-[#EF4444]" />
          </div>
          <div>
            <p className="text-lg font-bold text-[#F8FAFC]">{monthStats.urgentDays}</p>
            <p className="text-[10px] text-[#94A3B8]">Urgent days</p>
          </div>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5 transition-all border border-[rgba(255,255,255,0.06)]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-bold text-[#F8FAFC] min-w-[200px] text-center">
            {monthName}
          </h2>
          <button
            onClick={() => navigate(1)}
            className="p-2 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5 transition-all border border-[rgba(255,255,255,0.06)]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={goToday}
          className="flex items-center gap-1.5 px-4 py-2 text-xs text-[#6C63FF] bg-[#6C63FF]/10 rounded-lg hover:bg-[#6C63FF]/20 transition-all font-semibold border border-[#6C63FF]/20"
        >
          <CalendarDays className="w-3.5 h-3.5" />
          Today
        </button>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1.5">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-bold tracking-widest py-2 rounded-lg text-[#94A3B8]"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {days}
      </div>

      {/* Selected day panel */}
      {selectedDate && (
        <div className="glass-card p-5 animate-slideUp">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#F8FAFC]">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('default', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            <span className="text-xs text-[#94A3B8] bg-[rgba(255,255,255,0.05)] px-2 py-1 rounded-full">
              {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}
            </span>
          </div>
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
                    className="flex items-center gap-3 p-3 rounded-lg border transition-all hover:translate-x-1"
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
                        'w-5 h-5 rounded-full border-2 shrink-0 transition-all hover:scale-110',
                        task.status === 'completed'
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-[#64748B] hover:border-[#6C63FF]',
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm text-[#F8FAFC] truncate font-medium',
                          task.status === 'completed' && 'line-through opacity-50',
                        )}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-[10px] font-bold uppercase"
                          style={{ color: urgency.color }}
                        >
                          {urgency.label}
                        </span>
                        <span className="text-[10px] text-[#94A3B8]">
                          {urgency.timeLabel}
                        </span>
                      </div>
                    </div>
                    {task.estimated_minutes && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3 text-[#64748B]" />
                        <span className="text-[10px] text-[#94A3B8] font-medium">
                          {task.estimated_minutes}m
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[rgba(255,255,255,0.03)] flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-[#475569]" />
              </div>
              <p className="text-sm text-[#64748B]">No tasks scheduled</p>
              <p className="text-[10px] text-[#475569] mt-1">This day is free!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
