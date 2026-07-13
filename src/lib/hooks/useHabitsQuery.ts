'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import {
  habitsApi,
  type CreateHabitInput,
  type UpdateHabitInput,
} from '@/lib/services/habits'
import { useAppStore } from '@/lib/store/useAppStore'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function useHabitsQuery() {
  const queryClient = useQueryClient()
  const { user, setHabits, setHabitLogs } = useAppStore()

  // Main habits query
  const habitsQuery = useQuery({
    queryKey: queryKeys.habits.list(),
    queryFn: () => habitsApi.fetch(),
    enabled: !!user,
  })

  // Sync to Zustand
  useEffect(() => {
    if (habitsQuery.data) {
      setHabits(habitsQuery.data)
    }
  }, [habitsQuery.data, setHabits])

  // Habit logs query (current week)
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })

  const logsQuery = useQuery({
    queryKey: queryKeys.habits.logs(format(today, 'yyyy-MM-dd')),
    queryFn: () =>
      habitsApi.fetchLogs(
        format(weekStart, 'yyyy-MM-dd'),
        format(weekEnd, 'yyyy-MM-dd'),
      ),
    enabled: !!user,
  })

  // Sync logs to Zustand
  useEffect(() => {
    if (logsQuery.data) {
      const logsByHabitId: Record<string, string[]> = {}
      for (const log of logsQuery.data) {
        if (!logsByHabitId[log.habit_id]) {
          logsByHabitId[log.habit_id] = []
        }
        logsByHabitId[log.habit_id].push(log.completed_date)
      }
      setHabitLogs(logsByHabitId)
    }
  }, [logsQuery.data, setHabitLogs])

  // Realtime subscription
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('habits-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habits',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.habits.all })
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habit_logs',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.habits.logs(format(today, 'yyyy-MM-dd')),
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, queryClient, today])

  // Create habit mutation
  const createHabitMutation = useMutation({
    mutationFn: (input: CreateHabitInput) => habitsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all })
      toast.success('Habit created')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create habit')
    },
  })

  // Update habit mutation
  const updateHabitMutation = useMutation({
    mutationFn: (input: UpdateHabitInput) => habitsApi.update(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all })
      toast.success('Habit updated')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update habit')
    },
  })

  // Delete habit mutation
  const deleteHabitMutation = useMutation({
    mutationFn: (id: string) => habitsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all })
      toast.success('Habit deleted')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete habit')
    },
  })

  // Toggle habit log mutation
  const toggleHabitMutation = useMutation({
    mutationFn: async ({
      habitId,
      date,
      currentlyCompleted,
    }: {
      habitId: string
      date: string
      currentlyCompleted: boolean
    }) => {
      await habitsApi.toggleLog(habitId, date, currentlyCompleted)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.habits.logs(format(today, 'yyyy-MM-dd')),
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to toggle habit')
    },
  })

  return {
    // Data
    habits: habitsQuery.data ?? [],
    habitLogs: logsQuery.data ?? [],
    isLoading: habitsQuery.isLoading || logsQuery.isLoading,
    isError: habitsQuery.isError,

    // Mutations
    createHabit: createHabitMutation.mutateAsync,
    updateHabit: updateHabitMutation.mutateAsync,
    deleteHabit: deleteHabitMutation.mutateAsync,
    toggleHabit: toggleHabitMutation.mutateAsync,

    // Mutation states
    isCreating: createHabitMutation.isPending,
    isToggling: toggleHabitMutation.isPending,
  }
}
