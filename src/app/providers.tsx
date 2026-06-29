'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store/useAppStore'
import { Toaster } from 'sonner'

const supabase = createClient()

async function fetchProfile(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export function Providers({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading } = useAppStore()
  const [initialized, setInitialized] = useState(false)

  const handleAuthState = useCallback(
    async (sessionUser: any) => {
      if (sessionUser) {
        setUser(sessionUser)
        const profile = await fetchProfile(sessionUser.id)
        if (profile) setProfile(profile)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    },
    [setUser, setProfile, setLoading],
  )

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        await handleAuthState(session?.user ?? null)
      } catch (err) {
        console.error('Auth initialization error:', err)
      } finally {
        setInitialized(true)
      }
    }

    init()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await handleAuthState(session?.user ?? null)
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [handleAuthState])

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-void">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#475569]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0D0D14',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#F8FAFC',
          },
        }}
      />
    </>
  )
}
