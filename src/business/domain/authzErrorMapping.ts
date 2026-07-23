/**
 * 11_HOUR - Authorization Error Mapping
 *
 * Part of Slice 1.4: Authorization Platform & Route Access Framework.
 * Translates application exceptions, database faults, or parsing problems
 * into typed system-level AuthorizationExceptions.
 */

import { AuthorizationException, AuthzErrorCode } from './authzTypes';

export class AuthzErrorMapper {
  /**
   * Safe casting method to translate any error object into an AuthorizationException.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static map(error: any, correlationId?: string): AuthorizationException {
    if (error instanceof AuthorizationException) {
      return error;
    }

    const cid = correlationId || 'err_authz_' + Math.random().toString(36).substring(2, 11);
    const message = error instanceof Error ? error.message : String(error);

    // Parse security or credential keywords
    if (
      message.includes('permission') ||
      message.includes('denied') ||
      message.includes('Forbidden')
    ) {
      return new AuthorizationException(
        AuthzErrorCode.FORBIDDEN,
        `Access is forbidden: ${message}`,
        cid,
        error,
      );
    }

    if (
      message.includes('unauthenticated') ||
      message.includes('login') ||
      message.includes('sign in')
    ) {
      return new AuthorizationException(
        AuthzErrorCode.UNAUTHORIZED,
        `User is unauthenticated: ${message}`,
        cid,
        error,
      );
    }

    return new AuthorizationException(
      AuthzErrorCode.EVALUATION_FAILED,
      `An evaluation or authorization failure occurred: ${message}`,
      cid,
      error,
    );
  }

  /**
   * Helper to construct a standard unauthorized exception.
   */
  public static createUnauthorized(
    message = 'User authentication is required to access this resource.',
    correlationId?: string,
  ): AuthorizationException {
    return new AuthorizationException(AuthzErrorCode.UNAUTHORIZED, message, correlationId);
  }

  /**
   * Helper to construct a standard forbidden exception.
   */
  public static createForbidden(
    message = 'The authenticated user has insufficient permissions to perform this action.',
    correlationId?: string,
  ): AuthorizationException {
    return new AuthorizationException(AuthzErrorCode.FORBIDDEN, message, correlationId);
  }
}
