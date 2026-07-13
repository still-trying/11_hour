/**
 * 11_HOUR - Policy Evaluator
 * 
 * Part of Slice 1.4: Authorization Platform & Route Access Framework.
 * Executes specific Authorization Policies against a hydrated context, mapping and
 * capturing evaluation exceptions.
 */

import { IAuthorizationPolicy, IAuthorizationContext } from './authzTypes';
import { AuthzLogger } from './authzLogging';

export class PolicyEvaluator {
  /**
   * Executes a policy against the provided context and returns a boolean outcome.
   * Gracefully captures and logs policy exceptions.
   */
  public evaluate(policy: IAuthorizationPolicy, context: IAuthorizationContext): boolean {
    try {
      const outcome = policy.evaluate(context);
      AuthzLogger.info(`Policy "${policy.name}" evaluated to: ${outcome}`);
      return outcome;
    } catch (error) {
      AuthzLogger.error(`Exception evaluating policy "${policy.name}":`, error);
      return false; // Deny on evaluation error
    }
  }
}
