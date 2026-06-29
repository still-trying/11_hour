'use client'

import { memo } from 'react'
import type { Habit } from '@/types'
import { cn } from '@/lib/utils/cn'

interface HabitRingProps {
  habit: Habit
  completed: boolean
  progress: number // 0-1
  onClick?: () => void
}

export const HabitRing = memo(function HabitRing({
  habit,
  completed,
  progress,
  onClick,
}: HabitRingProps) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const fillLength = circumference * progress
  const color = habit.color || '#6C63FF'

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 group cursor-pointer"
    >
      <div className="relative w-20 h-20">
        {/* SVG Ring */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          className="transform -rotate-90"
        >
          {/* Background ring */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="4"
          />

          {/* Progress ring */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${fillLength} ${circumference - fillLength}`}
            className={cn(
              'transition-all duration-700 ease-out',
              completed && 'drop-shadow-[0_0_8px_rgba(var(--ring-color),0.5)]',
            )}
            style={{
              // @ts-ignore
              '--ring-color': color,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              'text-lg font-bold transition-all duration-300',
              completed ? 'scale-110' : 'scale-100',
            )}
            style={{ color: completed ? color : '#475569' }}
          >
            {completed ? '✓' : habit.icon === 'zap' ? '⚡' : habit.icon}
          </span>
        </div>

        {/* Streak badge */}
        {habit.current_streak > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center">
            <span className="text-[8px] font-bold text-brand">
              {habit.current_streak}
            </span>
          </div>
        )}
      </div>

      <span
        className={cn(
          'text-xs text-center transition-colors duration-200 max-w-[80px] truncate',
          completed ? 'text-[#F8FAFC]' : 'text-[#475569]',
        )}
      >
        {habit.title}
      </span>
    </button>
  )
})
