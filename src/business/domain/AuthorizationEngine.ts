/**
 * 11_HOUR - Authorization Engine
 *
 * Part of Slice 1.4: Authorization Platform & Route Access Framework.
 * Coordinates policies and user contexts to render immediate authorization decisions,
 * logging outcomes for audit safety.
 */

import {
  IAuthorizationPolicy,
  IAuthorizationContext,
  IAccessDecision,
  DecisionStrategy,
} from './authzTypes';
import { AccessDecisionManager } from './AccessDecisionManager';
import { AuthzLogger } from './authzLogging';

export class AuthorizationEngine {
  private readonly decisionManager: AccessDecisionManager;

  constructor(decisionManager: AccessDecisionManager = new AccessDecisionManager()) {
    this.decisionManager = decisionManager;
  }

  /**
   * Main entrance to check access permissions given a set of required policies and a user context.
   */
  public checkAccess(
    policies: IAuthorizationPolicy[],
    context: IAuthorizationContext,
    strategy: DecisionStrategy = DecisionStrategy.UNANIMOUS,
    correlationId?: string,
  ): IAccessDecision {
    const decision = this.decisionManager.decide(policies, context, strategy, correlationId);

    if (decision.granted) {
      AuthzLogger.logGrant('ResourceAccess', context, decision);
    } else {
      AuthzLogger.logDeny('ResourceAccess', context, decision);
    }

    return decision;
  }
}

export const authorizationEngineInstance = new AuthorizationEngine();
export default AuthorizationEngine;
