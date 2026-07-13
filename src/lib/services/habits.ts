import type { Habit, HabitLog } from '@/types'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  return res.json()
}

export interface CreateHabitInput {
  title: string
  description?: string
  color?: string
  icon?: string
  frequency?: string
  custom_days?: number[]
  reminder_time?: string
}

export interface UpdateHabitInput {
  id: string
  title?: string
  description?: string
  color?: string
  icon?: string
  frequency?: string
  custom_days?: number[]
  reminder_time?: string
  is_active?: boolean
}

export const habitsApi = {
  fetch: async (): Promise<Habit[]> => {
    return apiFetch<Habit[]>('/api/habits')
  },

  create: async (input: CreateHabitInput): Promise<Habit> => {
    return apiFetch<Habit>('/api/habits', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  update: async (input: UpdateHabitInput): Promise<Habit> => {
    const { id, ...data } = input
    return apiFetch<Habit>(`/api/habits?id=${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string): Promise<void> => {
    await apiFetch<void>(`/api/habits?id=${id}`, {
      method: 'DELETE',
    })
  },

  fetchLogs: async (startDate: string, endDate: string): Promise<HabitLog[]> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('completed_date', startDate)
      .lte('completed_date', endDate)
      .order('completed_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  toggleLog: async (habitId: string, date: string, currentlyCompleted: boolean): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    if (currentlyCompleted) {
      // Delete the log
      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
        .eq('completed_date', date)

      if (error) throw error
    } else {
      // Insert the log
      const { error } = await supabase
        .from('habit_logs')
        .insert({
          habit_id: habitId,
          user_id: user.id,
          completed_date: date,
        })

      if (error) throw error
    }
  },
}
