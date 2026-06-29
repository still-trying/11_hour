import Link from 'next/link'
import { Sparkles, Gauge, Target, Brain, ArrowRight } from 'lucide-react'
import dynamic from 'next/dynamic'

const HeroScene = dynamic(() => import('@/components/3d/HeroScene'), { ssr: false })

const features = [
  {
    icon: Gauge,
    title: 'Urgency Engine',
    description:
      'Real-time DEFCON urgency scoring that tells you exactly what to work on first.',
    color: '#EF4444',
  },
  {
    icon: Brain,
    title: 'ELEVEN AI',
    description:
      'Your personal AI companion that knows your tasks and helps you crush them.',
    color: '#6C63FF',
  },
  {
    icon: Target,
    title: 'Smart Habits',
    description:
      'Track daily habits with beautiful rings and build streaks that last.',
    color: '#10B981',
  },
]

const stats = [
  { label: 'Avg Completion Rate', value: '87%' },
  { label: 'Tasks Created', value: '10K+' },
  { label: 'Active Users', value: '500+' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-void">
      {/* 3D Background */}
      <HeroScene />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-void/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold gradient-text">
            11_HOUR
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm px-4 py-1.5 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition-all glow-brand-sm"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Tagline */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span className="text-xs text-brand font-medium">
              AI-Powered Productivity
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#F8FAFC] leading-tight mb-4">
            When you&apos;re out of
            <span className="gradient-text"> time</span>,
            <br />
            we find more.
          </h1>

          <p className="text-lg text-[#94A3B8] max-w-2xl mx-auto mb-8">
            Stop missing deadlines. 11_HOUR transforms panic into action with
            AI-powered urgency scoring, smart task management, and a companion
            that actually understands your workload.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition-all glow-brand"
            >
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 text-sm text-[#94A3B8] hover:text-[#F8FAFC] border border-border rounded-lg transition-all"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-20 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-[#F8FAFC] text-center mb-12">
            Everything you need to ship on time
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="glass-card p-6 hover:translate-y-[-2px] transition-all duration-300"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{
                      backgroundColor: `${feature.color}15`,
                      color: feature.color,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#F8FAFC] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#94A3B8]">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative py-20 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <div className="grid grid-cols-3 gap-8 mb-12">
            {stats.map((stat) => (
              <div key={stat.label}>
                <span className="text-3xl font-bold gradient-text">{stat.value}</span>
                <p className="text-xs text-[#475569] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="glass-card p-8 max-w-lg mx-auto">
            <p className="text-sm text-[#94A3B8] italic leading-relaxed">
              &ldquo;11_HOUR literally saved my thesis. The urgency meter kept me
              from procrastinating, and ELEVEN broke down my impossible task
              list into actual steps I could follow.&rdquo;
            </p>
            <p className="text-sm text-[#F8FAFC] mt-4 font-medium">
              — Alex M., Graduate Student
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#F8FAFC] mb-4">
            Ready to stop missing deadlines?
          </h2>
          <p className="text-[#94A3B8] mb-8">
            Join 500+ people who use 11_HOUR to stay ahead of their workload.
            Free to start, no credit card needed.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition-all glow-brand text-lg"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-sm text-[#475569]">
            Built for Vibe2Ship Hackathon
          </span>
          <span className="text-sm gradient-text font-medium">11_HOUR</span>
        </div>
      </footer>
    </div>
  )
}
