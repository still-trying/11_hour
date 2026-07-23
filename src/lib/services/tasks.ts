import type { Task, AiStep } from '@/types';
import { supabase } from '@/lib/supabase/client';
import { parseBrainDump, generateSteps } from '@/ai/orchestrator/engines/geminiService';

export interface CreateTaskInput {
  title: string;
  description?: string;
  deadline?: string | null;
  importance?: number;
  estimated_minutes?: number;
  category?: string;
  useAi?: boolean;
  ai_generated_steps?: AiStep[];
  urgency_score?: number;
  defcon_level?: string;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  deadline?: string | null;
  importance?: number;
  estimated_minutes?: number;
  category?: string;
  urgency_score?: number;
  defcon_level?: string;
  times_snoozed?: number;
}

export const tasksApi = {
  fetch: async (): Promise<Task[]> => {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user ?? null;
    if (!user) return [];

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  create: async (input: CreateTaskInput): Promise<Task> => {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user ?? null;
    if (!user) throw new Error('Not authenticated');

    // Strip client-only fields before sending to Supabase
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { useAi, ...dbInput } = input;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...dbInput,
        user_id: user.id,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (input: UpdateTaskInput): Promise<Task> => {
    const { id, ...updates } = input;

    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) throw error;
  },

  complete: async (id: string): Promise<Task> => {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  snooze: async (id: string, times_snoozed: number): Promise<Task> => {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        times_snoozed: times_snoozed + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateProfileStats: async (
    userId: string,
    action: 'complete' | 'uncomplete',
  ): Promise<void> => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Get current profile stats
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tasks_completed, current_streak, last_completed_date')
      .eq('id', userId)
      .single();

    if (!profile) return;

    if (action === 'complete') {
      const lastDate = profile.last_completed_date;
      let newStreak: number;

      if (lastDate === today) {
        // Already completed something today, keep current streak
        newStreak = profile.current_streak ?? 0;
      } else if (lastDate === yesterday) {
        // Consecutive day, increment streak
        newStreak = (profile.current_streak ?? 0) + 1;
      } else {
        // Streak broken or first completion, reset to 1
        newStreak = 1;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          tasks_completed: (profile.tasks_completed ?? 0) + 1,
          current_streak: newStreak,
          last_completed_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
    } else {
      // Uncomplete — decrement tasks_completed, don't touch streak
      const { error } = await supabase
        .from('user_profiles')
        .update({
          tasks_completed: Math.max(0, (profile.tasks_completed ?? 0) - 1),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
    }
  },

  aiParse: async (text: string) => {
    return parseBrainDump(text);
  },

  aiGenerateSteps: async (title: string, description?: string) => {
    return generateSteps(title, description);
  },
};
