/**
 * 11_HOUR - Access Decision Manager
 * 
 * Part of Slice 1.4: Authorization Platform & Route Access Framework.
 * Implements consensus-driven and gatekeeper strategies to combine multiple
 * evaluated policies into a final single access decision.
 */

import { IAuthorizationPolicy, IAuthorizationContext, IAccessDecision, DecisionStrategy } from './authzTypes';
import { PolicyEvaluator } from './PolicyEvaluator';

export class AccessDecisionManager {
  private readonly evaluator: PolicyEvaluator;

  constructor(evaluator: PolicyEvaluator = new PolicyEvaluator()) {
    this.evaluator = evaluator;
  }

  /**
   * Evaluates a set of policies using the selected strategy and returns a unified IAccessDecision response.
   */
  public decide(
    policies: IAuthorizationPolicy[],
    context: IAuthorizationContext,
    strategy: DecisionStrategy = DecisionStrategy.UNANIMOUS,
    correlationId?: string
  ): IAccessDecision {
    const cid = correlationId || 'dec_' + Math.random().toString(36).substring(2, 11);
    const evaluatedPolicies: string[] = [];
    const failedPolicies: string[] = [];

    if (policies.length === 0) {
      return {
        granted: true,
        reason: 'No restrictions or policies specified. Open by default.',
        evaluatedPolicies: [],
        failedPolicies: [],
        timestamp: new Date().toISOString(),
        correlationId: cid,
      };
    }

    let grantCount = 0;
    let denyCount = 0;

    for (const policy of policies) {
      const outcome = this.evaluator.evaluate(policy, context);
      evaluatedPolicies.push(policy.name);

      if (outcome) {
        grantCount++;
      } else {
        denyCount++;
        failedPolicies.push(policy.name);
      }
    }

    let granted: boolean;
    let reason: string;

    switch (strategy) {
      case DecisionStrategy.AFFIRMATIVE:
        granted = grantCount > 0;
        reason = granted
          ? `Access granted: At least one policy (${grantCount} total) succeeded.`
          : 'Access denied: All evaluated policies failed.';
        break;

      case DecisionStrategy.CONSENSUS:
        granted = grantCount > denyCount;
        reason = granted
          ? `Access granted: Majority of policies succeeded (${grantCount} vs ${denyCount}).`
          : `Access denied: Equal or majority of policies failed (${denyCount} vs ${grantCount}).`;
        break;

      case DecisionStrategy.UNANIMOUS:
      default:
        granted = denyCount === 0;
        reason = granted
          ? 'Access granted: All policies passed evaluation.'
          : `Access denied: The following policies failed: [${failedPolicies.join(', ')}]`;
        break;
    }

    return {
      granted,
      reason,
      evaluatedPolicies,
      failedPolicies,
      timestamp: new Date().toISOString(),
      correlationId: cid,
    };
  }
}
export default AccessDecisionManager;
