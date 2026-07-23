import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  WifiOff,
  AlertTriangle,
  Wrench,
  X,
  Activity,
  CheckCircle2,
  AlertCircle,
  Info,
  Cpu,
  RefreshCw as ResetIcon,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useNotificationStore, ToastNotification } from '@/stores/notificationStore';
import { StoreRegistry } from '@/stores/platform/storeRegistry';
import { classifyError } from '@/runtime/resilience/errors';

/**
 * Global Resilience & Diagnostics Overlay Module.
 * Integrates toasts, maintenance-shield, and interactive developer panel.
 */
export function RuntimeOverlay(): React.JSX.Element {
  const {
    status,
    isOnline,
    isMaintenance,
    showDiagnosticOverlay,
    setOnline,
    setMaintenance,
    triggerFatalCrash,
    recoverFromCrash,
    toggleDiagnosticOverlay,
  } = useUIStore();
  const { notifications, dismissNotification, addNotification } = useNotificationStore();

  // Compute store hydration stats dynamically on-demand during render
  const activeStoreStats = showDiagnosticOverlay
    ? StoreRegistry.getRegisteredStoreNames().map((name) => {
        const entry = StoreRegistry.get(name);
        return {
          name,
          hydrated: entry?.isHydrated() ?? false,
        };
      })
    : [];

  // Handle mock error generation for testing resilience
  const triggerMockError = (type: string) => {
    try {
      if (type === 'network') {
        setOnline(false);
      } else if (type === 'database') {
        const mockDbError = new Error(
          'DatabaseError: PostgREST returned 401 — invalid or expired API key.',
        );
        throw mockDbError;
      } else if (type === 'ai') {
        throw new Error(
          'Gemini model quota exceeded: RESOURCE_EXHAUSTED. Please verify API rate budget.',
        );
      } else if (type === 'validation') {
        throw new Error(
          'ValidationError: Zod parsing failed. Required key "targetDeadline" is invalid date-string.',
        );
      } else {
        throw new Error('Unspecified fatal component exception inside layout tree.');
      }
    } catch (err) {
      const classified = classifyError(err);
      addNotification(`Simulated ${classified.category} failure triggered.`, 'warning', 4000);
      if (
        classified.severity === 'FATAL' ||
        classified.category === 'PERMISSION' ||
        type === 'fatal'
      ) {
        triggerFatalCrash(classified);
      }
    }
  };

  const isDev = import.meta.env.MODE === 'development' || import.meta.env.DEV;

  return (
    <>
      {/* ==========================================
         TOAST NOTIFICATIONS INFRASTRUCTURE
         ========================================== */}
      <div
        id="toast-notification-layer"
        className="fixed top-5 right-5 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none"
      >
        <AnimatePresence>
          {notifications.map((notif: ToastNotification) => {
            const iconMap = {
              info: <Info className="w-4 h-4 text-accent-blue" />,
              success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
              warning: <AlertTriangle className="w-4 h-4 text-accent-amber" />,
              error: <AlertCircle className="w-4 h-4 text-[#EF4444]" />,
            };

            const bgClass = {
              info: 'bg-[#121B2F]/90 border-blue-800/40',
              success: 'bg-[#0E251A]/90 border-emerald-800/40',
              warning: 'bg-[#291F11]/90 border-amber-800/40',
              error: 'bg-[#2D1418]/90 border-red-800/40',
            }[notif.type];

            return (
              <motion.div
                key={notif.id}
                id={`toast-${notif.id}`}
                layout
                initial={{ opacity: 0, y: -15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-md shadow-lg flex items-start gap-3 justify-between ${bgClass}`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="shrink-0 mt-0.5">{iconMap[notif.type]}</div>
                  <div className="flex flex-col">
                    <p className="text-xs font-semibold text-white leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[8px] font-mono text-gray-500 mt-1 uppercase tracking-wider">
                      {notif.id} • {new Date(notif.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => dismissNotification(notif.id)}
                  className="text-gray-500 hover:text-white shrink-0 p-0.5 rounded hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ==========================================
         OFFLINE STATE TOP NOTIFICATION BAR
         ========================================== */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            id="offline-safety-banner"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-0 left-0 right-0 z-50 bg-[#EF4444]/20 backdrop-blur-md border-b border-[#EF4444]/30 py-2 px-4 flex items-center justify-center gap-2 font-sans select-none text-center"
          >
            <WifiOff className="w-4 h-4 text-red-500 animate-pulse shrink-0" />
            <span className="font-mono text-[10px] text-red-400 tracking-wider uppercase font-semibold">
              Offline Workspace Status Active — Synchronizations Paused • Updates Saved Locally
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==========================================
         MAINTENANCE MODE SHIELD
         ========================================== */}
      <AnimatePresence>
        {isMaintenance && (
          <motion.div
            key="maintenance-shield-screen"
            id="maintenance-shield"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99] bg-[#070A14] flex items-center justify-center p-6 text-[#E2E8F0] select-none font-sans"
          >
            {/* Background glowing effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-amber/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md p-6 bg-[#111524]/50 border border-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col items-center text-center gap-5 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center shadow-lg shadow-amber-950/20">
                <Wrench className="w-6 h-6 text-accent-amber animate-pulse" />
              </div>

              <div className="flex flex-col gap-1.5">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  System Under Maintenance
                </h1>
                <p className="text-[11px] text-gray-500 font-mono tracking-widest uppercase mt-0.5">
                  11_HOUR // WORKSPACE ADJUSTMENTS
                </p>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                Core database connections and execution loops are being fine-tuned to maintain
                absolute robust integrity. Standard workspaces are temporarily shielded to prevent
                save state conflicts.
              </p>

              <div className="bg-gray-950/60 border border-gray-800/50 rounded-lg p-3 w-full font-mono text-[10px] text-accent-amber/80 flex items-center justify-center gap-2">
                <Activity className="w-3.5 h-3.5 text-accent-amber shrink-0 animate-spin" />
                SYSTEM LOCKOUT ACTIVE • RETRY LATER
              </div>

              {/* Developer Bypass Shortcut for sandbox testing */}
              {isDev && (
                <button
                  onClick={() => setMaintenance(false)}
                  className="mt-4 text-[10px] font-mono text-gray-600 hover:text-gray-400 underline cursor-pointer"
                >
                  [DEVELOPER BYPASS LOCKOUT]
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==========================================
         DIAGNOSTIC OVERLAY (DEVELOPMENT PANEL)
         ========================================== */}
      {isDev && (
        <div className="fixed bottom-4 right-4 z-[95] flex flex-col items-end gap-2 font-sans select-none pointer-events-none">
          <AnimatePresence>
            {showDiagnosticOverlay && (
              <motion.div
                key="diagnostic-dashboard"
                id="diagnostic-overlay-panel"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="pointer-events-auto w-80 bg-[#101423]/95 border border-gray-800 rounded-xl p-4 shadow-2xl flex flex-col gap-4 text-xs backdrop-blur-md"
              >
                <div className="flex items-center justify-between border-b border-gray-800/60 pb-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-accent-amber" />
                    <span className="font-bold text-gray-200 uppercase tracking-tight">
                      Diagnostic Control
                    </span>
                  </div>
                  <button
                    onClick={toggleDiagnosticOverlay}
                    className="text-gray-500 hover:text-white rounded p-0.5 hover:bg-white/5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* State Introspection */}
                <div className="flex flex-col gap-1 font-mono text-[10px] text-gray-400 bg-gray-950/60 border border-gray-950 p-2.5 rounded-lg">
                  <div className="flex justify-between">
                    <span>SYSTEM STATE</span>
                    <span className="text-accent-amber font-bold uppercase">{status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>NETWORK STATUS</span>
                    <span
                      className={isOnline ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}
                    >
                      {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>MAINTENANCE BLOCK</span>
                    <span
                      className={
                        isMaintenance ? 'text-accent-amber font-bold' : 'text-gray-500 font-bold'
                      }
                    >
                      {isMaintenance ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>

                {/* Simulated Fault Inducers */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Inject Fault Simulations
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                    <button
                      onClick={() => setOnline(!isOnline)}
                      className={`py-1.5 px-2 rounded border cursor-pointer text-left transition-all ${
                        isOnline
                          ? 'bg-gray-950/40 border-gray-850 hover:bg-gray-900 text-gray-300'
                          : 'bg-red-950/20 border-red-900/30 text-red-400'
                      }`}
                    >
                      Toggle {isOnline ? 'Offline' : 'Online'}
                    </button>
                    <button
                      onClick={() => setMaintenance(!isMaintenance)}
                      className={`py-1.5 px-2 rounded border cursor-pointer text-left transition-all ${
                        isMaintenance
                          ? 'bg-amber-950/20 border-amber-900/30 text-amber-400'
                          : 'bg-gray-950/40 border-gray-850 hover:bg-gray-900 text-gray-300'
                      }`}
                    >
                      Toggle Maintenance
                    </button>
                    <button
                      onClick={() => triggerMockError('database')}
                      className="py-1.5 px-2 rounded border border-gray-850 bg-gray-950/40 text-gray-300 hover:bg-gray-900 text-left cursor-pointer"
                    >
                      Mock Database Err
                    </button>
                    <button
                      onClick={() => triggerMockError('ai')}
                      className="py-1.5 px-2 rounded border border-gray-850 bg-gray-950/40 text-gray-300 hover:bg-gray-900 text-left cursor-pointer"
                    >
                      Mock Gemini Err
                    </button>
                    <button
                      onClick={() => triggerMockError('validation')}
                      className="py-1.5 px-2 rounded border border-gray-850 bg-gray-950/40 text-gray-300 hover:bg-gray-900 text-left cursor-pointer"
                    >
                      Mock Validation Err
                    </button>
                    <button
                      onClick={() => triggerMockError('fatal')}
                      className="py-1.5 px-2 rounded border border-red-900/30 bg-red-950/10 text-red-400 hover:bg-red-950/20 text-left cursor-pointer"
                    >
                      Induce Crash Boundary
                    </button>
                  </div>
                </div>

                {/* State Store Hydrations */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Hydration Monitor
                  </span>
                  <div className="flex flex-col gap-1 max-h-24 overflow-y-auto bg-gray-950/30 rounded p-2 border border-gray-800/40 font-mono text-[9px] leading-relaxed">
                    {activeStoreStats.map((st) => (
                      <div key={st.name} className="flex justify-between items-center">
                        <span className="text-gray-500 text-[8px] truncate max-w-[170px]">
                          {st.name}
                        </span>
                        <span
                          className={
                            st.hydrated ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'
                          }
                        >
                          {st.hydrated ? 'HYDRATED' : 'STALE'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Controls */}
                <div className="flex gap-2 justify-end border-t border-gray-800/40 pt-2.5">
                  <button
                    onClick={async () => {
                      addNotification('Forcing manual state recovery reboot...', 'info', 3000);
                      await recoverFromCrash();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 text-[10px] font-bold cursor-pointer transition-all"
                  >
                    <ResetIcon className="w-3 h-3 animate-spin" /> Force Healing
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating trigger toggle */}
          <button
            onClick={toggleDiagnosticOverlay}
            className="pointer-events-auto px-3.5 py-2 rounded-full bg-gray-950 hover:bg-gray-900 border border-gray-800 flex items-center gap-2 text-[11px] font-mono font-bold text-gray-300 shadow-xl shadow-black/40 hover:text-white transition-all cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-accent-amber" />
            <span>{showDiagnosticOverlay ? 'Close' : 'Resilience Diagnostics'}</span>
          </button>
        </div>
      )}
    </>
  );
}

export default RuntimeOverlay;
