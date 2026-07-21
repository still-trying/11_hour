export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  full_name?: string;
  current_streak?: number;
  tasks_completed?: number;
}

export interface MicroStep {
  id: string;
  title: string;
  duration: number; // in seconds
  status: 'pending' | 'running' | 'completed';
  completedAt?: string;
}

export interface RescueEpisode {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'abandoned';
  createdAt: string;
  completedAt?: string;
  targetDeadline: string;
}

export interface AiStep {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  deadline?: string | null;
  importance?: number;
  estimated_minutes?: number;
  category?: string;
  urgency_score?: number;
  defcon_level?: string;
  times_snoozed?: number;
  ai_generated_steps?: AiStep[];
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  color?: string;
  icon?: string;
  frequency?: string;
  custom_days?: number[];
  reminder_time?: string;
  is_active: boolean;
  user_id: string;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  task_id?: string;
  user_id: string;
  is_read: boolean;
  created_at: string;
}

export interface Alert {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
}
