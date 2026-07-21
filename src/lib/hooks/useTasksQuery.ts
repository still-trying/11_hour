import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { tasksApi, type CreateTaskInput, type UpdateTaskInput } from '@/lib/services/tasks'
import { useAppStore } from '@/lib/store/useAppStore'
import { calculateUrgency } from '@/lib/utils/urgency'
import { fireConfetti } from '@/lib/utils/confetti'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Task } from '@/types'

// Keep a local cache of deleted tasks for undo
const deletedTasks = new Map<string, Task>()

export function useTasksQuery() {
  const queryClient = useQueryClient()
  const { setTasks, user } = useAppStore()

  // Main query for fetching tasks
  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks.all,
    queryFn: () => tasksApi.fetch(),
    enabled: !!user,
    select: (data) => data,
  })

  // Sync tasks to Zustand store whenever data changes
  useEffect(() => {
    if (tasksQuery.data) {
      setTasks(tasksQuery.data)
    }
  }, [tasksQuery.data, setTasks])

  // Realtime subscription to invalidate queries
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, queryClient])

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const urgencyInfo = input.deadline
        ? calculateUrgency(
            new Date(input.deadline),
            input.importance || 3,
            input.estimated_minutes || 30,
            0,
          )
        : { score: 0, level: 'calm' }

      return tasksApi.create({
        ...input,
        urgency_score: urgencyInfo.score,
        defcon_level: urgencyInfo.level,
      })
    },
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
      toast.success('Task created', {
        action: {
          label: 'Undo',
          onClick: async () => {
            await tasksApi.delete(newTask.id)
            queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
          },
        },
      })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create task')
    },
  })

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: (input: UpdateTaskInput) => tasksApi.update(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update task')
    },
  })

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: (id: string) => tasksApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
      fireConfetti({ particleCount: 40, spread: 60 })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to complete task')
    },
  })

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      // Cache the task for undo before deleting
      const task = tasksQuery.data?.find((t) => t.id === id)
      if (task) deletedTasks.set(id, task)
      await tasksApi.delete(id)
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
      const task = deletedTasks.get(id)
      if (task) {
        toast.error('Task deleted', {
          action: {
            label: 'Undo',
            onClick: async () => {
              await tasksApi.create({
                title: task.title,
                description: task.description,
                deadline: task.deadline,
                importance: task.importance,
                estimated_minutes: task.estimated_minutes,
                category: task.category,
                ai_generated_steps: task.ai_generated_steps,
              })
              deletedTasks.delete(id)
              queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
            },
          },
        })
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete task')
    },
  })

  // Snooze task mutation
  const snoozeTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const task = tasksQuery.data?.find((t) => t.id === id)
      if (!task) throw new Error('Task not found')
      return tasksApi.snooze(id, task.times_snoozed || 0)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
      toast.success('Task snoozed')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to snooze task')
    },
  })

  return {
    // Data
    tasks: tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
    isFetching: tasksQuery.isFetching,

    // Mutations
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    completeTask: completeTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    snoozeTask: snoozeTaskMutation.mutateAsync,

    // Mutation states
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isCompleting: completeTaskMutation.isPending,
  }
}
