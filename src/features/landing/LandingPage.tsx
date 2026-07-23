/**
 * LandingPage — Premium hero landing with feature highlights
 *
 * First impression page for "The Last Minute Life Saver" theme.
 * Features animated hero, feature cards, and strong CTA.
 */

import React from 'react';
import { Sparkles, ArrowRight, Zap, Brain, Timer, Siren, Shield, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/constants';

const FEATURES = [
  {
    icon: Siren,
    title: 'Emergency Dashboard',
    description:
      'Dedicated red-alert view showing only critical and overdue tasks with live countdowns.',
    color: 'text-defcon-meltdown',
    bgColor: 'bg-defcon-meltdown-bg',
  },
  {
    icon: Brain,
    title: 'AI Brain Dump',
    description:
      'Paste raw notes and let Gemini AI decompose them into structured, prioritized tasks.',
    color: 'text-accent-amber',
    bgColor: 'bg-accent-amber/5',
  },
  {
    icon: Timer,
    title: 'Focus Timer',
    description:
      'Distraction-free execution workspace with countdown rings and micro-step checklists.',
    color: 'text-accent-blue',
    bgColor: 'bg-accent-blue/5',
  },
  {
    icon: Zap,
    title: 'Rapid Capture',
    description: 'One-tap floating button to create urgent tasks in seconds with smart defaults.',
    color: 'text-accent-amber',
    bgColor: 'bg-accent-amber/5',
  },
  {
    icon: Shield,
    title: 'DEFCON Levels',
    description:
      'Urgency engine calculates scores (0-100) and maps to visual meltdown/critical/calm indicators.',
    color: 'text-defcon-critical',
    bgColor: 'bg-defcon-critical-bg',
  },
  {
    icon: TrendingUp,
    title: 'Streak Tracking',
    description: 'Gamified habit tracking with streaks, daily logs, and completion celebrations.',
    color: 'text-accent-emerald',
    bgColor: 'bg-accent-emerald/5',
  },
];

export default function LandingPage(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center px-sys-md">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[65vh] text-center max-w-3xl">
        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-accent-amber/10 text-accent-amber border border-accent-amber/20 mb-6">
          <Sparkles size={12} />
          <span>Hackathon: The Last Minute Life Saver</span>
        </span>

        {/* Title */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-text-primary leading-[1.1]">
          <span className="block">11_HOUR</span>
          <span className="block text-accent-amber text-3xl sm:text-4xl md:text-5xl mt-2 font-semibold">
            Rescue Every Deadline
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-text-muted text-base sm:text-lg leading-relaxed max-w-xl mt-6">
          An AI-powered emergency task manager that absorbs deadline anxiety. Brain dump your chaos,
          let AI structure it, then crush tasks in focused execution sprints.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4 mt-8">
          <button
            id="landing-cta-btn"
            onClick={() => navigate(ROUTES.AUTH)}
            className="
              inline-flex items-center gap-2 px-7 py-3.5 rounded-sys-lg
              bg-accent-amber text-black font-semibold text-base
              hover:bg-accent-amber/90 transition-all duration-200
              hover:shadow-lg hover:shadow-accent-amber/25 hover:scale-[1.02]
              active:scale-[0.98]
            "
          >
            <span>Get Started</span>
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate(ROUTES.AUTH)}
            className="
              inline-flex items-center gap-2 px-6 py-3.5 rounded-sys-lg
              border border-border-muted text-text-primary text-sm font-medium
              hover:bg-bg-secondary transition-all duration-200
            "
          >
            Sign In
          </button>
        </div>

        {/* Urgency animation hint */}
        <div className="flex items-center gap-3 mt-10 text-xs font-mono text-text-muted">
          <span className="inline-block w-2 h-2 rounded-full bg-defcon-meltdown animate-pulse" />
          <span>MELTDOWN</span>
          <span className="inline-block w-2 h-2 rounded-full bg-defcon-critical animate-pulse" />
          <span>CRITICAL</span>
          <span className="inline-block w-2 h-2 rounded-full bg-defcon-elevated" />
          <span>ELEVATED</span>
          <span className="inline-block w-2 h-2 rounded-full bg-defcon-normal" />
          <span>NORMAL</span>
          <span className="inline-block w-2 h-2 rounded-full bg-defcon-calm" />
          <span>CALM</span>
        </div>
      </div>

      {/* Features Grid */}
      <div className="w-full max-w-5xl py-16 border-t border-border-muted">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
            Built for Last-Minute Emergencies
          </h2>
          <p className="text-text-muted text-sm mt-2 max-w-lg mx-auto">
            Every feature is designed to minimize friction and maximize output when time is running
            out.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className={`
                p-5 rounded-sys-lg border border-border-muted
                transition-all duration-200 hover:border-accent-amber/30 hover:shadow-md
                ${feature.bgColor}
              `}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-sys-md ${feature.bgColor}`}>
                  <feature.icon size={18} className={feature.color} />
                </div>
                <h3 className="font-semibold text-text-primary">{feature.title}</h3>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="w-full max-w-3xl py-16 text-center border-t border-border-muted">
        <h2 className="font-display text-2xl font-bold text-text-primary mb-4">
          Stop Panicking. Start Executing.
        </h2>
        <p className="text-text-muted text-sm mb-6">
          Every minute counts. Let AI break down your emergency into actionable steps.
        </p>
        <button
          onClick={() => navigate(ROUTES.AUTH)}
          className="
            inline-flex items-center gap-2 px-7 py-3.5 rounded-sys-lg
            bg-accent-amber text-black font-semibold
            hover:bg-accent-amber/90 transition-all duration-200
            hover:shadow-lg hover:shadow-accent-amber/25
          "
        >
          <Zap size={16} />
          Launch 11_HOUR
        </button>
      </div>
    </div>
  );
}
