/**
 * 11_HOUR - React Authorization Context Provider
 *
 * Part of Slice 1.4: Authorization Platform & Route Access Framework.
 * Subscribes to the unified Session Platform and derives/hydrates authorization contexts,
 * exposing real-time RBAC claims and permission queries to all UI elements.
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useSession } from '@/hooks/useSession';
import { IAuthorizationContext, UserRole, UserPermission } from '../business/domain/authzTypes';
import { authorizationServiceInstance } from '../business/domain/AuthorizationService';
import { AuthzLogger } from '../business/domain/authzLogging';

export interface IAuthorizationContextValue {
  context: IAuthorizationContext | null;
  role: UserRole;
  permissions: Set<UserPermission>;
  featureFlags: Record<string, boolean>;
  loading: boolean;
  hasPermission: (permission: UserPermission) => boolean;
  hasRole: (roles: UserRole[]) => boolean;
  isFeatureActive: (flag: string) => boolean;
}

const AuthorizationContext = createContext<IAuthorizationContextValue | undefined>(undefined);

export const AuthorizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentSession, sessionState } = useSession();
  const [context, setContext] = useState<IAuthorizationContext | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    Promise.resolve().then(() => {
      if (active) {
        setLoading(true);
      }
    });

    const hydrateContext = async () => {
      try {
        AuthzLogger.info('Session state updated, re-hydrating authorization context...');
        const authzContext =
          await authorizationServiceInstance.getAuthorizationContextForSession(currentSession);

        if (active) {
          setContext(authzContext);
          setLoading(false);
          AuthzLogger.info(
            `Successfully hydrated authorization context for role: ${authzContext.role}`,
          );
        }
      } catch (err) {
        AuthzLogger.error('Catastrophic failure during authorization context hydration:', err);
        if (active) {
          setLoading(false);
        }
      }
    };

    hydrateContext();

    return () => {
      active = false;
    };
  }, [currentSession, sessionState]);

  // Derived properties for efficiency
  const role = useMemo(() => context?.role || UserRole.GUEST, [context]);
  const permissions = useMemo(() => context?.permissions || new Set<UserPermission>(), [context]);
  const featureFlags = useMemo(() => context?.featureFlags || {}, [context]);

  const value = useMemo<IAuthorizationContextValue>(() => {
    return {
      context,
      role,
      permissions,
      featureFlags,
      loading,
      hasPermission: (permission: UserPermission) => permissions.has(permission),
      hasRole: (roles: UserRole[]) => roles.includes(role),
      isFeatureActive: (flag: string) => !!featureFlags[flag],
    };
  }, [context, role, permissions, featureFlags, loading]);

  return <AuthorizationContext.Provider value={value}>{children}</AuthorizationContext.Provider>;
};

export const useAuthorization = (): IAuthorizationContextValue => {
  const context = useContext(AuthorizationContext);
  if (!context) {
    throw new Error('useAuthorization must be used within an AuthorizationProvider');
  }
  return context;
};

/**
 * Future Feature Flag Hook
 * Allows UI elements to check feature flag activations with reactive overrides.
 */
export const useFeatureFlags = () => {
  const { featureFlags, isFeatureActive } = useAuthorization();
  return {
    flags: featureFlags,
    isActive: isFeatureActive,
  };
};

export default AuthorizationContext;
