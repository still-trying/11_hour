/**
 * 11_HOUR - Authentication Type Definitions
 *
 * Part of Slice 1.2: Identity Infrastructure.
 * Defines domain-level enum values, error codes, interfaces, and the custom
 * AuthException class to keep the business logic layer fully decoupled from infrastructure SDK types.
 */

/**
 * Standardized domain-level authentication error codes.
 */
export enum AuthErrorCode {
  EMAIL_ALREADY_IN_USE = 'EMAIL_ALREADY_IN_USE',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  WRONG_PASSWORD = 'WRONG_PASSWORD',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  INVALID_EMAIL = 'INVALID_EMAIL',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  USER_DISABLED = 'USER_DISABLED',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Custom Domain Exception representing an authentication failure.
 * Completely maps away infrastructure-specific errors and error messages.
 */
export class AuthException extends Error {
  public readonly code: AuthErrorCode;
  public readonly originalError?: unknown;

  constructor(code: AuthErrorCode, message: string, originalError?: unknown) {
    super(message);
    this.name = 'AuthException';
    this.code = code;
    this.originalError = originalError;

    // Ensure proper prototype chain for built-in Error extension
    Object.setPrototypeOf(this, AuthException.prototype);
  }

  /**
   * Serializes the domain exception for secure diagnostic telemetry.
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      originalMessage:
        this.originalError instanceof Error
          ? this.originalError.message
          : String(this.originalError || ''),
    };
  }
}

/**
 * Input signature for Email/Password Sign Up.
 */
export interface SignUpInput {
  email: string;
  password: string;
  displayName: string;
}

/**
 * Input signature for Email/Password Sign In.
 */
export interface SignInInput {
  email: string;
  password: string;
}
