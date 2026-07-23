/**
 * 11_HOUR - Authorization Utilities
 *
 * Part of Slice 1.4: Authorization Platform & Route Access Framework.
 * Common helper methods for set comparisons, permission validation,
 * and user role checks.
 */

import { UserRole, UserPermission } from './authzTypes';
import { ROLE_PERMISSIONS_REGISTRY } from './authzConstants';

export class AuthzUtils {
  /**
   * Evaluates if a given set of permissions includes all required permissions.
   */
  public static hasAllPermissions(
    userPermissions: Set<UserPermission> | UserPermission[],
    requiredPermissions: UserPermission[],
  ): boolean {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    const userSet = userPermissions instanceof Set ? userPermissions : new Set(userPermissions);
    return requiredPermissions.every((permission) => userSet.has(permission));
  }

  /**
   * Evaluates if a given set of permissions includes any of the required permissions.
   */
  public static hasAnyPermission(
    userPermissions: Set<UserPermission> | UserPermission[],
    requiredPermissions: UserPermission[],
  ): boolean {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    const userSet = userPermissions instanceof Set ? userPermissions : new Set(userPermissions);
    return requiredPermissions.some((permission) => userSet.has(permission));
  }

  /**
   * Returns default permissions associated with a user's role.
   */
  public static getDefaultPermissionsForRole(role: UserRole): Set<UserPermission> {
    return ROLE_PERMISSIONS_REGISTRY[role] || new Set<UserPermission>();
  }

  /**
   * Safe comparison to check if a user matches any allowed roles.
   */
  public static hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }
    return allowedRoles.includes(userRole);
  }

  /**
   * Translates email strings into basic roles for the platform (for demo purposes / future upgrades).
   * Admins can have standard emails (e.g. including admin@, workforaniruddh31@gmail.com, etc.).
   */
  public static determineRoleFromEmail(email?: string): UserRole {
    if (!email) {
      return UserRole.ANONYMOUS;
    }
    const normalized = email.toLowerCase();
    if (normalized.includes('admin') || normalized === 'workforaniruddh31@gmail.com') {
      return UserRole.ADMIN;
    }
    return UserRole.MEMBER;
  }
}
