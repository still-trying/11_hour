import React, { useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { ViewportContainer } from './ViewportContainer';
import { LayoutDashboard, BarChart2, Settings, Compass, Sparkles, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { NAVIGATION_CONFIG } from '@/routes/constants';
import { useSession } from '@/hooks/useSession';

export function ProtectedLayout(): React.JSX.Element {
  const { currentSession, sessionState, isOnline, diagnostics, runDiagnostics, forceRecovery } = useSession();

  useEffect(() => {
    runDiagnostics();
    const timer = setInterval(() => {
      runDiagnostics();
    }, 10000);
    return () => clearInterval(timer);
  }, [runDiagnostics]);

  // Map icons from NAVIGATION_CONFIG to standard Lucide icons
  const getIcon = (name?: string) => {
    switch (name) {
      case 'LayoutDashboard': return <LayoutDashboard size={16} />;
      case 'BarChart2': return <BarChart2 size={16} />;
      case 'Settings': return <Settings size={16} />;
      default: return <Compass size={16} />;
    }
  };

  const truncate = (str: string, len: number) => {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '...' : str;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Central app header */}
      <AppHeader />

      {/* Main Structural Layout Grid */}
      <main className="flex-1">
        <ViewportContainer className="py-sys-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-sys-lg lg:gap-sys-xl items-start">
            
            {/* ==========================================
               LEFT COLUMN (24%): Ingestion & Timeline navigation
               ========================================== */}
            <aside className="lg:col-span-3 flex flex-col gap-sys-md">
              <div className="p-sys-md bg-bg-secondary border border-border-muted rounded-sys-lg shadow-sm flex flex-col gap-sys-sm">
                <span className="text-[10px] font-mono tracking-wider text-text-muted uppercase">
                  Execution Navigation
                </span>
                
                <nav className="flex flex-col gap-1.5" aria-label="Sidebar Navigation">
                  {NAVIGATION_CONFIG.primary.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-sys-sm px-3.5 py-2.5 rounded-sys-md border transition-all duration-150 text-sm font-medium ${
                          isActive
                            ? 'border-accent-amber/30 bg-accent-amber/5 text-text-primary'
                            : 'border-transparent text-text-muted hover:text-text-primary hover:bg-bg-primary/50'
                        } focus-visible:ring-2 focus-visible:ring-accent-amber focus:outline-none`
                      }
                    >
                      {getIcon(item.iconName)}
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>

              {/* Auxiliary Quick Information Area */}
              <div className="p-sys-md bg-bg-secondary/40 border border-border-muted rounded-sys-lg text-xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-border-muted/60 pb-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-text-primary">
                    <Activity size={13} className="text-accent-amber" />
                    <span>Session Diagnostics</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                    <span className="text-[9px] font-mono uppercase text-text-muted">{isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                </div>

                {diagnostics ? (
                  <div className="flex flex-col gap-2 font-mono text-[10px] text-text-muted">
                    <div className="flex items-center justify-between">
                      <span>Health Score:</span>
                      <span className={`font-bold ${diagnostics.healthScore > 80 ? 'text-emerald-400' : diagnostics.healthScore > 50 ? 'text-amber-400' : 'text-red-400'}`}>
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
                  <p className="text-text-muted leading-relaxed">
                    Initializing real-time diagnostics...
                  </p>
                )}
              </div>
            </aside>

            {/* ==========================================
               CENTER COLUMN (52%): The Active Focus Workspace
               ========================================== */}
            <section className="lg:col-span-6 min-h-[50vh] p-sys-lg bg-bg-secondary border border-border-muted rounded-sys-lg shadow-md relative">
              <Outlet />
            </section>

            {/* ==========================================
               RIGHT COLUMN (24%): Smart Assistant & Real-Time Context
               ========================================== */}
            <aside className="lg:col-span-3 flex flex-col gap-sys-md">
              <div className="p-sys-md bg-bg-secondary border border-border-muted rounded-sys-lg shadow-sm flex flex-col gap-sys-sm">
                <div className="flex items-center gap-sys-xs border-b border-border-muted pb-sys-xs text-accent-blue">
                  <Sparkles size={14} className="text-accent-amber" />
                  <span className="font-mono text-[10px] tracking-wider text-text-muted uppercase">
                    Execution Companion
                  </span>
                </div>
                
                <div className="flex flex-col gap-sys-xs text-xs">
                  <div className="font-semibold text-text-primary">Interactive Companion</div>
                  <p className="text-text-muted leading-relaxed">
                    The Smart Assistant will dynamically analyze your requirements and stream contextual 
                    advice during crunches.
                  </p>
                  <div className="p-sys-sm bg-bg-primary/40 border border-border-muted rounded-sys-md mt-1 flex items-start gap-2">
                    <AlertTriangle size={14} className="text-accent-amber shrink-0 mt-0.5" />
                    <span className="text-[10px] font-mono text-text-muted">
                      COMPANION HYDRATION LOCK: HYDRATED IN SLICE 4 (AI ENGINES)
                    </span>
                  </div>
                </div>
              </div>
            </aside>

          </div>
        </ViewportContainer>
      </main>

      <footer className="border-t border-border-muted py-sys-md px-sys-lg bg-bg-secondary text-center text-xs font-mono text-text-muted">
        <span>11_HOUR COGNITIVE CLIENT ENGINE</span>
      </footer>
    </div>
  );
}

export default ProtectedLayout;
