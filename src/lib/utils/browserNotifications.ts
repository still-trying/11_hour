/**
 * browserNotifications — Browser Notification Service
 *
 * Wraps the Browser Notification API to send push-style notifications
 * for urgent tasks, deadline reminders, and task completions.
 *
 * All methods are safe to call even if:
 * - The browser doesn't support notifications
 * - The user hasn't granted permission
 * - Notifications are disabled in settings
 */

import { soundEngine } from './sounds';

export interface BrowserNotificationOptions {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
  onClick?: () => void;
}

// ─── Permission ──────────────────────────────────────────────────────────────

export type NotificationPermissionStatus = 'granted' | 'denied' | 'unsupported' | 'prompt';

/**
 * Check if the browser supports the Notification API.
 */
function isSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get the current permission status.
 */
export function getPermissionStatus(): NotificationPermissionStatus {
  if (!isSupported()) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return 'prompt';
}

/**
 * Request permission to send browser notifications.
 * Returns true if permission was granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch {
    return false;
  }
}

// ─── Sending Notifications ───────────────────────────────────────────────────

/**
 * Track sent notifications to prevent duplicates.
 * Key is the notification tag, value is the timestamp.
 */
const sentNotifications = new Map<string, number>();

/**
 * How long (ms) before we allow re-sending a notification with the same tag.
 * Default: 30 minutes
 */
const DUPLICATE_WINDOW_MS = 30 * 60 * 1000;

/**
 * Send a browser notification.
 *
 * Returns true if the notification was sent successfully.
 * Respects duplicate prevention via the tag system.
 */
export function sendBrowserNotification(opts: BrowserNotificationOptions): boolean {
  if (!isSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  // Deduplicate by tag
  if (opts.tag) {
    const lastSent = sentNotifications.get(opts.tag);
    if (lastSent && Date.now() - lastSent < DUPLICATE_WINDOW_MS) {
      return false; // Already sent recently
    }
    sentNotifications.set(opts.tag, Date.now());

    // Prevent memory leaks: clean up old entries
    if (sentNotifications.size > 100) {
      const oldest = sentNotifications.entries().next().value;
      if (oldest) sentNotifications.delete(oldest[0]);
    }
  }

  try {
    const notification = new Notification(opts.title, {
      body: opts.body,
      tag: opts.tag,
      icon: opts.icon || '/favicon.ico',
      requireInteraction: true, // Stay on screen until dismissed
    });

    // Play a notification sound
    soundEngine.playNotification();

    // Handle click: focus the window and call optional onClick
    notification.onclick = () => {
      window.focus();
      notification.close();
      opts.onClick?.();
    };

    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);

    return true;
  } catch {
    return false;
  }
}

// ─── Pre-built Notification Types ────────────────────────────────────────────

/**
 * Send a meltdown-level urgency alert.
 */
export function sendMeltdownAlert(taskTitle: string, taskId: string, onClick?: () => void): boolean {
  return sendBrowserNotification({
    title: '🔴 MELTDOWN ALERT',
    body: `"${taskTitle}" has reached critical meltdown level. Immediate action required!`,
    tag: `meltdown-${taskId}`,
    onClick,
  });
}

/**
 * Send a critical-level urgency alert.
 */
export function sendCriticalAlert(taskTitle: string, taskId: string, onClick?: () => void): boolean {
  return sendBrowserNotification({
    title: '🟠 CRITICAL ALERT',
    body: `"${taskTitle}" needs urgent attention. Urgency level is critical.`,
    tag: `critical-${taskId}`,
    onClick,
  });
}

/**
 * Send an overdue task alert.
 */
export function sendOverdueAlert(taskTitle: string, taskId: string, onClick?: () => void): boolean {
  return sendBrowserNotification({
    title: '⚠️ OVERDUE',
    body: `"${taskTitle}" has passed its deadline. Review and reschedule.`,
    tag: `overdue-${taskId}`,
    onClick,
  });
}

/**
 * Send a deadline reminder (when deadline is within 30 minutes).
 */
export function sendDeadlineReminder(taskTitle: string, minutesUntil: number, taskId: string, onClick?: () => void): boolean {
  return sendBrowserNotification({
    title: '⏰ DEADLINE APPROACHING',
    body: `"${taskTitle}" is due in ${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}. Get focused!`,
    tag: `deadline-${taskId}`,
    onClick,
  });
}

/**
 * Send a task completion celebration notification.
 */
export function sendTaskCompleteNotification(taskTitle: string): boolean {
  return sendBrowserNotification({
    title: '✅ TASK RESCUED',
    body: `Congratulations! You completed "${taskTitle}". Great focus!`,
    tag: `complete-${taskTitle}-${Date.now()}`, // Unique tag, no dedup
  });
}

/**
 * Clear all sent notification tracking (useful for testing or logout).
 */
export function clearSentNotifications(): void {
  sentNotifications.clear();
}

export default {
  requestPermission: requestNotificationPermission,
  getPermissionStatus,
  send: sendBrowserNotification,
  sendMeltdownAlert,
  sendCriticalAlert,
  sendOverdueAlert,
  sendDeadlineReminder,
  sendTaskCompleteNotification,
  clearSentNotifications,
};
