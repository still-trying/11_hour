import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-surface border border-border flex items-center justify-center">
          <span className="text-4xl font-bold gradient-text">404</span>
        </div>
        <h1 className="text-2xl font-bold text-[#F8FAFC] mb-2">
          Page not found
        </h1>
        <p className="text-sm text-[#94A3B8] mb-8">
          This page doesn&apos;t exist or has been moved. Even ELEVEN can&apos;t find it.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 text-sm text-[#94A3B8] border border-border rounded-lg hover:text-[#F8FAFC] hover:bg-surface transition-all"
          >
            Go home
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 text-sm bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition-all glow-brand-sm"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
