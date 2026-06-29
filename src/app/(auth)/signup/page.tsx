'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const supabase = createClient()

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      toast.success('Account created! Check your email to confirm.')
      router.push('/login')
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  const handleFacebookSignup = async () => {
    setOauthLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      toast.error(err.message || 'Facebook signup failed')
      setOauthLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text">11_HOUR</h1>
          <p className="text-sm text-[#94A3B8] mt-2">
            When you&apos;re out of time, we find more.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#F8FAFC]">Create your account</h2>

          {/* Facebook Button */}
          <button
            type="button"
            onClick={handleFacebookSignup}
            disabled={oauthLoading || loading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-white hover:brightness-110"
            style={{ background: '#1877F2' }}
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {oauthLoading ? 'Connecting...' : 'Continue with Facebook'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
            <span className="text-[10px] text-[#475569] uppercase tracking-wider font-medium">or</span>
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[#94A3B8]" htmlFor="fullName">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 bg-[#131320] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#F8FAFC] text-sm placeholder:text-[#475569] focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[#94A3B8]" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3 py-2 bg-[#131320] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#F8FAFC] text-sm placeholder:text-[#475569] focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[#94A3B8]" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              className="w-full px-3 py-2 bg-[#131320] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#F8FAFC] text-sm placeholder:text-[#475569] focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || oauthLoading}
            className="w-full py-2 bg-brand hover:bg-brand-dark text-white rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed glow-brand-sm"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-center text-sm text-[#475569]">
            Already have an account?{' '}
            <Link href="/login" className="text-brand hover:text-brand-light transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
