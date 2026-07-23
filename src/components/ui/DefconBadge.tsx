/**
 * DefconBadge — Visual urgency indicator component
 *
 * Displays a pulsing, color-coded badge that maps to DEFCON urgency levels.
 * Used across task cards, dashboard stats, and the emergency dashboard.
 */

import React from 'react';
import type { UrgencyLevel } from '@/lib/utils/urgency';

interface DefconBadgeProps {
  level: UrgencyLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showScore?: boolean;
  className?: string;
}

const DEFCON_CONFIG: Record<UrgencyLevel, { label: string; emoji: string; colorClass: string }> = {
  meltdown: { label: 'MELTDOWN', emoji: '🔴', colorClass: 'text-defcon-meltdown' },
  critical: { label: 'CRITICAL', emoji: '🟠', colorClass: 'text-defcon-critical' },
  elevated: { label: 'ELEVATED', emoji: '🟡', colorClass: 'text-defcon-elevated' },
  normal: { label: 'NORMAL', emoji: '🔵', colorClass: 'text-defcon-normal' },
  calm: { label: 'CALM', emoji: '🟢', colorClass: 'text-defcon-calm' },
};

const SIZE_CLASSES = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-1',
  md: 'text-xs px-2 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-2',
};

export function DefconBadge({
  level,
  score,
  size = 'md',
  showLabel = true,
  showScore = false,
  className = '',
}: DefconBadgeProps): React.JSX.Element {
  const config = DEFCON_CONFIG[level];
  const isUrgent = level === 'meltdown' || level === 'critical';

  return (
    <span
      className={`
        inline-flex items-center font-mono font-semibold rounded-full
        border border-current/20
        ${config.colorClass}
        ${isUrgent ? 'animate-pulse' : ''}
        ${SIZE_CLASSES[size]}
        ${className}
      `.trim()}
      style={{
        backgroundColor: `var(--sys-color-defcon-${level}-bg)`,
        borderColor: `var(--sys-color-defcon-${level})`,
      }}
    >
      <span>{config.emoji}</span>
      {showLabel && <span>{config.label}</span>}
      {showScore && score !== undefined && <span className="opacity-70">({score})</span>}
    </span>
  );
}

export default DefconBadge;
