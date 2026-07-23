import type { Habit, HabitLog } from '@/types';
import { supabase } from '@/lib/supabase/client';

export interface CreateHabitInput {
  title: string;
  description?: string;
  color?: string;
  icon?: string;
  frequency?: string;
  custom_days?: number[];
  reminder_time?: string;
}

export interface UpdateHabitInput {
  id: string;
  title?: string;
  description?: string;
  color?: string;
  icon?: string;
  frequency?: string;
  custom_days?: number[];
  reminder_time?: string;
  is_active?: boolean;
}

export const habitsApi = {
  fetch: async (): Promise<Habit[]> => {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user ?? null;
    if (!user) return [];

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  create: async (input: CreateHabitInput): Promise<Habit> => {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user ?? null;
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('habits')
      .insert({
        ...input,
        user_id: user.id,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (input: UpdateHabitInput): Promise<Habit> => {
    const { id, ...updates } = input;

    const { data, error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('habits').delete().eq('id', id);

    if (error) throw error;
  },

  fetchLogs: async (startDate: string, endDate: string): Promise<HabitLog[]> => {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user ?? null;
    if (!user) return [];

    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('completed_date', startDate)
      .lte('completed_date', endDate)
      .order('completed_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  toggleLog: async (habitId: string, date: string, currentlyCompleted: boolean): Promise<void> => {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user ?? null;
    if (!user) throw new Error('Not authenticated');

    if (currentlyCompleted) {
      // Delete the log
      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
        .eq('completed_date', date);

      if (error) throw error;
    } else {
      // Insert the log
      const { error } = await supabase.from('habit_logs').insert({
        habit_id: habitId,
        user_id: user.id,
        completed_date: date,
      });

      if (error) throw error;
    }
  },
};
