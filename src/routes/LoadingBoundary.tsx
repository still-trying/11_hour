import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

/**
 * High-fidelity full viewport loading screen designed for Experience OS transitions.
 */
export function LoadingScreen(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full p-8 text-center select-none relative">
      {/* Subtle decorative elements matching dark glassmorphism */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-amber/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col items-center gap-6 max-w-sm relative z-10">
        <div className="relative flex items-center justify-center">
          {/* Outer glowing ring */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.4, 0.1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute w-16 h-16 rounded-full border border-accent-amber/25 blur-sm"
          />
          {/* Inner rotating loader */}
          <Loader2 className="w-8 h-8 text-accent-amber animate-spin relative z-10" />
        </div>
        
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] text-text-muted tracking-[0.2em] uppercase">
            CALIBRATING VIEWPORT
          </span>
          <span className="font-mono text-[10px] text-accent-amber tracking-widest font-bold">
            11_HOUR // INGESTING ENVIRONMENT
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Reusable modern Glassmorphic Skeleton Loader for bento layouts.
 */
export function SkeletonLoader({ className = '' }: { className?: string }): React.JSX.Element {
  return (
    <div 
      className={`relative overflow-hidden bg-bg-secondary/40 backdrop-blur-md border border-border-muted/30 rounded-sys-lg p-sys-md min-h-[150px] ${className}`}
    >
      {/* Animated shimmer sweep */}
      <motion.div
        animate={{ x: ['-100%', '100%'] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"
        style={{ width: '200%' }}
      />
      <div className="flex flex-col gap-sys-sm w-full h-full">
        <div className="h-4 w-1/3 bg-white/5 rounded-full" />
        <div className="h-3 w-3/4 bg-white/5 rounded-full mt-2" />
        <div className="h-3 w-5/6 bg-white/5 rounded-full" />
        <div className="h-10 w-full bg-white/5 rounded-sys-md mt-auto" />
      </div>
    </div>
  );
}

interface LoadingBoundaryProps {
  children: React.ReactNode;
}

/**
 * Suspense Boundary wrapping code-split layout components.
 */
export default function LoadingBoundary({ children }: LoadingBoundaryProps): React.JSX.Element {
  return (
    <React.Suspense fallback={<LoadingScreen />}>
      {children}
    </React.Suspense>
  );
}
