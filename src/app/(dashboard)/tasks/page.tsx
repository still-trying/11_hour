'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store/useAppStore'
import { QuickCapture } from '@/components/tasks/QuickCapture'
import { TaskList } from '@/components/tasks/TaskList'
import { Search } from 'lucide-react'

export default function TasksPage() {
  const { tasks } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = searchQuery
    ? tasks.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : tasks

  const activeTasks = filtered.filter((t) => t.status !== 'completed')
  const completedTasks = filtered.filter((t) => t.status === 'completed')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#F8FAFC]">Tasks</h1>
        <p className="text-sm text-[#475569] mt-0.5">
          {tasks.length} total tasks
        </p>
      </div>

      <QuickCapture />

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks by title, category, or description..."
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-[#F8FAFC] placeholder:text-[#475569] focus:outline-none focus:border-brand/50 transition-colors"
        />
      </div>

      {/* DEFCON breakdown */}
      {!searchQuery && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([
            { key: 'meltdown', label: 'Meltdown', count: tasks.filter((t) => t.defcon_level === 'meltdown' && t.status !== 'completed').length, color: '#EF4444' },
            { key: 'critical', label: 'Critical', count: tasks.filter((t) => t.defcon_level === 'critical' && t.status !== 'completed').length, color: '#F97316' },
            { key: 'urgent', label: 'Urgent', count: tasks.filter((t) => t.defcon_level === 'urgent' && t.status !== 'completed').length, color: '#F59E0B' },
            { key: 'total', label: 'Active', count: tasks.filter((t) => t.status !== 'completed').length, color: '#22D3EE' },
          ] as const).map((item) => (
            <div key={item.key} className="glass-card p-3 text-center">
              <span className="text-xl font-bold" style={{ color: item.color }}>{item.count}</span>
              <p className="text-[10px] text-[#475569] mt-0.5 uppercase">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-[#94A3B8] mb-3">Active Tasks</h3>
          <TaskList tasks={activeTasks} />
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-[#94A3B8] mb-3">Completed ({completedTasks.length})</h3>
          <TaskList tasks={completedTasks} />
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && searchQuery && (
        <div className="text-center py-12 glass-card">
          <p className="text-sm text-[#475569]">No tasks match &quot;{searchQuery}&quot;</p>
        </div>
      )}
    </div>
  )
}
