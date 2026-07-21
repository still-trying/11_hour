/**
 * Urgency Calculation Utility
 *
 * Computes a composite urgency score based on deadline proximity,
 * task importance, estimated effort, and snooze count.
 */

export type UrgencyLevel = 'calm' | 'normal' | 'elevated' | 'critical' | 'meltdown';

export interface UrgencyResult {
  score: number;
  level: UrgencyLevel;
}

/**
 * Calculates an urgency score (0–100) and maps it to a DEFCON-style level.
 *
 * @param deadline     - When the task is due
 * @param importance   - User-assigned importance (1–5)
 * @param estimatedMin - Estimated minutes to complete
 * @param timesSnoozed - How many times the task has been snoozed
 */
export function calculateUrgency(
  deadline: Date,
  importance: number,
  estimatedMin: number,
  timesSnoozed: number
): UrgencyResult {
  const now = new Date();
  const hoursRemaining = Math.max(0, (deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
  const hoursNeeded = estimatedMin / 60;

  // Time pressure: how tight is the remaining window vs. effort required
  let timePressure: number;
  if (hoursRemaining <= 0) {
    timePressure = 100; // overdue
  } else if (hoursRemaining < hoursNeeded) {
    timePressure = 90; // not enough time left
  } else {
    // Scale 0–80 based on ratio of effort to remaining time
    timePressure = Math.min(80, (hoursNeeded / hoursRemaining) * 80);
  }

  // Importance weight (1–5 scaled to 0–20)
  const importanceWeight = (importance / 5) * 20;

  // Snooze penalty (each snooze adds pressure)
  const snoozePenalty = Math.min(15, timesSnoozed * 5);

  const score = Math.min(100, Math.round(timePressure + importanceWeight + snoozePenalty));

  const level: UrgencyLevel =
    score >= 90
      ? 'meltdown'
      : score >= 70
        ? 'critical'
        : score >= 50
          ? 'elevated'
          : score >= 25
            ? 'normal'
            : 'calm';

  return { score, level };
}
