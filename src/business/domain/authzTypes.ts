/**
 * 11_HOUR - Authorization Platform Type Definitions
 * 
 * Part of Slice 1.4: Authorization Platform & Route Access Framework.
 * Establishes the types, enums, interfaces, and exception classes for
 * decentralized access decisions and policy evaluation.
 */

import { UserProfile } from '@/types';

/**
 * Standard system user roles for RBAC.
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  ANONYMOUS = 'ANONYMOUS',
  GUEST = 'GUEST',
}

/**
 * Standard system permissions.
 */
export enum UserPermission {
  CREATE_EPISODE = 'CREATE_EPISODE',
  READ_EPISODE = 'READ_EPISODE',
  UPDATE_EPISODE = 'UPDATE_EPISODE',
  DELETE_EPISODE = 'DELETE_EPISODE',
  READ_ANALYTICS = 'READ_ANALYTICS',
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
}

/**
 * Access levels required for dynamic route guards.
 */
export enum RouteAccessType {
  PUBLIC = 'PUBLIC',
  GUEST_ONLY = 'GUEST_ONLY',
  AUTHENTICATED = 'AUTHENTICATED',
  ROLE_PROTECTED = 'ROLE_PROTECTED',
  FEATURE_FLAG_PROTECTED = 'FEATURE_FLAG_PROTECTED',
}

/**
 * Strategy for resolving multiple policies.
 */
export enum DecisionStrategy {
  AFFIRMATIVE = 'AFFIRMATIVE', // Grant if any policy passes
  UNANIMOUS = 'UNANIMOUS',     // Grant only if all policies pass
  CONSENSUS = 'CONSENSUS',     // Grant if majority of policies pass
}

/**
 * Holds context information for evaluating authorization policies.
 */
export interface IAuthorizationContext {
  userId: string;
  userProfile: UserProfile | null;
  role: UserRole;
  permissions: Set<UserPermission>;
  featureFlags: Record<string, boolean>;
  timestamp: string;
}

/**
 * Core interface for an Authorization Policy.
 */
export interface IAuthorizationPolicy {
  name: string;
  description: string;
  evaluate(context: IAuthorizationContext): boolean;
}

/**
 * Access decision response with audit logging payload.
 */
export interface IAccessDecision {
  granted: boolean;
  reason: string;
  evaluatedPolicies: string[];
  failedPolicies: string[];
  timestamp: string;
  correlationId: string;
}

/**
 * Route level configuration matching metadata properties.
 */
export interface IRouteAccessConfig {
  path: string;
  accessType: RouteAccessType;
  requiredRoles?: UserRole[];
  requiredPermissions?: UserPermission[];
  requiredFeatureFlag?: string;
  redirectPath?: string;
}

/**
 * Authorization Exception Code enumeration.
 */
export enum AuthzErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  POLICY_NOT_FOUND = 'POLICY_NOT_FOUND',
  EVALUATION_FAILED = 'EVALUATION_FAILED',
  SESSION_CONTEXT_MISSING = 'SESSION_CONTEXT_MISSING',
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Custom Domain Exception representing an authorization failure.
 */
export class AuthorizationException extends Error {
  public readonly code: AuthzErrorCode;
  public readonly correlationId: string;
  public readonly originalError?: unknown;

  constructor(
    code: AuthzErrorCode,
    message: string,
    correlationId: string = 'authz_' + Math.random().toString(36).substring(2, 11),
    originalError?: unknown
  ) {
    super(message);
    this.name = 'AuthorizationException';
    this.code = code;
    this.correlationId = correlationId;
    this.originalError = originalError;

    Object.setPrototypeOf(this, AuthorizationException.prototype);
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      correlationId: this.correlationId,
      originalMessage: this.originalError instanceof Error ? this.originalError.message : String(this.originalError || ''),
    };
  }
}
