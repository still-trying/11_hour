import { create } from 'zustand'
import type { AppState, Task, Habit, Profile } from '@/types'

export const useAppStore = create<AppState>((set) => ({
  // Auth
  user: null,
  profile: null,
  isLoading: true,

  // Tasks
  tasks: [],
  selectedTask: null,

  // Habits
  habits: [],
  habitLogs: {},

  // UI
  sidebarExpanded: true,
  elevenOpen: false,
  focusMode: false,

  // Actions
  setUser: (user) => set({ user }),
  setProfile: (profile: Profile | null) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setTasks: (tasks: Task[]) => set({ tasks }),
  setSelectedTask: (selectedTask: Task | null) => set({ selectedTask }),
  setHabits: (habits: Habit[]) => set({ habits }),
  setHabitLogs: (habitLogs) => set({ habitLogs }),
  toggleSidebar: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
  setElevenOpen: (elevenOpen) => set({ elevenOpen }),
  setFocusMode: (focusMode) => set({ focusMode }),
}))
