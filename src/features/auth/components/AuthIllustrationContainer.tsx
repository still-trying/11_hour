import React from 'react';
import { motion } from 'motion/react';
import { useTheme } from '@/theme/ThemeContext';
import { Compass, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';

export function AuthIllustrationContainer(): React.JSX.Element {
  const { reducedMotion } = useTheme();

  // Animation parameters supporting reduced motion toggles
  const pulseTransition = reducedMotion
    ? {}
    : {
        animate: {
          scale: [1, 1.02, 1],
          opacity: [0.3, 0.45, 0.3],
        },
        transition: {
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      };

  const floatTransition = (delay: number) =>
    reducedMotion
      ? {}
      : {
          animate: {
            y: [-6, 6, -6],
          },
          transition: {
            duration: 8,
            repeat: Infinity,
            delay,
            ease: 'easeInOut' as const,
          },
        };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-sys-xl bg-bg-secondary/40 backdrop-blur-xl border border-border-muted overflow-hidden rounded-sys-lg select-none min-h-[500px]">
      {/* Background Glowing Ambient Lights (Auroras) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-[20%] -left-[20%] w-[60%] h-[60%] rounded-full bg-accent-amber/15 blur-[120px]"
          {...pulseTransition}
        />
        <motion.div
          className="absolute -bottom-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-accent-blue/10 blur-[120px]"
          {...pulseTransition}
        />
      </div>

      {/* Top Meta info */}
      <div className="relative z-10 flex items-center justify-between font-mono text-[10px] text-text-muted/50 tracking-wider">
        <span className="flex items-center gap-1.5">
          <Compass size={10} className="text-accent-amber animate-spin-slow" />
          SYSTEM_STATE // COGNITIVE_RESCUE
        </span>
        <span className="flex items-center gap-1">
          <ShieldCheck size={10} className="text-accent-emerald" />
          ENCRYPTED_LINK
        </span>
      </div>

      {/* Main Focus Visuals */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-sys-xl my-sys-lg">
        {/* Giant Digital Hourglass/Timer Circle */}
        <div className="relative w-48 h-48 rounded-full border border-border-muted flex items-center justify-center bg-bg-primary/40 backdrop-blur-md shadow-2xl">
          <div className="absolute inset-2 rounded-full border border-dashed border-border-muted/50 animate-spin-slow" />

          <div className="flex flex-col items-center justify-center text-center">
            <span className="font-mono text-xs tracking-widest text-text-muted/60 mb-1 uppercase">
              Deadline Crunch
            </span>
            <span className="font-mono text-3xl font-bold text-text-primary tracking-tighter tabular-nums flex items-center justify-center">
              11 : 00
              <span className="text-accent-amber animate-pulse ml-0.5">:</span>
              <span className="text-xs text-accent-amber align-super ml-1 font-semibold">59</span>
            </span>
            <span className="text-[10px] text-accent-amber font-sans font-medium mt-1 uppercase tracking-wider px-2 py-0.5 bg-accent-amber/10 border border-accent-amber/20 rounded-sys-sm">
              Critical Path Active
            </span>
          </div>

          {/* Glowing orbital micro-dot */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent-amber shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
        </div>

        {/* Floating cards simulation of the cognitive buffer decomposition engine */}
        <div className="w-full max-w-sm flex flex-col gap-sys-sm">
          {/* Card 1: Requirement Processing */}
          <motion.div
            className="flex items-center justify-between p-sys-sm bg-bg-primary/60 backdrop-blur-md border border-border-muted rounded-sys-md shadow-md"
            {...floatTransition(0)}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-accent-blue/10 rounded-sys-sm border border-accent-blue/20">
                <Cpu size={12} className="text-accent-blue" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-text-primary">
                  Parsing "Urgent Brain Dump"
                </span>
                <span className="text-[10px] text-text-muted/70 font-mono">
                  Gemini-2.5-Flash // Decomposing...
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-accent-blue animate-pulse">ANALYZING</span>
          </motion.div>

          {/* Card 2: Micro Step Complete */}
          <motion.div
            className="flex items-center justify-between p-sys-sm bg-bg-primary/60 backdrop-blur-md border border-border-muted rounded-sys-md shadow-md"
            {...floatTransition(1.5)}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-accent-emerald/10 rounded-sys-sm border border-accent-emerald/20">
                <CheckCircle2 size={12} className="text-accent-emerald" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-text-primary">
                  Step 1: Set Up Project Skeleton
                </span>
                <span className="text-[10px] text-text-muted/70 font-sans">
                  Saves 45 minutes of manual overhead
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-accent-emerald uppercase font-medium bg-accent-emerald/10 border border-accent-emerald/20 px-1.5 py-0.5 rounded-sys-sm">
              Rescued
            </span>
          </motion.div>
        </div>
      </div>

      {/* Bottom copy */}
      <div className="relative z-10 flex flex-col gap-1 text-left border-t border-border-muted/30 pt-sys-md">
        <h3 className="font-display font-semibold text-sm text-text-primary tracking-tight">
          A Cognitive Buffer Under Crunch
        </h3>
        <p className="text-[11px] text-text-muted/80 leading-relaxed font-sans">
          When time is your biggest threat, administration is your enemy. 11_HOUR instantly
          structures raw thoughts into micro-tasks, driving immediate, calming execution.
        </p>
      </div>
    </div>
  );
}

export default AuthIllustrationContainer;
