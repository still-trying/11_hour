import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { ViewportContainer } from './ViewportContainer';

export function PublicLayout(): React.JSX.Element {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Shared header containing theme controls */}
      <AppHeader />
      
      {/* Centered structured viewport contents */}
      <main className="flex-1 flex flex-col justify-center">
        <ViewportContainer className="justify-center">
          <Outlet />
        </ViewportContainer>
      </main>

      {/* Humble human-oriented footer */}
      <footer className="border-t border-border-muted py-sys-md px-sys-lg bg-bg-secondary text-center text-xs font-mono text-text-muted">
        <span>11_HOUR CLIENT OS // ACTIVE SANDBOX</span>
      </footer>
    </div>
  );
}

export default PublicLayout;
