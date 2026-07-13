/**
 * 11_HOUR - Runtime Provider & Context
 *
 * Exposes a strongly-typed React Context hook to monitor and trigger
 * runtime diagnostics, manage startup retries, and run automatic self-healing.
 * Integrates an immersive dark glassmorphic bootloader UI.
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { RuntimeContextValue, StartupPhase, DiagnosticMetrics } from './types';
import { BootstrapEngine } from './bootstrapEngine';
import { PHASE_DESCRIPTIONS, RUNTIME_VERSION } from './constants';
import { getDiagnosticReport, attemptSelfHealing } from './diagnostics';

const RuntimeContext = createContext<RuntimeContextValue | null>(null);

/**
 * Custom hook to safely consume the Application Runtime.
 */
export function useRuntime(): RuntimeContextValue {
  const context = useContext(RuntimeContext);
  if (!context) {
    throw new Error('useRuntime must be executed inside a valid <RuntimeProvider> node.');
  }
  return context;
}

interface RuntimeProviderProps {
  children: React.ReactNode;
}

export function RuntimeProvider({ children }: RuntimeProviderProps): React.JSX.Element {
  const [engineState, setEngineState] = useState(() => BootstrapEngine.getState());
  const [diagnostics, setDiagnostics] = useState<DiagnosticMetrics | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [isSelfHealing, setIsSelfHealing] = useState(false);

  // Synchronize state with Bootstrap Engine
  useEffect(() => {
    return BootstrapEngine.subscribe((state) => {
      setEngineState(state);
    });
  }, []);

  // Run bootstrap process on mount
  useEffect(() => {
    if (engineState.status === 'idle') {
      BootstrapEngine.run().catch(() => {
        // Handled internally, logs captured by diagnostics
      });
    }
  }, [engineState.status]);

  /**
   * Generates a complete container health and connectivity diagnostic report.
   */
  const triggerDiagnostics = useCallback(async (): Promise<DiagnosticMetrics> => {
    setIsDiagnosing(true);
    try {
      const activeErrors: string[] = [];
      if (engineState.error) activeErrors.push(engineState.error);
      
      const report = await getDiagnosticReport(
        engineState.phaseMetrics,
        engineState.phaseMetrics.reduce((acc, curr) => acc + curr.durationMs, 0),
        activeErrors
      );
      setDiagnostics(report);
      return report;
    } finally {
      setIsDiagnosing(false);
    }
  }, [engineState.phaseMetrics, engineState.error]);

  /**
   * Triggers the self-healing routine to patch state or connectivity issues.
   */
  const handleSelfHealing = useCallback(async (): Promise<boolean> => {
    setIsSelfHealing(true);
    try {
      const success = await attemptSelfHealing();
      // Re-trigger diagnostics to refresh health score
      await triggerDiagnostics();
      return success;
    } finally {
      setIsSelfHealing(false);
    }
  }, [triggerDiagnostics]);

  /**
   * Resets and restarts the entire bootstrap engine.
   */
  const restartBootstrap = useCallback(async (): Promise<void> => {
    BootstrapEngine.reset();
    setDiagnostics(null);
    // Let the standard effect trigger run() again
  }, []);

  // Pull diagnostics if bootstrap fails
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (engineState.status === 'failed') {
      timer = setTimeout(() => {
        triggerDiagnostics().catch(console.error);
      }, 0);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [engineState.status, triggerDiagnostics]);

  const value = useMemo<RuntimeContextValue>(() => {
    return {
      status: engineState.status,
      currentPhase: engineState.currentPhase,
      completedPhases: engineState.completedPhases,
      config: engineState.config,
      error: engineState.error,
      failedPhase: engineState.failedPhase,
      diagnostics,
      triggerDiagnostics,
      attemptSelfHealing: handleSelfHealing,
      restartBootstrap,
    };
  }, [engineState, diagnostics, triggerDiagnostics, handleSelfHealing, restartBootstrap]);

  // Determine progress percentage
  const totalPhases = Object.keys(StartupPhase).length;
  const progressPercent = Math.min(
    100,
    Math.round((engineState.completedPhases.length / totalPhases) * 100)
  );

  return (
    <RuntimeContext.Provider value={value}>
      <AnimatePresence mode="wait">
        {engineState.status === 'completed' ? (
          <motion.div
            key="app-content"
            id="app-content-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        ) : (
          <motion.div
            key="bootloader-screen"
            id="bootloader-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#090D16] text-[#E2E8F0] overflow-y-auto p-4 font-sans select-none"
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#10B981] opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#06B6D4] opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-xl flex flex-col gap-6 relative z-10 py-8">
              {/* Logo / Brand Header */}
              <div className="flex items-center justify-between border-b border-gray-800/60 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-lg shadow-emerald-950/20">
                    <span className="font-mono text-lg font-black text-black">11</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold tracking-tight text-white leading-none">11_HOUR</h1>
                    <p className="text-[11px] text-gray-500 font-mono mt-0.5 uppercase tracking-wider">The Last-Minute Life Saver</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-gray-900/60 border border-gray-800/80 font-mono text-[10px] text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  RUNTIME v{RUNTIME_VERSION}
                </div>
              </div>

              {/* ACTIVE BOOTSTRAP LOADER VIEW */}
              {engineState.status !== 'failed' && (
                <div className="bg-[#111625]/40 backdrop-blur-md border border-gray-800/80 rounded-xl p-6 shadow-2xl flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                      <span className="text-sm font-semibold text-gray-200">System Core Booting</span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-emerald-400">{progressPercent}%</span>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="w-full h-1.5 bg-gray-950 rounded-full overflow-hidden border border-gray-800/40">
                    <motion.div
                      id="boot-progress-bar"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-[#06B6D4] rounded-full"
                    />
                  </div>

                  {/* Phase List */}
                  <div className="flex flex-col gap-2 bg-gray-950/40 border border-gray-800/20 rounded-lg p-4 font-mono text-[11px] leading-relaxed max-h-56 overflow-y-auto">
                    {Object.keys(StartupPhase).map((phaseKey) => {
                      const phase = phaseKey as StartupPhase;
                      const isCompleted = engineState.completedPhases.includes(phase);
                      const isActive = engineState.currentPhase === phase;
                      const isPending = !isCompleted && !isActive;

                      return (
                        <div
                          key={phase}
                          className={`flex items-start gap-2 transition-all duration-200 ${
                            isActive ? 'text-emerald-400 bg-emerald-950/10 -mx-2 px-2 py-0.5 rounded border-l-2 border-emerald-500' : 'text-gray-500'
                          } ${isCompleted ? 'text-gray-300' : ''}`}
                        >
                          {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />}
                          {isActive && <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0 mt-0.5" />}
                          {isPending && <div className="w-3.5 h-3.5 rounded-full border border-gray-800 shrink-0 mt-0.5" />}
                          
                          <div className="flex-1">
                            <span className="font-semibold tracking-wide text-[10px] uppercase block leading-none mb-0.5">
                              {phase.replace('_', ' ')}
                            </span>
                            {isActive && <span className="text-[10px] text-gray-400 leading-none">{PHASE_DESCRIPTIONS[phase]}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FAILURE RECOVERY & DIAGNOSTICS VIEW */}
              {engineState.status === 'failed' && (
                <div className="flex flex-col gap-5">
                  {/* Failure Banner */}
                  <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-5 shadow-2xl flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#EF4444]/20 flex items-center justify-center shrink-0 border border-[#EF4444]/30">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-sm font-bold text-white tracking-tight">Startup Verification Interrupted</h2>
                      <p className="text-[11px] text-gray-400 font-mono mt-1 leading-relaxed">
                        Failed Phase: <span className="text-[#FCA5A5] uppercase font-bold">{engineState.failedPhase?.replace('_', ' ')}</span>
                      </p>
                      <div className="bg-gray-950 border border-gray-800 rounded p-3 font-mono text-[10px] text-red-400 mt-3 whitespace-pre-wrap break-all leading-normal max-h-36 overflow-y-auto">
                        {engineState.error}
                      </div>
                    </div>
                  </div>

                  {/* Diagnostics Report Card */}
                  {diagnostics && (
                    <div className="bg-[#111625]/40 backdrop-blur-md border border-gray-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold tracking-tight text-gray-200">Runtime Diagnostic Logs</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-900 border border-gray-800 font-mono text-[9px] text-gray-400">
                          CONTAINER HEALTH: 
                          <span className={`font-black ${diagnostics.healthScore > 70 ? 'text-emerald-400' : diagnostics.healthScore > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {diagnostics.healthScore}/100
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[10px] font-mono text-gray-400">
                        <div className="bg-gray-950/60 border border-gray-800/40 rounded p-2.5 flex flex-col gap-1">
                          <span className="text-[9px] uppercase tracking-wider text-gray-500">Device Pipelines</span>
                          <span className="text-gray-200 flex items-center justify-between mt-1">
                            Internet Connection
                            <span className={diagnostics.isOnline ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                              {diagnostics.isOnline ? 'ONLINE' : 'OFFLINE'}
                            </span>
                          </span>
                        </div>
                        <div className="bg-gray-950/60 border border-gray-800/40 rounded p-2.5 flex flex-col gap-1">
                          <span className="text-[9px] uppercase tracking-wider text-gray-500">Cloud Host Infrastructure</span>
                          <span className="text-gray-200 flex items-center justify-between mt-1">
                            Firestore Engine
                            <span className={diagnostics.firebaseConnected ? 'text-emerald-400 font-semibold' : diagnostics.isFirebaseMock ? 'text-yellow-400 font-semibold' : 'text-red-400 font-semibold'}>
                              {diagnostics.isFirebaseMock ? 'MOCK' : diagnostics.firebaseConnected ? 'CONNECTED' : 'DISCONNECTED'}
                            </span>
                          </span>
                        </div>
                        <div className="bg-gray-950/60 border border-gray-800/40 rounded p-2.5 flex flex-col gap-1 col-span-2">
                          <span className="text-[9px] uppercase tracking-wider text-gray-500">State Platform Registry</span>
                          <span className="text-gray-200 flex items-center justify-between mt-1">
                            Registered Stores ({diagnostics.registeredStores.length})
                            <span className={diagnostics.allStoresHydrated ? 'text-emerald-400 font-semibold' : 'text-yellow-400 font-semibold'}>
                              {diagnostics.allStoresHydrated ? 'ALL HYDRATED' : 'HYDRATION DELAYED'}
                            </span>
                          </span>
                          {diagnostics.registeredStores.length > 0 && (
                            <span className="text-[9px] text-gray-500 mt-1 truncate">
                              [{diagnostics.registeredStores.join(', ')}]
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interactive Recovery Options */}
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={handleSelfHealing}
                      disabled={isSelfHealing || isDiagnosing}
                      className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-xs font-semibold text-gray-300 hover:bg-gray-800/80 hover:text-white transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      {isSelfHealing ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      {isSelfHealing ? 'Resolving...' : 'Run Self-Healing'}
                    </button>
                    
                    <button
                      onClick={restartBootstrap}
                      disabled={isSelfHealing || isDiagnosing}
                      className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-black transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/20"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isDiagnosing ? 'animate-spin' : ''}`} />
                      Retry Bootloader
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </RuntimeContext.Provider>
  );
}
