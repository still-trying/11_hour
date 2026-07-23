/**
 * RescuePage — Execution Workspace (Focus Timer)
 *
 * Distraction-free focus mode with countdown timer, micro-step checklist,
 * and task completion celebration. The core "rescue" experience.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Timer, ChevronLeft, Trophy, Sparkles } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasksQuery } from '@/lib/hooks/useTasksQuery';
import { CountdownTimer } from './components/CountdownTimer';
import { MicroStepChecklist } from './components/MicroStepChecklist';
import { DefconBadge } from '@/components/ui/DefconBadge';
import { soundEngine } from '@/lib/utils/sounds';
import { fireConfetti } from '@/lib/utils/confetti';
import type { UrgencyLevel } from '@/lib/utils/urgency';
import type { AiStep } from '@/types';

export default function RescuePage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, completeTask } = useTasksQuery();
  const [isCompleted, setIsCompleted] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);

  // Find the task
  const task = useMemo(() => {
    return tasks.find((t) => t.id === id);
  }, [tasks, id]);

  // Local state for step toggling (optimistic)
  const [localSteps, setLocalSteps] = useState<AiStep[]>(() => []);
  const initializedRef = React.useRef(false);
  const taskId = task?.id;
  const steps = localSteps.length > 0 ? localSteps : (task?.ai_generated_steps ?? []);

  // Initialize local steps when task loads
  React.useEffect(() => {
    if (task?.ai_generated_steps && !initializedRef.current) {
      initializedRef.current = true;
      setLocalSteps(task.ai_generated_steps);
    }
  }, [task?.ai_generated_steps]);

  // Reset initialized state when task changes
  React.useEffect(() => {
    initializedRef.current = false;
  }, [taskId]);

  const handleToggleStep = useCallback((stepId: string) => {
    setLocalSteps((prev) => {
      const step = prev.find((s) => s.id === stepId);
      if (!step?.completed) {
        soundEngine.playClick();
      }
      return prev.map((s) => (s.id === stepId ? { ...s, completed: !s.completed } : s));
    });
  }, []);

  const handleTimerComplete = useCallback(() => {
    setTimerFinished(true);
    // Timer complete sound is handled by CountdownTimer internally
  }, []);

  const handleCompleteTask = useCallback(async () => {
    if (!task) return;
    try {
      await completeTask(task.id);
      setIsCompleted(true);
      soundEngine.playTaskComplete();
      fireConfetti({ particleCount: 80, spread: 90 });
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  }, [task, completeTask]);

  // Duration: use estimated_minutes or default 25 min (pomodoro)
  const durationSeconds = (task?.estimated_minutes ?? 25) * 60;
  const level = (task?.defcon_level || 'calm') as UrgencyLevel;

  if (!task) {
    return (
      <div className="flex flex-col gap-sys-lg p-sys-md items-center justify-center min-h-[400px]">
        <Timer size={48} className="text-text-muted/30" />
        <span className="font-mono text-sm text-text-muted">
          Task not found or still loading...
        </span>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-accent-amber hover:underline font-mono"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  // Completion Screen
  if (isCompleted) {
    return (
      <div className="flex flex-col gap-sys-lg p-sys-md items-center justify-center min-h-[500px]">
        <Trophy size={64} className="text-accent-amber" />
        <h1 className="font-display text-xxxl font-bold text-text-primary text-center">
          Task Rescued! 🎉
        </h1>
        <p className="text-text-muted text-center max-w-md">
          You completed <strong className="text-text-primary">"{task.title}"</strong>. Great work
          staying focused under pressure.
        </p>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="
              px-5 py-2.5 bg-accent-amber text-black font-mono font-bold text-sm
              rounded-sys-md hover:bg-accent-amber/90 transition-all
            "
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate('/emergency')}
            className="
              px-5 py-2.5 border border-border-muted text-text-primary font-mono text-sm
              rounded-sys-md hover:bg-bg-secondary transition-all
            "
          >
            Next Emergency
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-sys-lg p-sys-md max-w-2xl mx-auto">
      {/* Back navigation */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-text-primary transition-colors w-fit"
      >
        <ChevronLeft size={14} />
        Exit Focus Mode
      </button>

      {/* Task Header */}
      <div className="flex flex-col gap-sys-xs border-b border-border-muted pb-sys-sm">
        <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
          <Timer size={14} className="text-accent-blue" />
          <span>FOCUS MODE</span>
          <DefconBadge level={level} size="sm" />
        </div>
        <h1 className="font-display text-xxl font-semibold tracking-tight text-text-primary">
          {task.title}
        </h1>
        {task.description && <p className="text-text-muted text-sm">{task.description}</p>}
      </div>

      {/* Timer */}
      <div className="flex justify-center py-sys-lg">
        <CountdownTimer duration={durationSeconds} onComplete={handleTimerComplete} size={220} />
      </div>

      {/* Timer completion indicator */}
      {timerFinished && (
        <div className="flex items-center justify-center gap-2 py-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
          <span className="text-xs font-mono text-accent-emerald font-semibold tracking-wider uppercase">
            Focus session complete — time to wrap up!
          </span>
        </div>
      )}

      {/* Micro Steps */}
      {steps.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-accent-amber" />
            <span className="text-sm font-mono text-text-muted uppercase tracking-wider">
              AI Micro-Steps
            </span>
          </div>
          <MicroStepChecklist steps={steps} onToggleStep={handleToggleStep} />
        </div>
      )}

      {/* Complete Task Button */}
      <button
        onClick={handleCompleteTask}
        className="
          mt-sys-md w-full py-4 bg-accent-emerald text-black font-mono font-bold text-base
          rounded-sys-lg transition-all
          hover:bg-accent-emerald/90 hover:shadow-lg hover:shadow-accent-emerald/20
          flex items-center justify-center gap-2
        "
      >
        <Trophy size={18} />
        Mark as Rescued ✓
      </button>
    </div>
  );
}
