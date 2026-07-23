/**
 * HabitsPage — Dedicated Habit Tracker with Weekly Grid & Streak Tracking
 *
 * Features:
 * - Weekly grid: rows = habits, columns = Mon-Sun
 * - Click cells to toggle habit completion
 * - Streak counter per habit
 * - Create, edit, delete habits
 * - Highlight today's column
 * - Summary stats footer
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  X,
  Trash2,
  Edit3,
  Flame,
  Target,
  Sparkles,
} from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  isToday,
  parseISO,
  differenceInDays,
  startOfDay,
} from 'date-fns';
import { useHabitsQuery } from '@/lib/hooks/useHabitsQuery';
import { toast } from 'sonner';
import type { Habit } from '@/types';

interface HabitFormData {
  title: string;
  description: string;
  icon: string;
  color: string;
}

const DEFAULT_COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EC4899',
  '#8B5CF6', '#06B6D4', '#F97316', '#EF4444',
];

const DEFAULT_ICONS = ['📌', '📚', '💪', '🧠', '🏃', '🎯', '✍️', '🧘', '💧', '🌱', '🎨', '🎵'];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function calculateStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;
  const today = startOfDay(new Date());
  const sorted = completedDates
    .map((d) => startOfDay(parseISO(d)))
    .sort((a, b) => b.getTime() - a.getTime());
  const mostRecent = sorted[0];
  const diffFromToday = differenceInDays(today, mostRecent);
  if (diffFromToday > 1) return 0;
  let streak = 0;
  let checkDate = mostRecent;
  for (const date of sorted) {
    const diff = differenceInDays(checkDate, date);
    if (diff <= 1) {
      if (diff === 1) checkDate = date;
      streak++;
    } else break;
  }
  return streak;
}

type SortField = 'streak' | 'title' | 'created';
type SortDir = 'asc' | 'desc';

export default function HabitsPage(): React.JSX.Element {
  const {
    habits, habitLogs, isLoading,
    createHabit, updateHabit, deleteHabit, toggleHabit,
    isCreating,
  } = useHabitsQuery();

  const [today, setToday] = useState(() => new Date());

  // Refresh today at midnight so the grid stays current
  useEffect(() => {
    const now = new Date();
    const msTillMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0).getTime() -
      now.getTime();
    const dayInMs = 24 * 60 * 60 * 1000;
    let dailyInterval: ReturnType<typeof setInterval> | null = null;
    const timer = setTimeout(() => {
      setToday(new Date());
      dailyInterval = setInterval(() => setToday(new Date()), dayInMs);
    }, msTillMidnight);
    return () => {
      clearTimeout(timer);
      if (dailyInterval !== null) clearInterval(dailyInterval);
    };
  }, []);
  const weekStart = useMemo(() => startOfWeek(today, { weekStartsOn: 1 }), [today]);
  const weekEnd = useMemo(() => endOfWeek(today, { weekStartsOn: 1 }), [today]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const [sortField, setSortField] = useState<SortField>('streak');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const completedMap = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const log of habitLogs) {
      if (!map[log.habit_id]) map[log.habit_id] = new Set();
      map[log.habit_id].add(log.completed_date);
    }
    return map;
  }, [habitLogs]);

  const streakMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const habit of habits) {
      map[habit.id] = calculateStreak(Array.from(completedMap[habit.id] || []));
    }
    return map;
  }, [habits, completedMap]);

  const sortedHabits = useMemo(() => {
    const list = [...habits];
    list.sort((a, b) => {
      let cmp: number;
      if (sortField === 'streak') {
        cmp = (streakMap[a.id] ?? 0) - (streakMap[b.id] ?? 0);
      } else if (sortField === 'title') {
        cmp = a.title.localeCompare(b.title);
      } else {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return list;
  }, [habits, streakMap, sortField, sortDir]);

  const handleToggle = useCallback(async (habitId: string, date: string) => {
    try {
      const isCompleted = completedMap[habitId]?.has(date) ?? false;
      await toggleHabit({ habitId, date, currentlyCompleted: isCompleted });
    } catch { /* error handled by mutation onError */ }
  }, [toggleHabit, completedMap]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [formData, setFormData] = useState<HabitFormData>({
    title: '', description: '', icon: '📌', color: '#10B981',
  });

  const resetForm = useCallback(() => {
    setFormData({ title: '', description: '', icon: '📌', color: '#10B981' });
    setEditingHabit(null);
  }, []);

  const openCreate = useCallback(() => { resetForm(); setShowCreateModal(true); }, [resetForm]);

  const openEdit = useCallback((habit: Habit) => {
    setFormData({
      title: habit.title,
      description: habit.description || '',
      icon: habit.icon || '📌',
      color: habit.color || '#10B981',
    });
    setEditingHabit(habit);
    setShowCreateModal(true);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error('Habit title is required'); return; }
    try {
      if (editingHabit) {
        await updateHabit({
          id: editingHabit.id,
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          icon: formData.icon,
          color: formData.color,
        });
        toast.success('Habit updated');
      } else {
        await createHabit({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          icon: formData.icon,
          color: formData.color,
          frequency: 'daily',
        });
        toast.success('Habit created');
      }
      setShowCreateModal(false);
      resetForm();
    } catch { toast.error('Failed to save habit'); }
  }, [formData, editingHabit, createHabit, updateHabit, resetForm]);

  const handleDelete = useCallback(async (habit: Habit) => {
    if (window.confirm(`Delete habit "${habit.title}"?`)) {
      await deleteHabit(habit.id);
      toast.success('Habit deleted');
    }
  }, [deleteHabit]);

  // Stats
  const totalCompletionsThisWeek = useMemo(() => {
    const dateStrs = new Set(weekDays.map((d) => format(d, 'yyyy-MM-dd')));
    return habitLogs.filter((log) => dateStrs.has(log.completed_date)).length;
  }, [habitLogs, weekDays]);

  const totalActive = habits.length;
  const totalStreaks = Object.values(streakMap).filter((s) => s >= 3).length;
  const bestStreak = Math.max(...Object.values(streakMap), 0);

  const cycleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }, [sortField]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-sys-lg p-sys-md animate-pulse">
        <div className="h-8 bg-bg-secondary rounded-sys-md w-1/3" />
        <div className="h-64 bg-bg-secondary rounded-sys-lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-sys-lg p-sys-md">
      {/* Header */}
      <div className="flex flex-col gap-sys-xs border-b border-border-muted pb-sys-sm">
        <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
          <Target size={14} className="text-accent-emerald" />
          <span>HABIT TRACKER</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xxl sm:text-xxxl font-semibold tracking-tight text-text-primary">
            Daily Habits
          </h1>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent-amber text-black font-mono font-bold text-sm rounded-sys-md hover:bg-accent-amber/90 transition-all hover:shadow-lg hover:shadow-accent-amber/20"
          >
            <Plus size={14} /> New Habit
          </button>
        </div>
        <p className="text-text-muted text-sm">
          Week of {format(weekStart, 'MMM d')} &mdash; {format(weekEnd, 'MMM d, yyyy')}
        </p>
      </div>

      {/* Weekly Grid */}
      {sortedHabits.length === 0 ? (
        <div className="p-sys-lg bg-bg-secondary border border-border-muted rounded-sys-lg flex flex-col items-center justify-center min-h-[300px] gap-3">
          <Target size={40} className="text-text-muted/30" />
          <span className="font-mono text-sm text-text-muted">No habits yet</span>
          <p className="text-xs text-text-muted max-w-sm text-center">
            Build consistent routines by tracking daily habits. Click &quot;New Habit&quot; to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-sys-lg border border-border-muted bg-bg-primary">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border-muted bg-bg-secondary/50">
                <th
                  className="text-left text-[10px] font-mono text-text-muted uppercase tracking-wider py-3 pl-4 pr-4 min-w-[140px] cursor-pointer select-none hover:text-text-primary transition-colors"
                  onClick={() => cycleSort('title')}
                >
                  Habit {sortField === 'title' && (sortDir === 'desc' ? '↓' : '↑')}
                </th>
                <th
                  className="text-left text-[10px] font-mono text-text-muted uppercase tracking-wider py-3 pr-2 min-w-[60px] cursor-pointer select-none hover:text-text-primary transition-colors"
                  onClick={() => cycleSort('streak')}
                >
                  Streak {sortField === 'streak' && (sortDir === 'desc' ? '↓' : '↑')}
                </th>
                {weekDays.map((day, i) => {
                  const isTodayCol = isToday(day);
                  return (
                    <th
                      key={i}
                      className={`text-center py-3 px-1 min-w-[36px] ${
                        isTodayCol ? 'text-accent-amber' : 'text-text-muted'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[9px] font-mono">{WEEKDAYS[i]}</span>
                        <span
                          className={`text-xs font-mono font-bold ${
                            isTodayCol
                              ? 'bg-accent-amber/20 text-accent-amber w-6 h-6 rounded-full flex items-center justify-center'
                              : ''
                          }`}
                        >
                          {format(day, 'd')}
                        </span>
                      </div>
                    </th>
                  );
                })}
                <th className="w-12" />
              </tr>
            </thead>
            <tbody>
              {sortedHabits.map((habit) => {
                const streak = streakMap[habit.id] ?? 0;
                return (                    <tr
                    key={habit.id}
                    className="group border-b border-border-muted/50 last:border-b-0 hover:bg-bg-secondary/30 transition-colors"
                  >
                    {/* Habit title */}
                    <td className="py-2.5 pl-4 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg leading-none">{habit.icon || '📌'}</span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-text-primary leading-tight">
                            {habit.title}
                          </span>
                          {habit.description && (
                            <span className="text-[11px] text-text-muted leading-tight mt-0.5 line-clamp-1">
                              {habit.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Streak */}
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-1">
                        <Flame
                          size={14}
                          className={streak >= 3 ? 'text-accent-orange' : 'text-text-muted/40'}
                        />
                        <span
                          className={`font-mono text-xs font-bold ${
                            streak >= 3 ? 'text-accent-orange' : 'text-text-muted'
                          }`}
                        >
                          {streak}
                        </span>
                      </div>
                    </td>

                    {/* Day cells */}
                    {weekDays.map((day) => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const isCompleted = completedMap[habit.id]?.has(dateStr) ?? false;
                      const isPastOrToday = day.getTime() <= today.getTime();
                      const isTodayCol = isToday(day);

                      return (
                        <td key={dateStr} className="py-2.5 px-1 text-center">
                          <button
                            onClick={() => handleToggle(habit.id, dateStr)}
                            disabled={!isPastOrToday}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                              isCompleted
                                ? 'scale-100 opacity-100'
                                : isPastOrToday
                                  ? 'hover:bg-bg-secondary active:scale-90 opacity-60 hover:opacity-100'
                                  : 'opacity-20 cursor-not-allowed'
                            } ${isTodayCol && !isCompleted ? 'ring-1 ring-border-muted' : ''}`}
                            title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                          >
                            {isCompleted ? (
                              <CheckCircle2
                                size={18}
                                className="text-accent-emerald"
                                style={{ fill: habit.color || '#10B981', fillOpacity: 0.15 }}
                              />
                            ) : (
                              <Circle size={16} className="text-text-muted/30" />
                            )}
                          </button>
                        </td>
                      );
                    })}

                    {/* Actions */}
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(habit)}
                          className="p-1.5 rounded-sys-sm hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-colors"
                          title="Edit habit"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(habit)}
                          className="p-1.5 rounded-sys-sm hover:bg-bg-secondary text-text-muted hover:text-red-400 transition-colors"
                          title="Delete habit"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-bg-secondary border border-border-muted rounded-sys-lg p-3 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
            Total Habits
          </span>
          <span className="text-lg font-display font-bold text-text-primary">{totalActive}</span>
        </div>
        <div className="bg-bg-secondary border border-border-muted rounded-sys-lg p-3 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
            This Week
          </span>
          <span className="text-lg font-display font-bold text-text-primary">
            {totalCompletionsThisWeek}
          </span>
        </div>
        <div className="bg-bg-secondary border border-border-muted rounded-sys-lg p-3 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
            Best Streak
          </span>
          <span className="text-lg font-display font-bold text-accent-orange flex items-center gap-1">
            <Flame size={16} /> {bestStreak}
          </span>
        </div>
        <div className="bg-bg-secondary border border-border-muted rounded-sys-lg p-3 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
            On a Roll &ge;3
          </span>
          <span className="text-lg font-display font-bold text-accent-emerald flex items-center gap-1">
            <Sparkles size={16} /> {totalStreaks}
          </span>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => { setShowCreateModal(false); resetForm(); }}
        >
          <div
            className="w-full max-w-md bg-bg-primary border border-border-muted rounded-sys-xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-semibold text-text-primary">
                {editingHabit ? 'Edit Habit' : 'New Habit'}
              </h2>
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="p-1.5 rounded-sys-sm hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
                  Title
                </label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Morning meditation"
                  className="w-full px-3 py-2 bg-bg-secondary border border-border-muted rounded-sys-md text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-accent-amber/30 focus:border-accent-amber/50 transition-all font-mono"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
                  Description <span className="text-text-muted/50">(optional)</span>
                </label>
                <input
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description..."
                  className="w-full px-3 py-2 bg-bg-secondary border border-border-muted rounded-sys-md text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-accent-amber/30 focus:border-accent-amber/50 transition-all font-mono"
                />
              </div>

              {/* Icon picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
                  Icon
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, icon }))}
                      className={`text-lg w-8 h-8 flex items-center justify-center rounded-sys-md transition-all ${
                        formData.icon === icon
                          ? 'bg-accent-amber/20 ring-1 ring-accent-amber/50 scale-110'
                          : 'bg-bg-secondary hover:bg-accent-amber/10'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, color }))}
                      className={`w-7 h-7 rounded-full transition-all ${
                        formData.color === color
                          ? 'scale-125 ring-2 ring-white/30 ring-offset-1 ring-offset-bg-primary'
                          : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-muted">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="px-4 py-2 text-sm font-mono text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded-sys-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !formData.title.trim()}
                  className="px-5 py-2 bg-accent-amber text-black font-mono font-bold text-sm rounded-sys-md hover:bg-accent-amber/90 transition-all hover:shadow-lg hover:shadow-accent-amber/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Saving...' : editingHabit ? 'Save Changes' : 'Create Habit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
