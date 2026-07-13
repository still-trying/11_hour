/**
 * 11_HOUR - Authorization Policies
 * 
 * Part of Slice 1.4: Authorization Platform & Route Access Framework.
 * Declares domain rules mapping to security policies evaluated by PolicyEvaluator.
 */

import { IAuthorizationPolicy, IAuthorizationContext, UserRole, UserPermission } from './authzTypes';
import { AuthzUtils } from './authzUtils';

/**
 * Policy allowing anyone to access a resource.
 */
export class PublicAccessPolicy implements IAuthorizationPolicy {
  public name = 'PublicAccessPolicy';
  public description = 'Grants access to any caller unconditionally.';

  public evaluate(_context: IAuthorizationContext): boolean {
    return true;
  }
}

/**
 * Policy restricted to guest callers only (e.g. login screens).
 */
export class GuestOnlyPolicy implements IAuthorizationPolicy {
  public name = 'GuestOnlyPolicy';
  public description = 'Restricts access to unauthenticated guests only.';

  public evaluate(context: IAuthorizationContext): boolean {
    return !context.userId || context.userId === 'anonymous_user' || context.role === UserRole.GUEST;
  }
}

/**
 * Policy restricted to standard authenticated users (members, admins, anonymous/guest-authenticated).
 */
export class AuthenticatedPolicy implements IAuthorizationPolicy {
  public name = 'AuthenticatedPolicy';
  public description = 'Restricts access to authenticated sessions.';

  public evaluate(context: IAuthorizationContext): boolean {
    return !!context.userId && context.userId !== 'anonymous_user' && context.role !== UserRole.GUEST;
  }
}

/**
 * Policy securing resources by specific system roles.
 */
export class RoleProtectedPolicy implements IAuthorizationPolicy {
  public name = 'RoleProtectedPolicy';
  public description = 'Restricts access to users belonging to specified roles.';
  private allowedRoles: UserRole[];

  constructor(allowedRoles: UserRole[]) {
    this.allowedRoles = allowedRoles;
  }

  public evaluate(context: IAuthorizationContext): boolean {
    return AuthzUtils.hasRole(context.role, this.allowedRoles);
  }
}

/**
 * Policy securing resources by specific required permissions.
 */
export class PermissionProtectedPolicy implements IAuthorizationPolicy {
  public name = 'PermissionProtectedPolicy';
  public description = 'Restricts access to callers with specific required system permissions.';
  private requiredPermissions: UserPermission[];

  constructor(requiredPermissions: UserPermission[]) {
    this.requiredPermissions = requiredPermissions;
  }

  public evaluate(context: IAuthorizationContext): boolean {
    return AuthzUtils.hasAllPermissions(context.permissions, this.requiredPermissions);
  }
}

/**
 * Policy restricting access based on a specific active feature flag.
 */
export class FeatureFlagProtectedPolicy implements IAuthorizationPolicy {
  public name = 'FeatureFlagProtectedPolicy';
  public description = 'Restricts access based on the state of a system feature flag.';
  private flagName: string;

  constructor(flagName: string) {
    this.flagName = flagName;
  }

  public evaluate(context: IAuthorizationContext): boolean {
    return !!context.featureFlags[this.flagName];
  }
}
