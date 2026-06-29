'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { ElevenWidget } from '@/components/dashboard/ElevenWidget'
import { useAppStore } from '@/lib/store/useAppStore'
import { useTasks } from '@/lib/hooks/useTasks'
import { useHabits } from '@/lib/hooks/useHabits'
import { useEffect, useCallback } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { sidebarExpanded, isLoading, setElevenOpen } = useAppStore()
  const { fetchTasks } = useTasks()
  const { fetchHabits, fetchHabitLogs } = useHabits()

  // Load data on mount
  useEffect(() => {
    fetchTasks()
    fetchHabits()
    fetchHabitLogs()
  }, [fetchTasks, fetchHabits, fetchHabitLogs])

  // Global keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
    if (e.metaKey || e.ctrlKey) return

    if (e.key === 'e') {
      e.preventDefault()
      setElevenOpen(true)
    }
  }, [setElevenOpen])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-void">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void">
      <Sidebar />

      <div
        className="transition-all duration-300"
        style={{
          marginLeft: sidebarExpanded ? '14rem' : '4rem',
        }}
      >
        <Navbar />

        <main className="p-6">{children}</main>
      </div>

      {/* ELEVEN AI Chat Widget */}
      <ElevenWidget />
    </div>
  )
}
