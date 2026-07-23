/**
 * 11_HOUR - Public/Guest Route Guard
 *
 * Part of Slice 1.4: Authorization Platform & Route Access Framework.
 * Secures guest-only pages (such as `/auth`) by automatically redirecting
 * already-authenticated users to safety (the `/dashboard` workspace).
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthorization } from '@/hooks/useAuthorization';
import { useSession } from '@/hooks/useSession';
import { ROUTES } from './constants';
import { UserRole } from '@/business/domain/authzTypes';
import { REDIRECT_QUERY_PARAM } from '@/business/domain/authzConstants';

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps): React.JSX.Element {
  const { loading, role } = useAuthorization();
  const { currentSession } = useSession();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
        <p className="mt-4 text-xs font-mono tracking-widest text-zinc-500 uppercase">
          Synchronizing Credentials...
        </p>
      </div>
    );
  }

  const isAuthenticated = currentSession && role !== UserRole.GUEST && role !== UserRole.ANONYMOUS;

  if (isAuthenticated) {
    // Already authenticated. Redirect to dashboard or originally requested URL if present in query parameters
    const params = new URLSearchParams(location.search);
    const redirectTarget = params.get(REDIRECT_QUERY_PARAM);
    const destination = redirectTarget ? decodeURIComponent(redirectTarget) : ROUTES.DASHBOARD;

    console.info(
      `🛡️ [PublicRoute] Logged-in user tried to hit Guest page. Redirecting to: ${destination}`,
    );
    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
}

export default PublicRoute;
