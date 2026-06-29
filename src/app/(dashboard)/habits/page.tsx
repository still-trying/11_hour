'use client'

import { useState } from 'react'
import { useHabits } from '@/lib/hooks/useHabits'
import { HabitRing } from '@/components/habits/HabitRing'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'

export default function HabitsPage() {
  const { habits, habitLogs, toggleHabit, createHabit, isCompletedToday } =
    useHabits()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [color, setColor] = useState('#6C63FF')

  const colors = [
    '#6C63FF', '#22D3EE', '#10B981', '#F59E0B',
    '#F97316', '#EF4444', '#EC4899', '#8B5CF6',
  ]

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    await createHabit({
      title: title.trim(),
      color,
      icon: 'zap',
    })

    setTitle('')
    setColor('#6C63FF')
    setShowForm(false)
    toast.success('Habit created!')
  }

  const today = new Date().toISOString().split('T')[0]
  const completedToday = habits.filter((h) => isCompletedToday(h.id)).length
  const totalToday = habits.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#F8FAFC]">Habits</h1>
          <p className="text-sm text-[#475569] mt-0.5">
            {totalToday > 0
              ? `${completedToday}/${totalToday} completed today`
              : 'Create your first habit'}
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-brand/20 text-brand rounded-lg text-sm font-medium hover:bg-brand/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Habit
        </button>
      </div>

      {/* Habits Grid */}
      {habits.length > 0 ? (
        <div className="glass-card p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {habits.map((habit) => (
              <HabitRing
                key={habit.id}
                habit={habit}
                completed={isCompletedToday(habit.id)}
                progress={isCompletedToday(habit.id) ? 1 : 0}
                onClick={() => toggleHabit(habit.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <p className="text-sm text-[#475569] mb-2">No habits yet</p>
          <p className="text-xs text-[#475569]">
            Start tracking your daily routines by adding a habit above
          </p>
        </div>
      )}

      {/* Habit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4">
            <form
              onSubmit={handleCreate}
              className="glass-card p-6 space-y-4 animate-slideUp"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#F8FAFC]">
                  New Habit
                </h2>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="p-1 rounded-lg text-[#475569] hover:text-[#F8FAFC] hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#94A3B8]">Habit name</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Morning run"
                  required
                  className="w-full px-3 py-2 bg-[#131320] border border-border rounded-lg text-sm text-[#F8FAFC] placeholder:text-[#475569] focus:outline-none focus:border-brand/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#94A3B8]">Color</label>
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        color === c
                          ? 'border-white scale-110'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!title.trim()}
                className="w-full py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-all disabled:opacity-50"
              >
                Create Habit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
