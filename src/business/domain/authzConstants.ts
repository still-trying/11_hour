/**
 * 11_HOUR - Authorization Platform Constants
 *
 * Part of Slice 1.4: Authorization Platform & Route Access Framework.
 * Declares system role mappings, initial feature flags, default redirect configurations,
 * and standard route access definitions.
 */

import { UserRole, UserPermission, RouteAccessType, IRouteAccessConfig } from './authzTypes';
import { ROUTES } from '@/routes/constants';

/**
 * Maps each system role to its complete set of default permissions.
 */
export const ROLE_PERMISSIONS_REGISTRY: Record<UserRole, Set<UserPermission>> = {
  [UserRole.ADMIN]: new Set([
    UserPermission.CREATE_EPISODE,
    UserPermission.READ_EPISODE,
    UserPermission.UPDATE_EPISODE,
    UserPermission.DELETE_EPISODE,
    UserPermission.READ_ANALYTICS,
    UserPermission.MANAGE_SETTINGS,
  ]),
  [UserRole.MEMBER]: new Set([
    UserPermission.CREATE_EPISODE,
    UserPermission.READ_EPISODE,
    UserPermission.UPDATE_EPISODE,
    UserPermission.DELETE_EPISODE,
    UserPermission.READ_ANALYTICS,
    UserPermission.MANAGE_SETTINGS,
  ]),
  [UserRole.ANONYMOUS]: new Set([
    UserPermission.CREATE_EPISODE,
    UserPermission.READ_EPISODE,
    UserPermission.UPDATE_EPISODE,
  ]),
  [UserRole.GUEST]: new Set([]),
};

/**
 * Standard system feature flags defaults.
 */
export const DEFAULT_FEATURE_FLAGS: Record<string, boolean> = {
  enableAnalytics: true,
  enableDiagnostics: true,
  enableSelfHealing: true,
  enableHotkeys: true,
  enableCoachingBeta: false, // For future feature flag testing
  enableAdminConsole: false, // Locked flag
};

/**
 * Maps route paths directly to security and authorization configurations.
 */
export const ROUTE_ACCESS_REGISTRY: Record<string, IRouteAccessConfig> = {
  [ROUTES.LANDING]: {
    path: ROUTES.LANDING,
    accessType: RouteAccessType.PUBLIC,
    redirectPath: ROUTES.DASHBOARD, // If logged in and hitting landing, optionally redirect or allow
  },
  [ROUTES.AUTH]: {
    path: ROUTES.AUTH,
    accessType: RouteAccessType.GUEST_ONLY,
    redirectPath: ROUTES.DASHBOARD, // Redirect authenticated users away from login
  },
  [ROUTES.DASHBOARD]: {
    path: ROUTES.DASHBOARD,
    accessType: RouteAccessType.AUTHENTICATED,
    requiredRoles: [UserRole.MEMBER, UserRole.ADMIN, UserRole.ANONYMOUS],
    redirectPath: ROUTES.AUTH,
  },
  [ROUTES.RESCUE_CREATE]: {
    path: ROUTES.RESCUE_CREATE,
    accessType: RouteAccessType.AUTHENTICATED,
    requiredRoles: [UserRole.MEMBER, UserRole.ADMIN, UserRole.ANONYMOUS],
    requiredPermissions: [UserPermission.CREATE_EPISODE],
    redirectPath: ROUTES.AUTH,
  },
  [ROUTES.RESCUE_WORKSPACE]: {
    path: ROUTES.RESCUE_WORKSPACE,
    accessType: RouteAccessType.AUTHENTICATED,
    requiredRoles: [UserRole.MEMBER, UserRole.ADMIN, UserRole.ANONYMOUS],
    requiredPermissions: [UserPermission.READ_EPISODE],
    redirectPath: ROUTES.AUTH,
  },
  [ROUTES.REFLECTION]: {
    path: ROUTES.REFLECTION,
    accessType: RouteAccessType.AUTHENTICATED,
    requiredRoles: [UserRole.MEMBER, UserRole.ADMIN],
    requiredPermissions: [UserPermission.READ_EPISODE],
    redirectPath: ROUTES.AUTH,
  },
  [ROUTES.ANALYTICS]: {
    path: ROUTES.ANALYTICS,
    accessType: RouteAccessType.AUTHENTICATED,
    requiredRoles: [UserRole.MEMBER, UserRole.ADMIN],
    requiredPermissions: [UserPermission.READ_ANALYTICS],
    redirectPath: ROUTES.AUTH,
  },
  [ROUTES.SETTINGS]: {
    path: ROUTES.SETTINGS,
    accessType: RouteAccessType.AUTHENTICATED,
    requiredRoles: [UserRole.MEMBER, UserRole.ADMIN],
    requiredPermissions: [UserPermission.MANAGE_SETTINGS],
    redirectPath: ROUTES.AUTH,
  },
};

export const AUTHZ_LOG_PREFIX = '🛡️ [Authorization]';
export const REDIRECT_QUERY_PARAM = 'redirect';
