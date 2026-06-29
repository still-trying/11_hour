// ============================================================
// 11_HOUR - useTasks Hook
// All CRUD operations routed through the API layer
// ============================================================

'use client'

import { useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store/useAppStore'
import { calculateUrgencyScore, getDefconFromScore } from '@/lib/utils/urgency'
import type { Task } from '@/types'

const supabase = createClient()

const API_BASE = '/api/tasks'

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }

  return res.json()
}

export function useTasks() {
  const { tasks, setTasks } = useAppStore()

  // Fetch all tasks for the current user via API
  const fetchTasks = useCallback(async () => {
    try {
      const data = await apiFetch(API_BASE)
      setTasks(data as Task[])
    } catch (err) {
      console.error('Error fetching tasks:', err)
    }
  }, [setTasks])

  // Create a task with optional AI parsing via API
  const createTask = useCallback(
    async (input: {
      title: string
      description?: string
      deadline?: string
      importance?: number
      estimated_minutes?: number
      category?: string
      natural_input?: string
      useAi?: boolean
    }) => {
      try {
        let taskData = { ...input }

        // AI parse natural language via server-side API
        if (input.useAi && input.natural_input) {
          try {
            const parsed = await apiFetch('/api/ai/prioritize', {
              method: 'POST',
              body: JSON.stringify({ text: input.natural_input }),
            })
            taskData = {
              ...taskData,
              title: parsed.title,
              description: parsed.description || input.description,
              deadline: parsed.deadline || input.deadline,
              importance: parsed.importance,
              estimated_minutes: parsed.estimated_minutes,
              category: parsed.category,
            }
          } catch {
            // AI parsing is optional — proceed with raw input
          }
        }

        const urgencyScore = calculateUrgencyScore(
          taskData.deadline || null,
          taskData.importance || 3,
          taskData.estimated_minutes || 30,
        )

        const defconLevel = getDefconFromScore(urgencyScore)

        // Try to generate AI steps via server-side API (graceful failure)
        let steps: { title: string; estimated_minutes: number }[] = []
        try {
          const stepsResponse = await apiFetch('/api/ai/steps', {
            method: 'POST',
            body: JSON.stringify({
              title: taskData.title,
              description: taskData.description,
            }),
          })
          steps = stepsResponse.steps || []
        } catch {
          // AI step generation is optional — proceed without
        }

        const data = await apiFetch(API_BASE, {
          method: 'POST',
          body: JSON.stringify({
            title: taskData.title,
            description: taskData.description || null,
            deadline: taskData.deadline || null,
            importance: taskData.importance || 3,
            estimated_minutes: taskData.estimated_minutes || 30,
            category: taskData.category || 'general',
            urgency_score: urgencyScore,
            defcon_level: defconLevel,
            natural_input: input.natural_input || null,
            ai_generated_steps: steps,
          }),
        })

        await fetchTasks()
        return data as Task
      } catch (err) {
        console.error('Error creating task:', err)
        throw err
      }
    },
    [fetchTasks],
  )

  // Update a task via API
  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      try {
        // Recalculate urgency if deadline/importance/estimated_minutes changed
        if (updates.deadline || updates.importance || updates.estimated_minutes) {
          const currentTasks = useAppStore.getState().tasks
          const task = currentTasks.find((t) => t.id === id)
          if (task) {
            const newScore = calculateUrgencyScore(
              updates.deadline ?? task.deadline ?? null,
              updates.importance ?? task.importance,
              updates.estimated_minutes ?? task.estimated_minutes,
              updates.times_snoozed ?? task.times_snoozed,
            )
            updates.urgency_score = newScore
            updates.defcon_level = getDefconFromScore(newScore)
          }
        }

        await apiFetch(`${API_BASE}?id=${id}`, {
          method: 'PATCH',
          body: JSON.stringify(updates),
        })

        await fetchTasks()
      } catch (err) {
        console.error('Error updating task:', err)
      }
    },
    [fetchTasks],
  )

  // Complete a task
  const completeTask = useCallback(
    async (id: string) => {
      await updateTask(id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        urgency_score: 0,
        defcon_level: 'calm',
      })
    },
    [updateTask],
  )

  // Delete a task via API
  const deleteTask = useCallback(
    async (id: string) => {
      try {
        await apiFetch(`${API_BASE}?id=${id}`, { method: 'DELETE' })
        await fetchTasks()
      } catch (err) {
        console.error('Error deleting task:', err)
      }
    },
    [fetchTasks],
  )

  // Snooze a task (increment times_snoozed) via API
  const snoozeTask = useCallback(
    async (id: string) => {
      const currentTasks = useAppStore.getState().tasks
      const task = currentTasks.find((t) => t.id === id)
      if (task) {
        await updateTask(id, { times_snoozed: (task.times_snoozed || 0) + 1 })
      }
    },
    [updateTask],
  )

  // Set up realtime subscription filtered to the current user's tasks
  useEffect(() => {
    const user = useAppStore.getState().user
    if (!user?.id) return // Don't subscribe if no user yet

    const channel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchTasks()
        },
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log('Tasks realtime connected')
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('Tasks realtime channel error, will retry...')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTasks])

  return {
    tasks,
    fetchTasks,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    snoozeTask,
  }
}
