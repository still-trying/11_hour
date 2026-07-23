import { Component, ErrorInfo, ReactNode } from 'react';
import {
  AlertTriangle,
  RotateCcw,
  Home,
  Terminal,
  ShieldAlert,
  Wifi,
  Database,
} from 'lucide-react';
import { classifyError, BaseResilienceError } from '@/runtime/resilience/errors';
import { RuntimeRecoveryManager } from '@/runtime/resilience/recovery';
import { useUIStore, RuntimeStatus } from '@/stores/uiStore';
import { getDiagnosticReport } from '@/runtime/diagnostics';
import { DiagnosticMetrics } from '@/runtime/types';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  classifiedError: BaseResilienceError | null;
  diagnostics: DiagnosticMetrics | null;
  isSelfHealing: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    classifiedError: null,
    diagnostics: null,
    isSelfHealing: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    const classified = classifyError(error);
    return { hasError: true, classifiedError: classified };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const classified = this.state.classifiedError || classifyError(error);

    // Coordinate with Recovery Manager (logs telemetry, dispatches crash reports)
    RuntimeRecoveryManager.handleFailure(classified, {
      componentStack: errorInfo.componentStack,
    });

    // Mirror to global UI Store to flag the system as failed
    try {
      useUIStore.getState().triggerFatalCrash(classified);
    } catch (e) {
      console.error('Failed to update UIStore from ErrorBoundary:', e);
    }

    // Pull high-fidelity diagnostic metrics
    this.fetchDiagnostics();
  }

  private async fetchDiagnostics() {
    try {
      const activeErrors = this.state.classifiedError ? [this.state.classifiedError.message] : [];
      const report = await getDiagnosticReport([], 0, activeErrors);
      this.setState({ diagnostics: report });
    } catch (e) {
      console.error('Failed to fetch diagnostics for fallback UI:', e);
    }
  }

  private handleSelfHealing = async (): Promise<void> => {
    this.setState({ isSelfHealing: true });
    try {
      const success = await RuntimeRecoveryManager.executeSelfHealingRoutine();
      if (success) {
        // Recover state and reset boundary
        useUIStore.getState().setStatus(RuntimeStatus.READY);
        this.setState({ hasError: false, classifiedError: null, diagnostics: null });
      } else {
        // Refresh diagnostics
        await this.fetchDiagnostics();
      }
    } catch (e) {
      console.error('Self-healing failed during crash recovery:', e);
    } finally {
      this.setState({ isSelfHealing: false });
    }
  };

  private handleReset = (): void => {
    // Purge volatile stores
    RuntimeRecoveryManager.clearVolatileStateCaches();
    this.setState({ hasError: false, classifiedError: null, diagnostics: null });
    // Reset standard uiStore
    try {
      useUIStore.getState().setStatus(RuntimeStatus.READY);
    } catch {
      // Ignored if uiStore is not fully mounted
    }
    window.location.href = '/';
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const err = this.state.classifiedError;
      const diag = this.state.diagnostics;

      return (
        <div className="min-h-screen bg-[#070A13] flex items-center justify-center p-6 text-text-primary select-none font-sans relative overflow-y-auto">
          {/* Ambient Cosmic Background */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#EF4444] opacity-[0.02] rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D97706] opacity-[0.02] rounded-full blur-[120px] pointer-events-none" />

          <div className="w-full max-w-xl p-6 bg-[#111524]/60 backdrop-blur-xl border border-gray-800/80 rounded-2xl shadow-2xl flex flex-col gap-6 relative z-10 my-8">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-800/60 pb-4 text-accent-amber">
              <div className="w-10 h-10 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="text-[#EF4444] w-5 h-5 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <h1 className="font-display font-semibold text-base text-white tracking-tight">
                  System Exception Intercepted
                </h1>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                  CRITICAL RUNTIME SHIELD ACTIVE
                </span>
              </div>
            </div>

            {/* Error Message Slate */}
            <div className="p-4 bg-gray-950/80 border border-gray-800/40 rounded-xl font-mono text-[11px] flex flex-col gap-2 text-gray-400">
              <div className="flex justify-between border-b border-gray-800/60 pb-1.5 text-gray-500 font-bold tracking-wider text-[10px]">
                <span>METRIC</span>
                <span>VALUE</span>
              </div>
              <div className="flex justify-between">
                <span>Correlation ID</span>
                <span className="text-accent-amber font-semibold">{err?.correlationId}</span>
              </div>
              <div className="flex justify-between">
                <span>Domain Class</span>
                <span className="text-red-400 uppercase font-semibold">{err?.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Severity Level</span>
                <span className="text-yellow-500 uppercase font-semibold">{err?.severity}</span>
              </div>
              <div className="flex justify-between">
                <span>Timestamp</span>
                <span>{err?.timestamp ? new Date(err.timestamp).toLocaleTimeString() : ''}</span>
              </div>

              <div className="mt-2 text-gray-200 border-t border-gray-800/60 pt-2 break-all whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto">
                {err?.message || 'An unexpected layout or rendering exception occurred.'}
              </div>
            </div>

            {/* Diagnostics Report Slate */}
            {diag && (
              <div className="bg-[#121626]/40 border border-gray-800/50 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-gray-200 border-b border-gray-800/40 pb-2">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-bold font-mono uppercase tracking-wider">
                    Live Diagnostics
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px] font-mono text-gray-400">
                  <div className="bg-gray-950/40 border border-gray-850/40 p-2 rounded flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <Wifi className="w-3 h-3 text-emerald-500" /> Web Link
                    </span>
                    <span
                      className={
                        diag.isOnline
                          ? 'text-emerald-400 font-semibold'
                          : 'text-red-400 font-semibold'
                      }
                    >
                      {diag.isOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>

                  <div className="bg-gray-950/40 border border-gray-850/40 p-2 rounded flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <Database className="w-3 h-3 text-amber-500" /> Cloud Store
                    </span>
                    <span
                      className={
                        diag.supabaseConnected
                          ? 'text-emerald-400 font-semibold'
                          : diag.isSupabaseMock
                            ? 'text-yellow-500 font-semibold'
                            : 'text-red-400 font-semibold'
                      }
                    >
                      {diag.isSupabaseMock ? 'MOCK' : diag.supabaseConnected ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>

                  <div className="bg-gray-950/40 border border-gray-850/40 p-2 rounded flex items-center justify-between col-span-2">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <ShieldAlert className="w-3 h-3 text-[#EF4444]" /> Platform Health
                    </span>
                    <span
                      className={`font-black ${diag.healthScore > 75 ? 'text-emerald-400' : diag.healthScore > 45 ? 'text-yellow-400' : 'text-red-400'}`}
                    >
                      {diag.healthScore}/100
                    </span>
                  </div>
                </div>
              </div>
            )}

            <p className="text-[11px] text-gray-500 font-mono leading-relaxed text-center">
              Vibe2Ship automated recovery filters are monitoring this crash. You can run automated
              self-healing, retry the sandbox, or escape to the landing zone.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 border-t border-gray-800/60 pt-4">
              <button
                onClick={this.handleSelfHealing}
                disabled={this.state.isSelfHealing}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
              >
                <ShieldAlert size={14} className="text-emerald-400" />
                <span>{this.state.isSelfHealing ? 'Heal Core...' : 'Run Self-Healing'}</span>
              </button>

              <button
                onClick={this.handleReset}
                disabled={this.state.isSelfHealing}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 text-xs font-bold cursor-pointer transition-all shadow-lg shadow-emerald-950/20 disabled:opacity-50"
              >
                <RotateCcw size={14} />
                <span>Reboot Sandbox</span>
              </button>

              <button
                onClick={() => {
                  window.location.hash = '';
                  this.setState({ hasError: false, classifiedError: null, diagnostics: null });
                  window.location.href = '/';
                }}
                disabled={this.state.isSelfHealing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-800 bg-gray-950 text-gray-400 hover:text-gray-200 text-xs font-semibold cursor-pointer transition-all"
              >
                <Home size={14} />
                <span>Exit</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
