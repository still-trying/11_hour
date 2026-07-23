/**
 * MotivationalTip — Context-aware motivational quotes & tips widget
 *
 * Displays rotating tips for productivity, focus, and urgency management
 * in the sidebar companion area. Auto-rotates and can be manually refreshed.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Sparkles, RefreshCw, Lightbulb, Zap, Brain, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── Tip Collections ─────────────────────────────────────────────────────────

interface Tip {
  text: string;
  icon: React.ElementType;
  category: 'focus' | 'productivity' | 'urgency' | 'mindset' | 'energy';
}

const TIPS: Tip[] = [
  // Focus tips
  { text: 'Single-task, don\'t multi-task. Split your focus into 25-minute sprints.', icon: Timer, category: 'focus' },
  { text: 'The Pomodoro technique works: 25 minutes of focus, 5 minutes of rest.', icon: Timer, category: 'focus' },
  { text: 'Close all tabs except the one you need. Visual clutter = cognitive drag.', icon: Zap, category: 'focus' },
  { text: 'Put your phone face-down and out of reach during focus sessions.', icon: Zap, category: 'focus' },

  // Productivity tips
  { text: 'If a task takes < 2 minutes, do it immediately. Don\'t let it pile up.', icon: Zap, category: 'productivity' },
  { text: 'The 80/20 rule: 80% of results come from 20% of your efforts. Focus on high-impact tasks.', icon: Brain, category: 'productivity' },
  { text: 'Break large tasks into micro-steps. Each tick mark releases dopamine.', icon: Brain, category: 'productivity' },
  { text: 'Eat the frog: do the hardest task first while your willpower is fresh.', icon: Zap, category: 'productivity' },
  { text: 'Set a specific end time for your work session. Parkinson\'s Law: work expands to fill the time.', icon: Timer, category: 'productivity' },

  // Urgency mindset
  { text: 'Deadlines are your ally. They create the pressure needed to overcome inertia.', icon: Sparkles, category: 'urgency' },
  { text: 'Meltdown mode activated? Breathe. Then execute the next single step.', icon: Sparkles, category: 'urgency' },
  { text: 'You don\'t need to be perfect. You just need to ship. Done is better than perfect.', icon: Sparkles, category: 'urgency' },
  { text: 'When overwhelmed, ask: "What is the ONE thing I can do right now?"', icon: Lightbulb, category: 'urgency' },
  { text: 'Stress is a signal that you care. Use it as fuel, not friction.', icon: Sparkles, category: 'urgency' },

  // Mindset
  { text: 'Progress, not perfection. Each small step compounds into momentum.', icon: Lightbulb, category: 'mindset' },
  { text: 'The best time to start was yesterday. The next best time is right now.', icon: Lightbulb, category: 'mindset' },
  { text: 'Motivation follows action. Start before you feel ready.', icon: Zap, category: 'mindset' },
  { text: 'Your brain is wired to avoid hard things. Acknowledge the resistance and move through it.', icon: Brain, category: 'mindset' },
  { text: 'Compare yourself to who you were yesterday, not who someone else is today.', icon: Lightbulb, category: 'mindset' },

  // Energy & wellbeing
  { text: 'Stand up, stretch, and look at something 20 feet away for 20 seconds every 20 minutes.', icon: Timer, category: 'energy' },
  { text: 'Your brain runs on glucose and oxygen. Take a walk and eat something real.', icon: Zap, category: 'energy' },
  { text: 'Hydrate. Even mild dehydration (2%) reduces cognitive performance significantly.', icon: Brain, category: 'energy' },
  { text: 'Deep breaths activate your parasympathetic nervous system. Inhale 4s, hold 4s, exhale 6s.', icon: Timer, category: 'energy' },
  { text: 'Sleep is the ultimate cognitive performance enhancer. Sacrifice sleep, sacrifice IQ.', icon: Lightbulb, category: 'energy' },
];

const CATEGORY_LABELS: Record<string, string> = {
  focus: 'FOCUS',
  productivity: 'PRODUCTIVITY',
  urgency: 'URGENCY',
  mindset: 'MINDSET',
  energy: 'ENERGY',
};

const CATEGORY_COLORS: Record<string, string> = {
  focus: 'text-accent-blue',
  productivity: 'text-accent-amber',
  urgency: 'text-defcon-critical',
  mindset: 'text-accent-emerald',
  energy: 'text-accent-amber',
};

// ─── Component ───────────────────────────────────────────────────────────────

interface MotivationalTipProps {
  /** Auto-rotate interval in ms. Set to 0 to disable auto-rotation. */
  rotationInterval?: number;
}

export function MotivationalTip({ rotationInterval = 45_000 }: MotivationalTipProps): React.JSX.Element {
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentTip = useMemo(() => TIPS[tipIndex], [tipIndex]);
  const Icon = currentTip.icon;

  // Auto-rotate tips
  useEffect(() => {
    if (rotationInterval <= 0) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => {
        let next = prev;
        while (next === prev) {
          next = Math.floor(Math.random() * TIPS.length);
        }
        return next;
      });
    }, rotationInterval);
    return () => clearInterval(interval);
  }, [rotationInterval]);

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTipIndex((prev) => {
      let next = prev;
      while (next === prev) {
        next = Math.floor(Math.random() * TIPS.length);
      }
      return next;
    });
    // Brief refresh animation
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => setIsRefreshing(false), 400);
  }, []);

  // Cleanup refresh timer on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  return (
    <div className="p-sys-md bg-bg-secondary border border-border-muted rounded-sys-lg shadow-sm flex flex-col gap-sys-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-sys-xs">
          <Sparkles size={14} className="text-accent-amber" />
          <span className="font-mono text-[10px] tracking-wider text-text-muted uppercase">
            Tip of the Moment
          </span>
        </div>
        <button
          onClick={handleRefresh}
          className="p-1 text-text-muted hover:text-accent-amber rounded-sys-sm transition-colors hover:bg-bg-primary/50"
          title="Show another tip"
        >
          <RefreshCw
            size={12}
            className={`transition-transform duration-300 ${isRefreshing ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Category badge */}
      <span
        className={`text-[9px] font-mono font-bold uppercase tracking-widest ${CATEGORY_COLORS[currentTip.category]}`}
      >
        {CATEGORY_LABELS[currentTip.category]}
      </span>

      {/* Tip text with fade animation on change */}
      <AnimatePresence mode="wait">
        <motion.p
          key={tipIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="text-xs text-text-primary leading-relaxed"
        >
          {currentTip.text}
        </motion.p>
      </AnimatePresence>

      {/* Icon decoration */}
      <div className="flex items-center justify-end -mb-1">
        <Icon size={14} className="text-text-muted/20" />
      </div>
    </div>
  );
}

export default MotivationalTip;
