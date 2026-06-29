'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store/useAppStore'
import { LogOut, Sparkles } from 'lucide-react'

const supabase = createClient()

export function Navbar() {
  const router = useRouter()
  const { user, profile, tasks, setElevenOpen } = useAppStore()

  const meltdownCount = tasks.filter((t) => t.defcon_level === 'meltdown').length
  const criticalCount = tasks.filter((t) => t.defcon_level === 'critical').length

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="h-14 bg-surface/80 backdrop-blur-sm border-b border-border flex items-center justify-between px-6">
      {/* Left: Greeting */}
      <div>
        <h2 className="text-sm text-[#94A3B8]">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},
          <span className="text-[#F8FAFC] font-medium">
            {' '}{profile?.full_name || user?.email?.split('@')[0] || 'there'}
          </span>
        </h2>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Urgency alert */}
        {(meltdownCount > 0 || criticalCount > 0) && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-defcon-meltdown/10 text-defcon-meltdown text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-defcon-meltdown animate-pulse" />
            {meltdownCount > 0
              ? `${meltdownCount} MELTDOWN`
              : `${criticalCount} CRITICAL`}
          </div>
        )}

        {/* ELEVEN AI */}
        <button
          onClick={() => setElevenOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand/10 text-brand text-xs font-medium hover:bg-brand/20 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          ELEVEN
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-[#475569] hover:text-[#F8FAFC] hover:bg-white/5 transition-all"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
