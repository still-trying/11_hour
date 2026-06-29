'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-defcon-meltdown/10 border border-defcon-meltdown/25 flex items-center justify-center defcon-meltdown">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-lg font-semibold text-[#F8FAFC] mb-2">
          Dashboard error
        </h2>
        <p className="text-sm text-[#94A3B8] mb-6">
          Something went wrong loading this section. Your data is safe.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2 text-sm bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition-all glow-brand-sm"
          >
            Retry
          </button>
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="px-5 py-2 text-sm text-[#94A3B8] border border-border rounded-lg hover:text-[#F8FAFC] hover:bg-surface transition-all"
          >
            Refresh dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
