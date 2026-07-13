/**
 * 11_HOUR - Authorization Service
 * 
 * Part of Slice 1.4: Authorization Platform & Route Access Framework.
 * Coordinates user claims, parses sessions, maps routes, and acts as the
 * logical gatekeeper for application views and backend API layers.
 */

import { IAuthorizationContext, IAccessDecision, RouteAccessType, IRouteAccessConfig, DecisionStrategy, IAuthorizationPolicy } from './authzTypes';
import { IAuthorizationRepository, authorizationRepositoryInstance } from './AuthorizationRepository';
import { AuthorizationEngine, authorizationEngineInstance } from './AuthorizationEngine';
import { PublicAccessPolicy, GuestOnlyPolicy, AuthenticatedPolicy, RoleProtectedPolicy, PermissionProtectedPolicy, FeatureFlagProtectedPolicy } from './AuthorizationPolicies';
import { ROUTE_ACCESS_REGISTRY } from './authzConstants';
import { ISession } from './sessionTypes';
import { AuthzErrorMapper } from './authzErrorMapping';
import { AuthzLogger } from './authzLogging';
import { UserProfile } from '@/types';

export class AuthorizationService {
  private readonly repository: IAuthorizationRepository;
  private readonly engine: AuthorizationEngine;

  constructor(
    repository: IAuthorizationRepository = authorizationRepositoryInstance,
    engine: AuthorizationEngine = authorizationEngineInstance
  ) {
    this.repository = repository;
    this.engine = engine;
  }

  /**
   * Translates an active session (from the Session Platform) into a complete, hydrated Authorization Context.
   */
  public async getAuthorizationContextForSession(session: ISession | null): Promise<IAuthorizationContext> {
    try {
      if (!session) {
        // Unauthenticated Guest context
        return await this.repository.getAuthorizationContext('anonymous_user', null);
      }

      const userProfile: UserProfile | null = session.userProfile;
      const userId = session.userId || 'anonymous_user';

      return await this.repository.getAuthorizationContext(userId, userProfile);
    } catch (error) {
      AuthzLogger.error('Failed to construct authorization context for session:', error);
      throw AuthzErrorMapper.map(error);
    }
  }

  /**
   * Matches a target path to the system route registry and evaluates whether the session is authorized.
   */
  public async evaluateRouteAccess(path: string, session: ISession | null, correlationId?: string): Promise<IAccessDecision> {
    const config = this.getRouteConfiguration(path);
    const context = await this.getAuthorizationContextForSession(session);
    const policies = this.translateConfigToPolicies(config);

    AuthzLogger.info(`Evaluating route security for "${path}" [Access: ${config.accessType}]`);
    const decision = this.engine.checkAccess(policies, context, DecisionStrategy.UNANIMOUS, correlationId);

    // Logging detailed audit traces
    if (decision.granted) {
      AuthzLogger.logGrant(path, context, decision);
    } else {
      AuthzLogger.logDeny(path, context, decision);
    }

    return decision;
  }

  /**
   * Resolves the route security configuration for a path, returning a public fallback if unconfigured.
   */
  private getRouteConfiguration(path: string): IRouteAccessConfig {
    // Dynamic matching of parameter routes like /rescue/:id or /reflection/:id
    const registryPaths = Object.keys(ROUTE_ACCESS_REGISTRY);
    
    for (const regPath of registryPaths) {
      if (this.matchRoutePath(regPath, path)) {
        return ROUTE_ACCESS_REGISTRY[regPath];
      }
    }

    // Default to open public config if completely unmapped to prevent rigid blockouts
    return {
      path,
      accessType: RouteAccessType.PUBLIC,
    };
  }

  /**
   * Helper to match parameter routes (e.g. /rescue/123 to /rescue/:id)
   */
  private matchRoutePath(pattern: string, actualPath: string): boolean {
    if (pattern === actualPath) return true;

    const patternParts = pattern.split('/');
    const actualParts = actualPath.split('/');

    if (patternParts.length !== actualParts.length) return false;

    return patternParts.every((part, i) => {
      if (part.startsWith(':')) return true; // Dynamic wildcard parameter
      return part === actualParts[i];
    });
  }

  /**
   * Translates a route configuration block into a list of executable policies.
   */
  private translateConfigToPolicies(config: IRouteAccessConfig): IAuthorizationPolicy[] {
    const policies: IAuthorizationPolicy[] = [];

    switch (config.accessType) {
      case RouteAccessType.PUBLIC:
        policies.push(new PublicAccessPolicy());
        break;

      case RouteAccessType.GUEST_ONLY:
        policies.push(new GuestOnlyPolicy());
        break;

      case RouteAccessType.AUTHENTICATED:
        policies.push(new AuthenticatedPolicy());
        if (config.requiredRoles && config.requiredRoles.length > 0) {
          policies.push(new RoleProtectedPolicy(config.requiredRoles));
        }
        if (config.requiredPermissions && config.requiredPermissions.length > 0) {
          policies.push(new PermissionProtectedPolicy(config.requiredPermissions));
        }
        break;

      case RouteAccessType.ROLE_PROTECTED:
        policies.push(new AuthenticatedPolicy());
        if (config.requiredRoles && config.requiredRoles.length > 0) {
          policies.push(new RoleProtectedPolicy(config.requiredRoles));
        }
        break;

      case RouteAccessType.FEATURE_FLAG_PROTECTED:
        policies.push(new AuthenticatedPolicy());
        if (config.requiredFeatureFlag) {
          policies.push(new FeatureFlagProtectedPolicy(config.requiredFeatureFlag));
        }
        break;
    }

    return policies;
  }
}

export const authorizationServiceInstance = new AuthorizationService();
export default AuthorizationService;
