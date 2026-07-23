/**
 * CountdownTimer — Circular SVG countdown component
 *
 * A visual countdown ring that fills as time progresses. Used in the
 * Execution Workspace (RescuePage) for focused task completion.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '@/lib/utils/sounds';

interface CountdownTimerProps {
  /** Duration in seconds */
  duration: number;
  /** Called when timer reaches zero */
  onComplete?: () => void;
  /** Auto-start the timer */
  autoStart?: boolean;
  /** Size of the timer ring */
  size?: number;
}

export function CountdownTimer({
  duration,
  onComplete,
  autoStart = false,
  size = 200,
}: CountdownTimerProps): React.JSX.Element {
  const [remaining, setRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress = 1 - remaining / duration;
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {              setRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            soundEngine.playTimerComplete();
            onComplete?.();
            return 0;
          }
          // Play tick sound in the last 10 seconds
          if (prev <= 11 && prev > 1) {
            soundEngine.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, remaining, onComplete]);

  const toggleTimer = useCallback(() => {
    setIsRunning((prev) => {
      if (!prev) soundEngine.playClick();
      return !prev;
    });
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setRemaining(duration);
    if (intervalRef.current) clearInterval(intervalRef.current);
    soundEngine.playClick();
  }, [duration]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  // Color based on progress
  const getColor = () => {
    if (progress >= 0.9) return 'var(--sys-color-defcon-meltdown)';
    if (progress >= 0.7) return 'var(--sys-color-defcon-critical)';
    if (progress >= 0.5) return 'var(--sys-color-defcon-elevated)';
    return 'var(--sys-color-accent-amber)';
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* SVG Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--sys-color-border-muted)"
            strokeWidth="6"
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Center Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-mono text-4xl font-bold text-text-primary"
            style={{
              animation:
                remaining <= 60 && isRunning
                  ? 'countdown-pulse 1s ease-in-out infinite'
                  : undefined,
            }}
          >
            {pad(minutes)}:{pad(seconds)}
          </span>
          <span className="text-xs font-mono text-text-muted mt-1">
            {isRunning ? 'FOCUSING' : remaining === 0 ? 'COMPLETE' : 'PAUSED'}
          </span>
        </div>
      </div>

      {/* Sound toggle indicator */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-muted/50">
        {soundEngine.enabled ? (
          <Volume2 size={10} className="text-accent-emerald/50" />
        ) : (
          <VolumeX size={10} className="text-text-muted/30" />
        )}
        <span>SOUND {soundEngine.enabled ? 'ON' : 'OFF'}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTimer}
          disabled={remaining === 0}
          className="
            flex items-center gap-2 px-5 py-2.5
            bg-accent-amber text-black font-mono font-bold text-sm
            rounded-sys-md transition-all
            hover:bg-accent-amber/90 hover:shadow-lg hover:shadow-accent-amber/20
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
          {isRunning ? 'Pause' : remaining === 0 ? 'Done' : 'Start'}
        </button>

        <button
          onClick={resetTimer}
          className="
            p-2.5 text-text-muted hover:text-text-primary
            border border-border-muted rounded-sys-md
            transition-colors
          "
          title="Reset timer"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}

export default CountdownTimer;
