import type { Notification, Task } from '@/types'
import { supabase } from '@/lib/supabase/client'

export const notificationsApi = {
  fetch: async (limit = 50): Promise<Notification[]> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  create: async (notification: {
    title: string
    message: string
    type: string
    task_id?: string
  }): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('notifications').insert({
      user_id: user.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      task_id: notification.task_id,
    })

    if (error) throw error
  },

  markAsRead: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    if (error) throw error
  },

  markAllAsRead: async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) throw error
  },

  syncDefconAlerts: async (tasks: Task[]): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString()

    const alerts: Array<{ title: string; message: string; type: string; task_id?: string }> = []

    for (const task of tasks) {
      if (task.status === 'completed' || task.status === 'cancelled') continue

      if (task.defcon_level === 'meltdown') {
        // Check if similar alert exists within last hour
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('type', 'meltdown_alert')
          .eq('task_id', task.id)
          .eq('is_read', false)
          .gte('created_at', oneHourAgo)
          .limit(1)

        if (!existing || existing.length === 0) {
          alerts.push({
            title: '🔴 MELTDOWN ALERT',
            message: `"${task.title}" is at critical urgency levels. Immediate action required.`,
            type: 'meltdown_alert',
            task_id: task.id,
          })
        }
      }

      if (task.defcon_level === 'critical') {
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('type', 'critical_alert')
          .eq('task_id', task.id)
          .eq('is_read', false)
          .gte('created_at', oneHourAgo)
          .limit(1)

        if (!existing || existing.length === 0) {
          alerts.push({
            title: '🟠 CRITICAL ALERT',
            message: `"${task.title}" needs attention soon. Urgency level is critical.`,
            type: 'critical_alert',
            task_id: task.id,
          })
        }
      }

      if (task.status === 'overdue') {
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('type', 'overdue_alert')
          .eq('task_id', task.id)
          .eq('is_read', false)
          .gte('created_at', oneHourAgo)
          .limit(1)

        if (!existing || existing.length === 0) {
          alerts.push({
            title: '⚠️ OVERDUE',
            message: `"${task.title}" passed its deadline. Review and reschedule.`,
            type: 'overdue_alert',
            task_id: task.id,
          })
        }
      }
    }

    if (alerts.length > 0) {
      const { error } = await supabase.from('notifications').insert(
        alerts.map((a) => ({ ...a, user_id: user.id })),
      )

      if (error) console.error('Failed to sync defcon alerts:', error)
    }
  },
}
