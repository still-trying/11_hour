// ============================================================
// 11_HOUR - Type Definitions
// ============================================================

import type { User } from '@supabase/supabase-js'

// --- Urgency / DEFCON ---
export type DefconLevel = 'calm' | 'focused' | 'urgent' | 'critical' | 'meltdown'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue'

export interface UrgencyInfo {
  score: number
  defconLevel: DefconLevel
  label: string
  color: string
  bgColor: string
  borderColor: string
  shouldPulse: boolean
  hoursRemaining: number | null
  timeLabel: string
}

// --- Database Types (mirrors Supabase schema) ---
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  timezone: string
  total_tasks_completed: number
  total_focus_minutes: number
  current_streak: number
  longest_streak: number
  last_active_date?: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  status: TaskStatus
  deadline?: string
  estimated_minutes: number
  actual_minutes?: number
  started_at?: string
  completed_at?: string
  importance: number
  urgency_score: number
  defcon_level: DefconLevel
  ai_generated_steps: AiStep[]
  natural_input?: string
  category: string
  tags: string[]
  parent_task_id?: string
  times_snoozed: number
  created_at: string
  updated_at: string
}

export interface AiStep {
  title: string
  is_completed: boolean
  estimated_minutes?: number
}

export interface Habit {
  id: string
  user_id: string
  title: string
  description?: string
  icon: string
  color: string
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom'
  target_days: number[]
  reminder_time?: string
  current_streak: number
  longest_streak: number
  total_completions: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  completed_date: string
  completed_at: string
  note?: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  type: 'info' | 'warning' | 'critical' | 'achievement' | 'ai' | 'reminder'
  related_task_id?: string
  is_read: boolean
  created_at: string
}

// --- AI Types ---
export interface AiMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AiChatRequest {
  message: string
  context?: {
    tasks?: Task[]
    currentTask?: Task
  }
}

export interface AiChatResponse {
  message: string
  suggestedActions?: string[]
}

export interface AiPrioritizeRequest {
  text: string
}

export interface AiPrioritizeResponse {
  title: string
  description?: string
  deadline?: string
  importance: number
  estimated_minutes: number
  category: string
  steps?: AiStep[]
}

// --- Store Types ---
export interface AppState {
  // Auth
  user: User | null
  profile: Profile | null
  isLoading: boolean

  // Tasks
  tasks: Task[]
  selectedTask: Task | null

  // Habits
  habits: Habit[]
  habitLogs: Record<string, string[]> // habit_id -> completed_date[]

  // UI
  sidebarExpanded: boolean
  elevenOpen: boolean
  focusMode: boolean

  // Actions
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setTasks: (tasks: Task[]) => void
  setSelectedTask: (task: Task | null) => void
  setHabits: (habits: Habit[]) => void
  setHabitLogs: (logs: Record<string, string[]>) => void
  toggleSidebar: () => void
  setElevenOpen: (open: boolean) => void
  setFocusMode: (mode: boolean) => void
}

// --- Form Types ---
export interface TaskFormData {
  title: string
  description?: string
  deadline?: string
  estimated_minutes: number
  importance: number
  category: string
}

export interface HabitFormData {
  title: string
  description?: string
  icon: string
  color: string
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom'
}
