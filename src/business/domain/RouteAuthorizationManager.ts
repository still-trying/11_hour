/**
 * 11_HOUR - Route Authorization Manager
 *
 * Part of Slice 1.4: Authorization Platform & Route Access Framework.
 * Acts as the principal route access gatekeeper, returning exact redirect destinations,
 * mapping unauthorized actions, and integrating the Redirect Strategy.
 */

import { AuthorizationService, authorizationServiceInstance } from './AuthorizationService';
import { IAccessDecision, RouteAccessType } from './authzTypes';
import { ROUTE_ACCESS_REGISTRY, REDIRECT_QUERY_PARAM } from './authzConstants';
import { ROUTES } from '@/routes/constants';
import { ISession } from './sessionTypes';
import { AuthzLogger } from './authzLogging';

export interface IRouteAccessEvaluation {
  allowed: boolean;
  redirectUrl: string | null;
  decision: IAccessDecision;
}

export class RouteAuthorizationManager {
  private readonly service: AuthorizationService;

  constructor(service: AuthorizationService = authorizationServiceInstance) {
    this.service = service;
  }

  /**
   * Main gatekeeper method to evaluate navigation requests.
   * Returns whether access is allowed, and if not, the exact redirect URL incorporating query params.
   */
  public async checkRoute(path: string, session: ISession | null): Promise<IRouteAccessEvaluation> {
    const correlationId = 'rt_chk_' + Math.random().toString(36).substring(2, 11);

    try {
      const decision = await this.service.evaluateRouteAccess(path, session, correlationId);

      if (decision.granted) {
        return {
          allowed: true,
          redirectUrl: null,
          decision,
        };
      }

      // User was denied access. Calculate redirect strategy.
      const redirectUrl = this.calculateRedirect(path, session);
      return {
        allowed: false,
        redirectUrl,
        decision,
      };
    } catch (error) {
      AuthzLogger.error(
        `Route check failed catastrophically for path "${path}":`,
        error,
        correlationId,
      );
      return {
        allowed: false,
        redirectUrl: ROUTES.AUTH, // Safe default in catastrophic cases
        decision: {
          granted: false,
          reason: `Catastrophic route validation failure: ${error instanceof Error ? error.message : String(error)}`,
          evaluatedPolicies: [],
          failedPolicies: [],
          timestamp: new Date().toISOString(),
          correlationId,
        },
      };
    }
  }

  /**
   * Evaluates redirect destinations according to unauthenticated vs. forbidden transitions.
   */
  private calculateRedirect(path: string, session: ISession | null): string {
    const config = this.getRouteConfiguration(path);
    const isAuthenticated = !!session && session.userId !== 'anonymous_user';

    if (!isAuthenticated) {
      // 1. Unauthorized Handler: Redirect unauthenticated user to Auth with original destination encoded
      AuthzLogger.warn(`Unauthorized access attempt to "${path}". Redirecting to authentication.`);
      const encodedTarget = encodeURIComponent(path);
      return `${ROUTES.AUTH}?${REDIRECT_QUERY_PARAM}=${encodedTarget}`;
    } else {
      // 2. Forbidden Handler: Redirect authenticated but unauthorized user to Dashboard
      AuthzLogger.warn(
        `Forbidden access attempt to "${path}" for authenticated user "${session.userId}". Redirecting to safety.`,
      );
      return config.redirectPath || ROUTES.DASHBOARD;
    }
  }

  private getRouteConfiguration(path: string) {
    const registryPaths = Object.keys(ROUTE_ACCESS_REGISTRY);
    for (const regPath of registryPaths) {
      if (this.matchRoutePath(regPath, path)) {
        return ROUTE_ACCESS_REGISTRY[regPath];
      }
    }
    return {
      path,
      accessType: RouteAccessType.PUBLIC,
      redirectPath: ROUTES.DASHBOARD,
    };
  }

  private matchRoutePath(pattern: string, actualPath: string): boolean {
    if (pattern === actualPath) return true;
    const patternParts = pattern.split('/');
    const actualParts = actualPath.split('/');
    if (patternParts.length !== actualParts.length) return false;
    return patternParts.every((part, i) => {
      if (part.startsWith(':')) return true;
      return part === actualParts[i];
    });
  }
}

export const routeAuthorizationManagerInstance = new RouteAuthorizationManager();
export default RouteAuthorizationManager;
