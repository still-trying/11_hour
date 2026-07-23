import React, { useState, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { AppHeader } from './AppHeader';
import { ViewportContainer } from './ViewportContainer';
import {
  LayoutDashboard,
  BarChart2,
  Settings,
  Compass,
  Siren,
  Keyboard,
} from 'lucide-react';
import { DiagnosticsSidebar } from './DiagnosticsSidebar';
import { NAVIGATION_CONFIG, ROUTES } from '@/routes/constants';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { HotkeysHelpModal } from '@/components/ui/HotkeysHelpModal';
import { MotivationalTip } from '@/components/ui/MotivationalTip';
import { useHotkeys, type HotkeyBinding } from '@/hooks/useHotkeys';
import { useTasksQuery } from '@/lib/hooks/useTasksQuery';
import { useBrowserNotifications } from '@/hooks/useBrowserNotifications';

export function ProtectedLayout(): React.JSX.Element {
  const navigate = useNavigate();
  const [showHotkeys, setShowHotkeys] = useState(false);
  const toggleHotkeys = useCallback(() => setShowHotkeys((v) => !v), []);

  // Map icons from NAVIGATION_CONFIG to standard Lucide icons
  const getIcon = (name?: string) => {
    switch (name) {
      case 'LayoutDashboard':
        return <LayoutDashboard size={16} />;
      case 'BarChart2':
        return <BarChart2 size={16} />;
      case 'Settings':
        return <Settings size={16} />;
      case 'Siren':
        return <Siren size={16} />;
      default:
        return <Compass size={16} />;
    }
  };

  // Define all keyboard shortcuts
  const hotkeyBindings: HotkeyBinding[] = [
    // Navigation — go-to sequences
    { keys: ['g', 'd'], handler: () => navigate(ROUTES.DASHBOARD), label: 'Go to Dashboard', category: 'Navigation' },
    { keys: ['g', 'e'], handler: () => navigate(ROUTES.EMERGENCY), label: 'Go to Emergency', category: 'Navigation' },
    { keys: ['g', 'a'], handler: () => navigate(ROUTES.ANALYTICS), label: 'Go to Analytics', category: 'Navigation' },
    { keys: ['g', 's'], handler: () => navigate(ROUTES.SETTINGS), label: 'Go to Settings', category: 'Navigation' },
    { keys: ['g', 'c'], handler: () => navigate(ROUTES.RESCUE_CREATE), label: 'Create Rescue', category: 'Navigation' },
    // Actions
    { keys: ['n'], handler: () => {
      // Dispatch a custom event that FloatingActionButton listens to
      window.dispatchEvent(new CustomEvent('11hour:open-quick-add'));
    }, label: 'New Task', category: 'Actions', ignoreInputs: true },
    { keys: ['shift', '/'], handler: () => toggleHotkeys(), label: 'Show Keyboard Shortcuts', category: 'General' },
  ];

  useHotkeys(hotkeyBindings);

  // Browser push notifications for urgent tasks
  const { tasks } = useTasksQuery();
  // Read notification settings fresh on each render to stay in sync with SettingsPage
  const getNotifSettings = () => {
    try {
      const raw = localStorage.getItem('11hour_notif_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          enabled: typeof parsed.notifications === 'boolean' ? parsed.notifications : true,
          meltdownAlerts: typeof parsed.meltdownAlerts === 'boolean' ? parsed.meltdownAlerts : true,
        };
      }
    } catch {
      // Ignore parse errors — use defaults
    }
    return { enabled: true, meltdownAlerts: true };
  };

  useBrowserNotifications(tasks, {
    enabled: getNotifSettings().enabled,
    meltdownAlerts: getNotifSettings().meltdownAlerts,
  });

  return (
    <>
      {/* Keyboard Shortcuts Help Modal */}
      <AnimatePresence>
        {showHotkeys && (
          <HotkeysHelpModal isOpen={showHotkeys} onClose={() => setShowHotkeys(false)} bindings={hotkeyBindings} />
        )}
      </AnimatePresence>
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

                  {/* Hotkeys hint */}
                  <button
                    onClick={() => setShowHotkeys(true)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-sys-md border border-dashed border-border-muted/60 text-text-muted hover:text-accent-amber hover:border-accent-amber/30 text-[11px] font-mono transition-all cursor-pointer mt-1"
                  >
                    <Keyboard size={12} />
                    <span>Shortcuts</span>
                    <kbd className="ml-auto px-1.5 py-0.5 bg-bg-primary border border-border-muted rounded-sys-sm text-[9px] text-accent-amber">
                      ?
                    </kbd>
                  </button>
                </div>

                {/* Auxiliary Quick Information Area (isolated from layout re-renders) */}
                <DiagnosticsSidebar />
              </aside>

              {/* ==========================================
               CENTER COLUMN (52%): The Active Focus Workspace
               ========================================== */}
              <section className="lg:col-span-6 min-h-[50vh] p-sys-lg bg-bg-secondary border border-border-muted rounded-sys-lg shadow-md relative">
                <Outlet />
              </section>

              {/* ==========================================
               RIGHT COLUMN (24%): Motivational Tips & Real-Time Context
               ========================================== */}
              <aside className="lg:col-span-3 flex flex-col gap-sys-md">
                <MotivationalTip rotationInterval={45_000} />
              </aside>
            </div>
          </ViewportContainer>
        </main>

        <footer className="border-t border-border-muted py-sys-md px-sys-lg bg-bg-secondary text-center text-xs font-mono text-text-muted">
          <span>11_HOUR COGNITIVE CLIENT ENGINE</span>
        </footer>
      </div>

      {/* Floating Action Button for rapid task creation */}
      <FloatingActionButton />
    </>
  );
}

export default ProtectedLayout;
