// ============================================================
// 11_HOUR - useHabits Hook
// ============================================================

'use client'

import { useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store/useAppStore'
import type { Habit } from '@/types'

const supabase = createClient()

export function useHabits() {
  const { habits, setHabits, habitLogs, setHabitLogs } = useAppStore()

  // Fetch all habits
  const fetchHabits = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (error) throw error
      setHabits(data as Habit[])
    } catch (err) {
      console.error('Error fetching habits:', err)
    }
  }, [setHabits])

  // Fetch habit logs for the current week
  const fetchHabitLogs = useCallback(async () => {
    try {
      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      startOfWeek.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .gte('completed_date', startOfWeek.toISOString().split('T')[0])

      if (error) throw error

      const grouped: Record<string, string[]> = {}
      for (const log of data || []) {
        if (!grouped[log.habit_id]) grouped[log.habit_id] = []
        grouped[log.habit_id].push(log.completed_date)
      }
      setHabitLogs(grouped)
    } catch (err) {
      console.error('Error fetching habit logs:', err)
    }
  }, [setHabitLogs])

  // Toggle habit completion for today
  const toggleHabit = useCallback(
    async (habitId: string) => {
      try {
        const today = new Date().toISOString().split('T')[0]
        const isCompleted = habitLogs[habitId]?.includes(today)

        if (isCompleted) {
          // Remove completion
          const { error } = await supabase
            .from('habit_logs')
            .delete()
            .eq('habit_id', habitId)
            .eq('completed_date', today)

          if (error) throw error
        } else {
          // Add completion
          const { error } = await supabase.from('habit_logs').insert({
            habit_id: habitId,
            completed_date: today,
          })

          if (error) throw error
        }

        await fetchHabitLogs()
        await fetchHabits() // Refresh streaks
      } catch (err) {
        console.error('Error toggling habit:', err)
      }
    },
    [habitLogs, fetchHabitLogs, fetchHabits],
  )

  // Create a new habit
  const createHabit = useCallback(
    async (habitData: {
      title: string
      description?: string
      icon?: string
      color?: string
      frequency?: 'daily' | 'weekdays' | 'weekends' | 'custom'
    }) => {
      try {
        const { error } = await supabase.from('habits').insert({
          title: habitData.title,
          description: habitData.description || null,
          icon: habitData.icon || 'zap',
          color: habitData.color || '#6C63FF',
          frequency: habitData.frequency || 'daily',
        })

        if (error) throw error
        await fetchHabits()
      } catch (err) {
        console.error('Error creating habit:', err)
      }
    },
    [fetchHabits],
  )

  // Delete a habit
  const deleteHabit = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase
          .from('habits')
          .update({ is_active: false })
          .eq('id', id)

        if (error) throw error
        await fetchHabits()
      } catch (err) {
        console.error('Error deleting habit:', err)
      }
    },
    [fetchHabits],
  )

  // Set up realtime subscriptions
  useEffect(() => {
    const user = useAppStore.getState().user
    if (!user?.id) return

    const channel = supabase
      .channel('habits_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habits',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchHabits()
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Habits realtime connected')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchHabits])

  // Check if a habit is completed today
  const isCompletedToday = useCallback(
    (habitId: string): boolean => {
      const today = new Date().toISOString().split('T')[0]
      return habitLogs[habitId]?.includes(today) || false
    },
    [habitLogs],
  )

  return {
    habits,
    habitLogs,
    fetchHabits,
    fetchHabitLogs,
    toggleHabit,
    createHabit,
    deleteHabit,
    isCompletedToday,
  }
}
