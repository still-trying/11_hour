/**
 * Unified Application Data Store
 *
 * Provides the combined state interface that hooks and pages expect:
 * - user / profile from authStore
 * - tasks, habits, habitLogs, notifications (local data cache)
 *
 * This store bridges the auth store (which owns the user) with
 * the data layer (tasks, habits, notifications) that the
 * TanStack Query hooks sync into.
 */

import { create } from 'zustand';
import { useAuthStore, type AuthState } from '@/stores/authStore';
import type { Task, Habit, Notification, UserProfile } from '@/types';

interface AppDataState {
  // Derived from authStore
  user: UserProfile | null;
  profile: UserProfile | null;

  // Data caches synced by TanStack Query hooks
  tasks: Task[];
  habits: Habit[];
  habitLogs: Record<string, string[]>;
  notifications: Notification[];
}

interface AppDataActions {
  setTasks: (tasks: Task[]) => void;
  setHabits: (habits: Habit[]) => void;
  setHabitLogs: (logs: Record<string, string[]>) => void;
  setNotifications: (notifications: Notification[]) => void;
  setProfile: (profile: UserProfile) => void;
}

export const useAppStore = create<AppDataState & AppDataActions>((set) => {
  // Subscribe to auth store changes so `user` stays in sync
  const authState = useAuthStore.getState();
  useAuthStore.subscribe((state: AuthState) => {
    set({
      user: state.user,
      profile: state.user,
    });
  });

  return {
    // Initial state — pull current user from auth store
    user: authState.user,
    profile: authState.user,
    tasks: [],
    habits: [],
    habitLogs: {},
    notifications: [],

    // Actions
    setTasks: (tasks) => set({ tasks }),
    setHabits: (habits) => set({ habits }),
    setHabitLogs: (habitLogs) => set({ habitLogs }),
    setNotifications: (notifications) => set({ notifications }),
    setProfile: (profile) => set({ profile }),
  };
});

export default useAppStore;
