import type { Notification, Task } from '@/types';
import { supabase } from '@/lib/supabase/client';

export const notificationsApi = {
  fetch: async (limit = 50): Promise<Notification[]> => {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user ?? null;
    if (!user) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  create: async (notification: {
    title: string;
    message: string;
    type: string;
    task_id?: string;
  }): Promise<void> => {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user ?? null;
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('notifications').insert({
      user_id: user.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      task_id: notification.task_id,
    });

    if (error) throw error;
  },

  markAsRead: async (id: string): Promise<void> => {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);

    if (error) throw error;
  },

  markAllAsRead: async (): Promise<void> => {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user ?? null;
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) throw error;
  },

  syncDefconAlerts: async (tasks: Task[]): Promise<void> => {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user ?? null;
    if (!user) return;

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

    // 1. Figure out which alert types each task could need, based on its defcon level / status
    const candidateAlerts: Array<{
      type: string;
      taskId: string;
      title: string;
      message: string;
    }> = [];

    for (const task of tasks) {
      if (task.status === 'completed' || task.status === 'cancelled') continue;

      if (task.defcon_level === 'meltdown') {
        candidateAlerts.push({
          type: 'meltdown_alert',
          taskId: task.id,
          title: '🔴 MELTDOWN ALERT',
          message: `"${task.title}" is at critical urgency levels. Immediate action required.`,
        });
      }

      if (task.defcon_level === 'critical') {
        candidateAlerts.push({
          type: 'critical_alert',
          taskId: task.id,
          title: '🟠 CRITICAL ALERT',
          message: `"${task.title}" needs attention soon. Urgency level is critical.`,
        });
      }

      if (task.status === 'overdue') {
        candidateAlerts.push({
          type: 'overdue_alert',
          taskId: task.id,
          title: '⚠️ OVERDUE',
          message: `"${task.title}" passed its deadline. Review and reschedule.`,
        });
      }
    }

    if (candidateAlerts.length === 0) return;

    // 2. Query ALL existing recent notifications for these task+type combinations in one call
    const taskIds = [...new Set(candidateAlerts.map((a) => a.taskId))];
    const alertTypes = [...new Set(candidateAlerts.map((a) => a.type))];

    const { data: existingNotifications } = await supabase
      .from('notifications')
      .select('task_id, type')
      .eq('user_id', user.id)
      .in('task_id', taskIds)
      .in('type', alertTypes)
      .eq('is_read', false)
      .gte('created_at', oneHourAgo);

    // 3. Build a Set of "taskId:type" keys that already have an alert
    const existingKeys = new Set<string>();
    if (existingNotifications) {
      for (const n of existingNotifications) {
        existingKeys.add(`${n.task_id}:${n.type}`);
      }
    }

    // 4. Only create alerts for candidates that don't already have one
    const alertsToCreate = candidateAlerts.filter(
      (a) => !existingKeys.has(`${a.taskId}:${a.type}`),
    );

    if (alertsToCreate.length === 0) return;

    const { error } = await supabase.from('notifications').insert(
      alertsToCreate.map((a) => ({
        user_id: user.id,
        title: a.title,
        message: a.message,
        type: a.type,
        task_id: a.taskId,
      })),
    );

    if (error) console.error('Failed to sync defcon alerts:', error);
  },
};
