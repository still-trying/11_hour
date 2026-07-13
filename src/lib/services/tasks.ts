import type { Task, AiStep } from '@/types'

interface FetchTasksParams {
  status?: string
  limit?: number
  offset?: number
}

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

export interface CreateTaskInput {
  title: string
  description?: string
  deadline?: string | null
  importance?: number
  estimated_minutes?: number
  category?: string
  useAi?: boolean
  ai_generated_steps?: AiStep[]
  urgency_score?: number
  defcon_level?: string
}

export interface UpdateTaskInput {
  id: string
  title?: string
  description?: string
  status?: string
  deadline?: string | null
  importance?: number
  estimated_minutes?: number
  category?: string
  urgency_score?: number
  defcon_level?: string
  times_snoozed?: number
}

export const tasksApi = {
  fetch: async (params?: FetchTasksParams): Promise<Task[]> => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.offset) searchParams.set('offset', String(params.offset))

    const query = searchParams.toString()
    const url = `/api/tasks${query ? `?${query}` : ''}`
    return apiFetch<Task[]>(url)
  },

  create: async (input: CreateTaskInput): Promise<Task> => {
    return apiFetch<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  update: async (input: UpdateTaskInput): Promise<Task> => {
    const { id, ...data } = input
    return apiFetch<Task>('/api/tasks', {
      method: 'PATCH',
      body: JSON.stringify({ id, ...data }),
    })
  },

  delete: async (id: string): Promise<void> => {
    await apiFetch<void>('/api/tasks', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
  },

  complete: async (id: string): Promise<Task> => {
    return apiFetch<Task>('/api/tasks', {
      method: 'PATCH',
      body: JSON.stringify({ id, status: 'completed' }),
    })
  },

  snooze: async (id: string, times_snoozed: number): Promise<Task> => {
    return apiFetch<Task>('/api/tasks', {
      method: 'PATCH',
      body: JSON.stringify({ id, times_snoozed: times_snoozed + 1 }),
    })
  },

  aiParse: async (text: string) => {
    const res = await fetch('/api/ai/prioritize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) throw new Error('AI parsing failed')
    return res.json()
  },

  aiGenerateSteps: async (title: string, description?: string) => {
    const res = await fetch('/api/ai/steps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    })
    if (!res.ok) throw new Error('AI step generation failed')
    return res.json()
  },
}
