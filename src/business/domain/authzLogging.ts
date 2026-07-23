/**
 * 11_HOUR - Authorization Audit Logger
 *
 * Part of Slice 1.4: Authorization Platform & Route Access Framework.
 * Implements high-fidelity audit logging and console tracing for access requests,
 * policy evaluations, and authorization failures.
 */

import { AUTHZ_LOG_PREFIX } from './authzConstants';
import { IAuthorizationContext, IAccessDecision } from './authzTypes';

export class AuthzLogger {
  /**
   * Logs a successful access grant to the console for trace audits.
   */
  public static logGrant(
    path: string,
    context: IAuthorizationContext,
    decision: IAccessDecision,
  ): void {
    console.info(
      `${AUTHZ_LOG_PREFIX} [GRANT] path: "${path}" | User: "${context.userId}" | Role: "${context.role}" | Policies: [${decision.evaluatedPolicies.join(', ')}] | Correlation ID: ${decision.correlationId}`,
    );
  }

  /**
   * Logs a denied access request to the console as an audit warning.
   */
  public static logDeny(
    path: string,
    context: IAuthorizationContext,
    decision: IAccessDecision,
  ): void {
    console.warn(
      `${AUTHZ_LOG_PREFIX} [DENY] path: "${path}" | User: "${context.userId}" | Role: "${context.role}" | Reason: "${decision.reason}" | Failed Policies: [${decision.failedPolicies.join(', ')}] | Correlation ID: ${decision.correlationId}`,
    );
  }

  /**
   * Logs general authorization information.
   */
  public static info(message: string, ...args: unknown[]): void {
    console.info(`${AUTHZ_LOG_PREFIX} [INFO] ${message}`, ...args);
  }

  /**
   * Logs general authorization warnings.
   */
  public static warn(message: string, ...args: unknown[]): void {
    console.warn(`${AUTHZ_LOG_PREFIX} [WARN] ${message}`, ...args);
  }

  /**
   * Logs authorization critical errors.
   */
  public static error(message: string, error?: unknown, correlationId?: string): void {
    const cid = correlationId ? ` | CID: ${correlationId}` : '';
    console.error(`${AUTHZ_LOG_PREFIX} [ERROR] ${message}${cid}`, error || '');
  }
}
