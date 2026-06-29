'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="bg-void text-[#F8FAFC]">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-defcon-meltdown/10 border border-defcon-meltdown/20 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Something broke</h1>
            <p className="text-sm text-[#94A3B8] mb-2">
              A critical error occurred. Don&apos;t panic — ELEVEN is still here.
            </p>
            {error.digest && (
              <p className="text-[10px] text-[#475569] mb-6 font-mono">
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              className="px-6 py-2.5 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition-all glow-brand-sm"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
