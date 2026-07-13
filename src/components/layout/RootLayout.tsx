import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from '@/routes/ErrorBoundary';
import { DocumentTitleSync, useScrollRestoration } from '@/routes/utils';
import { useUIStore } from '@/stores/uiStore';
import { RuntimeOverlay } from '@/components/layout/RuntimeOverlay';

export function RootLayout(): React.JSX.Element {
  // Activate scroll restoration on route location transitions
  useScrollRestoration();

  // Activate hardware-level browser connection detection on mount
  useEffect(() => {
    const teardown = useUIStore.getState().initializeOfflineDetection();
    return () => {
      teardown();
    };
  }, []);

  return (
    <ErrorBoundary>
      {/* Dynamic SEO/Document Title Synchronization */}
      <DocumentTitleSync />
      
      {/* Standard base outer wrapper */}
      <div className="min-h-screen bg-bg-primary text-text-primary font-sans transition-colors duration-300">
        <Outlet />
      </div>

      {/* Global Toast, Offline Banner, Maintenance Shield & Dev Diagnostics */}
      <RuntimeOverlay />
    </ErrorBoundary>
  );
}

export default RootLayout;
