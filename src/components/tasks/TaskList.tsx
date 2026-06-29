'use client'

import { useState } from 'react'
import type { Task } from '@/types'
import { TaskCard } from './TaskCard'
import { TaskEditModal } from './TaskEditModal'
import { useTasks } from '@/lib/hooks/useTasks'
import { cn } from '@/lib/utils/cn'
import { Filter, ArrowUpDown } from 'lucide-react'

type SortOption = 'urgency' | 'deadline' | 'created'
type FilterOption = 'all' | 'meltdown' | 'critical' | 'pending' | 'completed'

export function TaskList({ tasks: propTasks }: { tasks: Task[] }) {
  const { completeTask, deleteTask } = useTasks()
  const [sortBy, setSortBy] = useState<SortOption>('urgency')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Sort tasks
  const sorted = [...propTasks].sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      case 'created':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'urgency':
      default:
        return b.urgency_score - a.urgency_score
    }
  })

  // Filter tasks
  const filtered = sorted.filter((task) => {
    switch (filterBy) {
      case 'meltdown':
        return task.defcon_level === 'meltdown'
      case 'critical':
        return task.defcon_level === 'critical'
      case 'pending':
        return task.status === 'pending' || task.status === 'in_progress'
      case 'completed':
        return task.status === 'completed'
      default:
        return true
    }
  })

  const filterOptions: { value: FilterOption; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'meltdown', label: 'Meltdown' },
    { value: 'critical', label: 'Critical' },
    { value: 'pending', label: 'Active' },
    { value: 'completed', label: 'Done' },
  ]

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-surface rounded-lg p-0.5">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterBy(opt.value)}
              className={cn(
                'px-2.5 py-1 text-xs rounded-md transition-all',
                filterBy === opt.value
                  ? 'bg-brand/20 text-brand'
                  : 'text-[#475569] hover:text-[#94A3B8]',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            const options: SortOption[] = ['urgency', 'deadline', 'created']
            const idx = options.indexOf(sortBy)
            setSortBy(options[(idx + 1) % options.length])
          }}
          className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#475569] hover:text-[#94A3B8] bg-surface rounded-lg transition-all"
        >
          <ArrowUpDown className="w-3 h-3" />
          {sortBy}
        </button>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-surface flex items-center justify-center">
            <Filter className="w-5 h-5 text-[#475569]" />
          </div>
          <p className="text-sm text-[#475569]">No tasks found</p>
          <p className="text-xs text-[#475569] mt-1">
            {filterBy === 'all'
              ? 'Create a task using the input above'
              : 'Try a different filter'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={completeTask}
              onDelete={deleteTask}
              onEdit={setEditingTask}
              expanded={expandedTask === task.id}
              onToggleExpand={(id) =>
                setExpandedTask(expandedTask === id ? null : id)
              }
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingTask && (
        <TaskEditModal task={editingTask} onClose={() => setEditingTask(null)} />
      )}
    </div>
  )
}
