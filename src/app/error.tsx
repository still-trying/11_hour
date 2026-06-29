'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('ROOT ERROR BOUNDARY:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0A0A12', color: '#F8FAFC' }}>
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Something broke</h1>
        <p className="text-sm mb-4" style={{ color: '#94A3B8' }}>
          A critical error occurred. Don&apos;t panic — ELEVEN is still here.
        </p>

        {/* Show actual error details for debugging */}
        <div className="text-left mb-6 p-4 rounded-lg overflow-auto max-h-48" style={{ background: '#131320', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs font-mono break-all" style={{ color: '#EF4444' }}>
            {error.message || 'Unknown error'}
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono mt-2" style={{ color: '#475569' }}>
              Digest: {error.digest}
            </p>
          )}
          {error.stack && (
            <pre className="text-[9px] font-mono mt-2 whitespace-pre-wrap break-all" style={{ color: '#475569' }}>
              {error.stack.split('\n').slice(0, 8).join('\n')}
            </pre>
          )}
        </div>

        <button
          onClick={reset}
          className="px-6 py-2.5 text-white rounded-lg font-medium transition-all"
          style={{ background: '#6C63FF' }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
