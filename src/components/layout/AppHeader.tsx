import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '@/theme';
import { Sliders, LogOut, ChevronRight, Activity, Zap } from 'lucide-react';
import { getBreadcrumbs } from '@/routes/utils';
import { ROUTES } from '@/routes/constants';

export function AppHeader(): React.JSX.Element {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();

  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="flex items-center justify-between border-b border-border-muted bg-bg-secondary px-sys-md py-3 shadow-md animate-fade-in relative z-50">
      {/* Brand & Breadcrumbs Section */}
      <div className="flex items-center gap-sys-sm">
        <Link
          to={ROUTES.LANDING}
          className="flex items-center gap-2 group focus:outline-none"
          aria-label="11_HOUR Home"
        >
          <div className="w-8 h-8 rounded-sys-md bg-accent-amber flex items-center justify-center transition-all duration-200 group-hover:scale-105 active:scale-95 shadow-md">
            <Zap size={16} className="text-black" />
          </div>
          <span className="font-display font-bold tracking-tight text-text-primary hidden sm:inline">
            11_HOUR
          </span>
        </Link>

        {/* Dynamic Breadcrumbs Separator */}
        <ChevronRight size={14} className="text-text-muted hidden sm:inline" />

        {/* Breadcrumb Trace */}
        <nav
          className="flex items-center font-mono text-xs text-text-muted gap-1 sm:gap-1.5"
          aria-label="Breadcrumbs"
        >
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.path}>
              {i > 0 && <ChevronRight size={12} className="text-text-muted/50" />}
              {crumb.isLast ? (
                <span className="text-text-primary font-medium tracking-tight truncate max-w-[120px] sm:max-w-[200px]">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="hover:text-text-primary focus:outline-none focus:underline hover:underline transition-colors duration-150 truncate max-w-[100px] sm:max-w-[150px]"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-sys-sm">
        {/* Connection status badge (clean/minimal human label) */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-sys-sm bg-bg-primary/50 border border-border-muted text-[10px] font-mono text-text-muted">
          <Activity size={10} className="text-accent-emerald animate-pulse" />
          <span>CONNECTED</span>
        </div>

        {/* Theme Toggler */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-sys-md border border-border-muted bg-bg-primary text-text-muted hover:text-text-primary hover:border-text-muted focus-visible:ring-2 focus-visible:ring-accent-amber focus:outline-none transition-all duration-150 cursor-pointer"
          aria-label="Cycle UI theme preset"
        >
          <Sliders size={14} className="text-accent-amber" />
        </button>

        {/* Mock auth status / sign out */}
        <button
          onClick={() => {
            navigate(ROUTES.AUTH);
          }}
          className="p-2 rounded-sys-md border border-border-muted bg-bg-primary text-text-muted hover:text-accent-amber hover:border-accent-amber/30 focus-visible:ring-2 focus-visible:ring-accent-amber focus:outline-none transition-all duration-150 cursor-pointer"
          aria-label="Authenticate session"
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}
export default AppHeader;
