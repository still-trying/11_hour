import React, { useEffect } from 'react';
import { Activity, ShieldCheck } from 'lucide-react';
import { useSession } from '@/hooks/useSession';

const truncate = (str: string, len: number) => {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '...' : str;
};

/**
 * Standalone diagnostics panel that isolates the 10-second polling interval
 * and useSession subscription from the parent layout tree.
 *
 * By keeping this in a separate component, the ProtectedLayout and all
 * Outlet children no longer re-render every 10 seconds when diagnostics update.
 */
export function DiagnosticsSidebar(): React.JSX.Element {
  const { currentSession, sessionState, isOnline, diagnostics, runDiagnostics, forceRecovery } =
    useSession();

  useEffect(() => {
    runDiagnostics();
    const timer = setInterval(() => {
      runDiagnostics();
    }, 10000);
    return () => clearInterval(timer);
  }, [runDiagnostics]);

  return (
    <div className="p-sys-md bg-bg-secondary/40 border border-border-muted rounded-sys-lg text-xs flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-border-muted/60 pb-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-text-primary">
          <Activity size={13} className="text-accent-amber" />
          <span>Session Diagnostics</span>
        </div>
        <div className="flex items-center gap-1">
          <span
            className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}
          />
          <span className="text-[9px] font-mono uppercase text-text-muted">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {diagnostics ? (
        <div className="flex flex-col gap-2 font-mono text-[10px] text-text-muted">
          <div className="flex items-center justify-between">
            <span>Health Score:</span>
            <span
              className={`font-bold ${diagnostics.healthScore > 80 ? 'text-emerald-400' : diagnostics.healthScore > 50 ? 'text-amber-400' : 'text-red-400'}`}
            >
              {diagnostics.healthScore}/100
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Lifecycle State:</span>
            <span className="text-text-primary uppercase font-bold">{sessionState}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Device Tag:</span>
            <span className="text-text-primary">{truncate(diagnostics.deviceId, 12)}</span>
          </div>
          {currentSession && (
            <div className="flex flex-col gap-0.5 border-t border-border-muted/40 pt-1.5 mt-0.5">
              <div className="flex items-center justify-between">
                <span>Session ID:</span>
                <span className="text-text-primary">{truncate(currentSession.sessionId, 12)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Activity:</span>
                <span className="text-text-primary">
                  {Math.round(diagnostics.timeSinceLastActiveMs / 1000)}s ago
                </span>
              </div>
            </div>
          )}
          <button
            onClick={() => forceRecovery()}
            className="mt-2 w-full py-1.5 px-2 bg-bg-primary/50 hover:bg-bg-primary border border-border-muted rounded-sys-md text-[9px] font-bold text-text-primary transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <ShieldCheck size={11} className="text-emerald-400" />
            Sync & Reconcile
          </button>
        </div>
      ) : (
        <p className="text-text-muted leading-relaxed">Initializing real-time diagnostics...</p>
      )}
    </div>
  );
}

export default DiagnosticsSidebar;
