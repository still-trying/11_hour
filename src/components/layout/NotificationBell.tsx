'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store/useAppStore'
import { Bell, BellRing, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'

export function NotificationBell() {
  const { tasks } = useAppStore()
  const [open, setOpen] = useState(false)

  const meltdownTasks = tasks.filter((t) => t.defcon_level === 'meltdown' && t.status !== 'completed')
  const criticalTasks = tasks.filter((t) => t.defcon_level === 'critical' && t.status !== 'completed')
  const overdueTasks = tasks.filter((t) => t.status === 'overdue')

  const totalAlerts = meltdownTasks.length + criticalTasks.length + overdueTasks.length
  const hasAlerts = totalAlerts > 0

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'relative p-2 rounded-lg transition-all',
          hasAlerts
            ? 'text-defcon-meltdown hover:bg-defcon-meltdown/10'
            : 'text-[#475569] hover:text-[#94A3B8] hover:bg-white/5',
        )}
        aria-label={'Notifications: ' + totalAlerts + ' alerts'}
      >
        {hasAlerts ? (
          <>
            <BellRing className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-defcon-meltdown text-[8px] font-bold text-white flex items-center justify-center">
              {totalAlerts > 9 ? '9+' : totalAlerts}
            </span>
          </>
        ) : (
          <Bell className="w-4 h-4" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 z-50 animate-slideUp">
            <div className="glass-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="text-xs font-medium text-[#F8FAFC]">
                  Alerts {totalAlerts > 0 && '(' + totalAlerts + ')'}
                </span>
                <button onClick={() => setOpen(false)} className="p-0.5 rounded text-[#475569] hover:text-[#F8FAFC]">
                  <X className="w-3 h-3" />
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto">
                {!hasAlerts ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs text-[#475569]">No alerts &mdash; you&apos;re on top of things!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {meltdownTasks.length > 0 && (
                      <div className="px-4 py-3 bg-defcon-meltdown/5">
                        <p className="text-[10px] uppercase text-defcon-meltdown font-semibold mb-1">MELTDOWN</p>
                        {meltdownTasks.slice(0, 3).map((t) => (
                          <p key={t.id} className="text-xs text-[#94A3B8] truncate">{t.title}</p>
                        ))}
                      </div>
                    )}
                    {criticalTasks.length > 0 && (
                      <div className="px-4 py-3 bg-defcon-critical/5">
                        <p className="text-[10px] uppercase text-defcon-critical font-semibold mb-1">CRITICAL</p>
                        {criticalTasks.slice(0, 3).map((t) => (
                          <p key={t.id} className="text-xs text-[#94A3B8] truncate">{t.title}</p>
                        ))}
                      </div>
                    )}
                    {overdueTasks.length > 0 && (
                      <div className="px-4 py-3">
                        <p className="text-[10px] uppercase text-defcon-meltdown font-semibold mb-1">OVERDUE</p>
                        <p className="text-xs text-[#94A3B8]">{overdueTasks.length} task{overdueTasks.length > 1 ? 's' : ''} past deadline</p>
                      </div>
                    )}
                    <div className="px-4 py-2">
                      <Link href="/tasks" onClick={() => setOpen(false)}
                        className="block text-center text-xs text-brand hover:text-brand-light py-1">
                        View all tasks &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
