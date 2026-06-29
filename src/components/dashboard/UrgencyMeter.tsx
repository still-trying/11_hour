'use client'

import { useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store/useAppStore'
import { cn } from '@/lib/utils/cn'

export function UrgencyMeter() {
  const { tasks } = useAppStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Calculate average urgency
  const activeTasks = tasks.filter((t) => t.status !== 'completed')
  const avgUrgency =
    activeTasks.length > 0
      ? Math.round(
          activeTasks.reduce((sum, t) => sum + t.urgency_score, 0) /
            activeTasks.length,
        )
      : 0

  // Colors for different levels
  const getColor = (score: number) => {
    if (score <= 20) return '#22D3EE'
    if (score <= 40) return '#10B981'
    if (score <= 60) return '#F59E0B'
    if (score <= 80) return '#F97316'
    return '#EF4444'
  }

  // Draw the gauge
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth * dpr
    const h = canvas.clientHeight * dpr
    canvas.width = w
    canvas.height = h
    ctx.scale(dpr, dpr)

    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const cx = width / 2
    const cy = height - 20
    const radius = Math.min(width, height * 2) / 2 - 10

    // Background arc
    ctx.beginPath()
    ctx.arc(cx, cy, radius, Math.PI, 0)
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 12
    ctx.lineCap = 'round'
    ctx.stroke()

    // Score arc
    const score = Math.min(avgUrgency, 100)
    const endAngle = Math.PI + (score / 100) * Math.PI

    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    gradient.addColorStop(0, '#22D3EE') // calm
    gradient.addColorStop(0.2, '#10B981') // focused
    gradient.addColorStop(0.4, '#F59E0B') // urgent
    gradient.addColorStop(0.6, '#F97316') // critical
    gradient.addColorStop(1, '#EF4444') // meltdown

    ctx.beginPath()
    ctx.arc(cx, cy, radius, Math.PI, endAngle)
    ctx.strokeStyle = gradient
    ctx.lineWidth = 12
    ctx.lineCap = 'round'
    ctx.stroke()

    // Glow effect
    ctx.beginPath()
    ctx.arc(cx, cy, radius, Math.PI, endAngle)
    ctx.strokeStyle = getColor(score)
    ctx.lineWidth = 20
    ctx.globalAlpha = 0.15
    ctx.stroke()
    ctx.globalAlpha = 1
  }, [avgUrgency])

  const color = getColor(avgUrgency)

  return (
    <div className="glass-card p-5">
      <h3 className="text-xs font-medium text-[#94A3B8] mb-3">Urgency Level</h3>

      <div className="relative flex flex-col items-center">
        <canvas
          ref={canvasRef}
          className="w-full h-28"
          style={{ maxWidth: 200 }}
        />

        <div className="absolute top-8 flex flex-col items-center">
          <span
            className="text-3xl font-bold tabular-nums transition-colors duration-500"
            style={{ color }}
          >
            {avgUrgency}
          </span>
          <span className="text-[10px] text-[#475569]">avg urgency</span>
        </div>
      </div>

      {/* DEFCON Legend */}
      <div className="grid grid-cols-5 gap-1 mt-3">
        {[
          { label: 'CALM', color: '#22D3EE', min: 0, max: 20 },
          { label: 'FOCUSED', color: '#10B981', min: 21, max: 40 },
          { label: 'URGENT', color: '#F59E0B', min: 41, max: 60 },
          { label: 'CRITICAL', color: '#F97316', min: 61, max: 80 },
          { label: 'MELTDOWN', color: '#EF4444', min: 81, max: 100 },
        ].map((level) => (
          <div key={level.label} className="text-center">
            <div
              className={cn(
                'h-0.5 rounded-full transition-all duration-300',
                avgUrgency >= level.min && avgUrgency <= level.max
                  ? 'opacity-100'
                  : 'opacity-20',
              )}
              style={{ backgroundColor: level.color }}
            />
            <span className="text-[8px] text-[#475569] mt-1 block">
              {level.label}
            </span>
          </div>
        ))}
      </div>

      {/* Task breakdown */}
      <div className="mt-3 space-y-1">
        {(['meltdown', 'critical', 'urgent', 'focused', 'calm'] as const).map(
          (level) => {
            const count = tasks.filter(
              (t) => t.defcon_level === level && t.status !== 'completed',
            ).length
            if (count === 0) return null

            const colors: Record<string, string> = {
              meltdown: '#EF4444',
              critical: '#F97316',
              urgent: '#F59E0B',
              focused: '#10B981',
              calm: '#22D3EE',
            }

            return (
              <div
                key={level}
                className="flex items-center justify-between text-[10px]"
              >
                <span className="text-[#475569] uppercase">{level}</span>
                <span className="font-medium" style={{ color: colors[level] }}>
                  {count}
                </span>
              </div>
            )
          },
        )}
      </div>
    </div>
  )
}
