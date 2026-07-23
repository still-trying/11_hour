/**
 * useBrowserNotifications — Task Monitoring Hook for Browser Notifications
 *
 * Monitors the task list for urgent events and sends browser notifications:
 * - Meltdown/critical tasks
 * - Overdue tasks
 * - Deadlines approaching (within 30 minutes)
 *
 * Respects settings from the SettingsPage.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isPast, differenceInMinutes } from 'date-fns';
import type { Task } from '@/types';
import {
  sendMeltdownAlert,
  sendCriticalAlert,
  sendOverdueAlert,
  sendDeadlineReminder,
  requestNotificationPermission,
  getPermissionStatus,
} from '@/lib/utils/browserNotifications';

export interface BrowserNotificationConfig {
  /** Master toggle for all browser notifications */
  enabled: boolean;
  /** Send alerts for meltdown-level tasks */
  meltdownAlerts: boolean;
}

const DEFAULT_CONFIG: BrowserNotificationConfig = {
  enabled: true,
  meltdownAlerts: true,
};

/**
 * Hook that monitors tasks and triggers browser notifications.
 * Should be used once at a high level (e.g., in ProtectedLayout).
 */
export function useBrowserNotifications(
  tasks: Task[],
  config: Partial<BrowserNotificationConfig> = {},
): void {
  const navigate = useNavigate();
  const cfg = { ...DEFAULT_CONFIG, ...config };

  useEffect(() => {
    if (!cfg.enabled || !tasks.length) return;

    // Attempt to request permission on first run if not granted
    const status = getPermissionStatus();
    if (status === 'prompt') {
      requestNotificationPermission().catch(() => {});
      return; // Wait for permission result on next check
    }
    if (status !== 'granted') return;

    const now = new Date();

    for (const task of tasks) {
      if (task.status === 'completed' || task.status === 'cancelled') continue;

      const taskId = task.id;

      // 1. Meltdown alerts
      if (cfg.meltdownAlerts && task.defcon_level === 'meltdown') {
        sendMeltdownAlert(task.title, taskId, () => {
          navigate(`/rescue/${taskId}`);
        });
      }

      // 2. Critical alerts
      if (cfg.meltdownAlerts && task.defcon_level === 'critical') {
        sendCriticalAlert(task.title, taskId, () => {
          navigate(`/rescue/${taskId}`);
        });
      }

      // 3. Overdue alerts
      if (task.deadline && isPast(new Date(task.deadline))) {
        sendOverdueAlert(task.title, taskId, () => {
          navigate(`/rescue/${taskId}`);
        });
      }

      // 4. Deadline approaching (within 30 minutes)
      if (task.deadline) {
        const deadline = new Date(task.deadline);
        const minutesUntil = differenceInMinutes(deadline, now);
        if (minutesUntil > 0 && minutesUntil <= 30) {
          sendDeadlineReminder(task.title, minutesUntil, taskId, () => {
            navigate(`/rescue/${taskId}`);
          });
        }
      }
    }
  }, [tasks, cfg.enabled, cfg.meltdownAlerts, navigate]);
}

export default useBrowserNotifications;
