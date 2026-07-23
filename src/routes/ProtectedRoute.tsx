/**
 * 11_HOUR - Protected Route Guard
 *
 * Part of Slice 1.4: Authorization Platform & Route Access Framework.
 * Secures workspace pages (such as `/dashboard`, `/rescue/*`, `/settings`, and `/analytics`)
 * by enforcing valid authenticated sessions and evaluating role/permission/feature flag claims.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthorization } from '@/hooks/useAuthorization';
import { useSession } from '@/hooks/useSession';
import { ROUTES } from './constants';
import { ROUTE_ACCESS_REGISTRY, REDIRECT_QUERY_PARAM } from '@/business/domain/authzConstants';
import { RouteAccessType, UserRole, UserPermission } from '@/business/domain/authzTypes';
import { AuthzLogger } from '@/business/domain/authzLogging';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps): React.JSX.Element {
  const { loading, role, hasPermission } = useAuthorization();
  const { currentSession } = useSession();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
        <p className="mt-4 text-xs font-mono tracking-widest text-zinc-500 uppercase">
          Verifying Authorization...
        </p>
      </div>
    );
  }

  // 1. Resolve configuration from registry
  const path = location.pathname;
  const config = getRouteConfiguration(path);
  const isAuthenticated = currentSession && role !== UserRole.GUEST;

  // 2. Enforce Authenticated Policy
  if (!isAuthenticated) {
    AuthzLogger.warn(`Unauthorized access attempt to "${path}". Redirecting to Login Gate.`);
    const encodedTarget = encodeURIComponent(path);
    return <Navigate to={`${ROUTES.AUTH}?${REDIRECT_QUERY_PARAM}=${encodedTarget}`} replace />;
  }

  // 3. Enforce Role Protection
  if (
    config.requiredRoles &&
    config.requiredRoles.length > 0 &&
    !config.requiredRoles.includes(role)
  ) {
    AuthzLogger.warn(
      `Forbidden role access attempt to "${path}" [User: ${currentSession?.userId} | Role: ${role} | Required: ${config.requiredRoles.join(', ')}]. Redirecting to Dashboard.`,
    );
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  // 4. Enforce Permission Protection
  if (config.requiredPermissions && config.requiredPermissions.length > 0) {
    const hasAll = config.requiredPermissions.every((perm: UserPermission) => hasPermission(perm));
    if (!hasAll) {
      AuthzLogger.warn(
        `Forbidden permission access attempt to "${path}" [User: ${currentSession?.userId} | Missing Required Permissions]. Redirecting to Dashboard.`,
      );
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
  }

  // 5. Enforce Feature Flag Protection
  if (
    config.requiredFeatureFlag &&
    !contextIsFeatureActive(config.requiredFeatureFlag, contextFeatureFlags(role))
  ) {
    AuthzLogger.warn(
      `Feature flag "${config.requiredFeatureFlag}" is disabled. Restricting access to "${path}".`,
    );
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  AuthzLogger.info(
    `Access granted to path "${path}" [User: ${currentSession?.userId} | Role: ${role}]`,
  );
  return <>{children}</>;
}

// Helper to resolve route configuration
function getRouteConfiguration(path: string) {
  const registryPaths = Object.keys(ROUTE_ACCESS_REGISTRY);
  for (const regPath of registryPaths) {
    if (matchRoutePath(regPath, path)) {
      return ROUTE_ACCESS_REGISTRY[regPath];
    }
  }
  return {
    path,
    accessType: RouteAccessType.AUTHENTICATED,
    redirectPath: ROUTES.DASHBOARD,
  };
}

// Pattern matching for paths with dynamic parameters (e.g., /rescue/:id)
function matchRoutePath(pattern: string, actualPath: string): boolean {
  if (pattern === actualPath) return true;
  const patternParts = pattern.split('/');
  const actualParts = actualPath.split('/');
  if (patternParts.length !== actualParts.length) return false;
  return patternParts.every((part, i) => {
    if (part.startsWith(':')) return true;
    return part === actualParts[i];
  });
}

// Simple fallback feature flag evaluator for compile-safety
function contextFeatureFlags(role: UserRole): Record<string, boolean> {
  return {
    enableAnalytics: true,
    enableDiagnostics: true,
    enableSelfHealing: true,
    enableHotkeys: true,
    enableCoachingBeta: false,
    enableAdminConsole: role === UserRole.ADMIN,
  };
}

function contextIsFeatureActive(flagName: string, flags: Record<string, boolean>): boolean {
  return !!flags[flagName];
}

export default ProtectedRoute;
