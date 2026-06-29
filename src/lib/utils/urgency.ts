// ============================================================
// 11_HOUR - Urgency Engine
// THE HEART OF THE APPLICATION
// ============================================================

import type { DefconLevel, UrgencyInfo } from '@/types'

const STYLES: Record<DefconLevel, Omit<UrgencyInfo, 'score' | 'defconLevel' | 'hoursRemaining' | 'timeLabel'>> = {
  calm: {
    label: 'CALM',
    color: '#22D3EE',
    bgColor: 'rgba(34,211,238,0.08)',
    borderColor: 'rgba(34,211,238,0.25)',
    shouldPulse: false,
  },
  focused: {
    label: 'FOCUSED',
    color: '#10B981',
    bgColor: 'rgba(16,185,129,0.08)',
    borderColor: 'rgba(16,185,129,0.25)',
    shouldPulse: false,
  },
  urgent: {
    label: 'URGENT',
    color: '#F59E0B',
    bgColor: 'rgba(245,158,11,0.08)',
    borderColor: 'rgba(245,158,11,0.25)',
    shouldPulse: false,
  },
  critical: {
    label: 'CRITICAL',
    color: '#F97316',
    bgColor: 'rgba(249,115,22,0.1)',
    borderColor: 'rgba(249,115,22,0.4)',
    shouldPulse: true,
  },
  meltdown: {
    label: 'MELTDOWN',
    color: '#EF4444',
    bgColor: 'rgba(239,68,68,0.12)',
    borderColor: 'rgba(239,68,68,0.5)',
    shouldPulse: true,
  },
}

function getDefconFromScore(score: number): DefconLevel {
  if (score <= 20) return 'calm'
  if (score <= 40) return 'focused'
  if (score <= 60) return 'urgent'
  if (score <= 80) return 'critical'
  return 'meltdown'
}

export function calculateUrgencyScore(
  deadline: string | null,
  importance: number,
  estimatedMinutes: number,
  timesSnoozed: number = 0,
): number {
  if (!deadline) return 25

  const msRemaining = new Date(deadline).getTime() - Date.now()
  if (msRemaining <= 0) return 100

  const hoursRemaining = msRemaining / (1000 * 60 * 60)

  // Exponential curve - calm for days, spikes in last hours
  const deadlineFactor = (() => {
    if (hoursRemaining <= 0.5) return 1.0
    if (hoursRemaining <= 1) return 0.97
    if (hoursRemaining <= 2) return 0.93
    if (hoursRemaining <= 3) return 0.88
    if (hoursRemaining <= 6) return 0.80
    if (hoursRemaining <= 12) return 0.68
    if (hoursRemaining <= 24) return 0.52
    if (hoursRemaining <= 48) return 0.38
    if (hoursRemaining <= 72) return 0.26
    if (hoursRemaining <= 120) return 0.18
    if (hoursRemaining <= 168) return 0.12
    return 0.06
  })()

  const importanceFactor = (importance || 3) / 5
  const effortFactor = Math.min((estimatedMinutes || 30) / 480, 1) * 0.1
  const snoozePenalty = Math.min(timesSnoozed * 0.07, 0.25)

  const raw = (deadlineFactor * 0.58 + importanceFactor * 0.32 + effortFactor + snoozePenalty) * 100
  return Math.min(Math.round(raw * 10) / 10, 100)
}

export function getUrgencyInfo(
  deadline: string | null,
  importance: number,
  estimatedMinutes: number,
  timesSnoozed: number = 0,
  status: string = 'pending',
): UrgencyInfo {
  if (status === 'completed') {
    return {
      score: 0,
      defconLevel: 'calm',
      hoursRemaining: null,
      timeLabel: 'Completed',
      ...STYLES.calm,
    }
  }

  const score = calculateUrgencyScore(deadline, importance, estimatedMinutes, timesSnoozed)
  const defconLevel = getDefconFromScore(score)
  const hoursRemaining = deadline
    ? (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60)
    : null

  return {
    score,
    defconLevel,
    hoursRemaining,
    timeLabel: formatTimeLabel(hoursRemaining),
    ...STYLES[defconLevel],
  }
}

export function formatTimeLabel(h: number | null): string {
  if (h === null) return 'No deadline'
  if (h < 0) {
    const abs = Math.abs(h)
    if (abs < 1) return `${Math.round(abs * 60)}m overdue`
    if (abs < 24) return `${Math.round(abs)}h overdue`
    return `${Math.floor(abs / 24)}d overdue`
  }
  if (h < 1) return `${Math.round(h * 60)}m left`
  if (h < 24) return `${Math.floor(h)}h left`
  return `${Math.floor(h / 24)}d ${Math.round(h % 24)}h left`
}

export function getDefconColor(defcon: DefconLevel): string {
  return STYLES[defcon].color
}

export function getDefconBgColor(defcon: DefconLevel): string {
  return STYLES[defcon].bgColor
}

export function getDefconBorderColor(defcon: DefconLevel): string {
  return STYLES[defcon].borderColor
}
