'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { Play, Pause, RotateCcw, Clock } from 'lucide-react'

const supabase = createClient()

type TimerMode = 'pomodoro' | 'deep_work'

interface TimerConfig {
  label: string
  work: number
  break: number
}

const TIMERS: Record<TimerMode, TimerConfig> = {
  pomodoro: { label: 'Pomodoro', work: 25 * 60, break: 5 * 60 },
  deep_work: { label: 'Deep Work', work: 50 * 60, break: 10 * 60 },
}

export function FocusTimer() {
  const [mode, setMode] = useState<TimerMode>('pomodoro')
  const [phase, setPhase] = useState<'work' | 'break'>('work')
  const [timeLeft, setTimeLeft] = useState(TIMERS.pomodoro.work)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startTimeRef = useRef<number | null>(null)

  // Save completed session to Supabase
  const saveSession = useCallback(async (completedMode: TimerMode, completedPhase: 'work' | 'break', elapsedSeconds: number) => {
    if (completedPhase !== 'work') return // Only save work sessions
    try {
      await supabase.from('focus_sessions').insert({
        session_type: completedMode,
        duration_minutes: Math.round(elapsedSeconds / 60),
        target_duration: TIMERS[completedMode].work / 60,
        started_at: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
        ended_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Failed to save focus session:', err)
    }
  }, [])

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    startTimeRef.current = Date.now() - (TIMERS[mode].work - timeLeft) * 1000
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer()
          setIsRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    setIsRunning(true)
  }, [clearTimer, mode, timeLeft])

  const pauseTimer = useCallback(() => {
    clearTimer()
    setIsRunning(false)
  }, [clearTimer])

  const resetTimer = useCallback(() => {
    clearTimer()
    setIsRunning(false)
    setPhase('work')
    setTimeLeft(TIMERS[mode].work)
    startTimeRef.current = null
  }, [clearTimer, mode])

  const switchMode = useCallback(
    (newMode: TimerMode) => {
      clearTimer()
      setIsRunning(false)
      setMode(newMode)
      setPhase('work')
      setTimeLeft(TIMERS[newMode].work)
    },
    [clearTimer],
  )

  // Save session when timer completes
  useEffect(() => {
    if (!isRunning && timeLeft === 0 && phase === 'work') {
      saveSession(mode, phase, TIMERS[mode].work)
    }
  }, [isRunning, timeLeft, phase, mode, saveSession])

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const totalTime = TIMERS[mode][phase === 'work' ? 'work' : 'break']
  const progress = 1 - timeLeft / totalTime

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-medium text-[#94A3B8]">Focus Timer</h3>
        <Clock className="w-4 h-4 text-[#475569]" />
      </div>

      {/* Mode selector */}
      <div className="flex gap-1 mb-4 bg-[#131320] rounded-lg p-0.5">
        {(Object.entries(TIMERS) as [TimerMode, TimerConfig][]).map(
          ([key, config]) => (
            <button
              key={key}
              onClick={() => switchMode(key)}
              className={cn(
                'flex-1 px-2 py-1 text-xs rounded-md transition-all',
                mode === key
                  ? 'bg-brand/20 text-brand'
                  : 'text-[#475569] hover:text-[#94A3B8]',
              )}
            >
              {config.label}
            </button>
          ),
        )}
      </div>

      {/* Timer display */}
      <div className="relative flex items-center justify-center py-4">
        {/* Progress ring */}
        <svg className="absolute w-32 h-32 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="4"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#6C63FF"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={2 * Math.PI * 42 * (1 - progress)}
            className="transition-all duration-1000"
          />
        </svg>

        <div className="text-center">
          <span className="text-3xl font-bold tabular-nums text-[#F8FAFC]">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <p className="text-[10px] text-[#475569] mt-1 uppercase">
            {phase}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={isRunning ? pauseTimer : startTimer}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all',
            isRunning
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
              : 'bg-brand/20 text-brand hover:bg-brand/30',
          )}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" /> Pause
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" /> Start
            </>
          )}
        </button>

        <button
          onClick={resetTimer}
          className="p-2 rounded-lg text-[#475569] hover:text-[#94A3B8] hover:bg-white/5 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
