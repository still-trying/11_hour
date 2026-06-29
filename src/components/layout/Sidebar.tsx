'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ListChecks,
  BarChart3,
  RotateCcw,
  CalendarDays,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useAppStore } from '@/lib/store/useAppStore'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: ListChecks },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/habits', label: 'Habits', icon: RotateCcw },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarExpanded, toggleSidebar } = useAppStore()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-surface border-r border-border flex flex-col transition-all duration-300 z-40',
        sidebarExpanded ? 'w-56' : 'w-16',
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center justify-center border-b border-border">
        {sidebarExpanded ? (
          <Link href="/dashboard" className="text-lg font-bold gradient-text">
            11_HOUR
          </Link>
        ) : (
          <Link href="/dashboard" className="text-lg font-bold gradient-text">
            11
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                isActive
                  ? 'bg-brand/10 text-brand'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5',
                !sidebarExpanded && 'justify-center px-0',
              )}
              title={sidebarExpanded ? undefined : item.label}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {sidebarExpanded && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-border">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-[#475569] hover:text-[#94A3B8] hover:bg-white/5 transition-all"
        >
          {sidebarExpanded ? (
            <>
              <span>Collapse</span>
              <span>◀</span>
            </>
          ) : (
            <span>▶</span>
          )}
        </button>
      </div>
    </aside>
  )
}
