'use client'

import { useState } from 'react'
import type { Task } from '@/types'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { useTasks } from '@/lib/hooks/useTasks'

interface TaskEditModalProps {
  task: Task
  onClose: () => void
}

export function TaskEditModal({ task, onClose }: TaskEditModalProps) {
  const { updateTask } = useTasks()
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [deadline, setDeadline] = useState(
    task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
  )
  const [importance, setImportance] = useState(task.importance)
  const [estimatedMinutes, setEstimatedMinutes] = useState(task.estimated_minutes)
  const [category, setCategory] = useState(task.category)
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setSaving(true)
    try {
      await updateTask(task.id, {
        title: title.trim(),
        description: description || undefined,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        importance,
        estimated_minutes: estimatedMinutes,
        category,
      })
      toast.success('Task updated')
      onClose()
    } catch {
      toast.error('Failed to update task')
    } finally {
      setSaving(false)
    }
  }

  const categories = ['general', 'work', 'personal', 'health', 'study', 'finance']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4">
        <form onSubmit={handleSave} className="glass-card p-6 space-y-4 animate-slideUp">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#F8FAFC]">Edit Task</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-[#475569] hover:text-[#F8FAFC] hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-[#94A3B8]">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#131320] border border-border rounded-lg text-sm text-[#F8FAFC] placeholder:text-[#475569] focus:outline-none focus:border-brand/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-[#94A3B8]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-[#131320] border border-border rounded-lg text-sm text-[#F8FAFC] placeholder:text-[#475569] focus:outline-none focus:border-brand/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs text-[#94A3B8]">Deadline</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-[#131320] border border-border rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-brand/50 [color-scheme:dark]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#94A3B8]">Est. minutes</label>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                min={1}
                max={1440}
                className="w-full px-3 py-2 bg-[#131320] border border-border rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-brand/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-[#94A3B8]">Importance (1-5)</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setImportance(n)}
                  className={'flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ' + (importance === n ? 'bg-brand/20 text-brand' : 'bg-[#131320] text-[#475569] hover:text-[#94A3B8]')}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-[#94A3B8]">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#131320] border border-border rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-brand/50"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm text-[#94A3B8] border border-border rounded-lg hover:text-[#F8FAFC] hover:bg-surface transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="flex-1 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
