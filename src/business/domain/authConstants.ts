/**
 * 11_HOUR - Authentication Constants
 * 
 * Part of Slice 1.2: Identity Infrastructure.
 * Defines central constants for validation thresholds, user-friendly error messages,
 * and security-related timing defaults.
 */

import { AuthErrorCode } from './authTypes';

/**
 * Password security thresholds.
 */
export const PASSWORD_CONSTRAINTS = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
};

/**
 * Storage session keys.
 */
export const AUTH_STORAGE_KEYS = {
  SESSION_USER: '11hour_auth_user',
  REDIRECT_PATH: '11hour_auth_redirect',
};

/**
 * Standard user-friendly error messages mapped to domain-level codes.
 * Ensures we never leak raw SDK technical stack trace strings to stressed users.
 */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  [AuthErrorCode.EMAIL_ALREADY_IN_USE]: 'An account with this email address already exists. Please try signing in instead.',
  [AuthErrorCode.INVALID_CREDENTIALS]: 'Invalid email address or password. Please verify your credentials and try again.',
  [AuthErrorCode.WEAK_PASSWORD]: 'Your password is too weak. It must be at least 8 characters long and include numbers and letters.',
  [AuthErrorCode.USER_NOT_FOUND]: 'No account was found with this email address.',
  [AuthErrorCode.WRONG_PASSWORD]: 'Incorrect password. Please try again.',
  [AuthErrorCode.NETWORK_ERROR]: 'A connection error occurred. Please check your internet connection and try again.',
  [AuthErrorCode.TOO_MANY_REQUESTS]: 'Too many failed login attempts. Access has been temporarily restricted for security.',
  [AuthErrorCode.INVALID_EMAIL]: 'Please enter a valid, properly formatted email address.',
  [AuthErrorCode.OPERATION_NOT_ALLOWED]: 'This sign-in method is currently disabled. Please contact system administrators.',
  [AuthErrorCode.USER_DISABLED]: 'This user account has been disabled. Please contact support.',
  [AuthErrorCode.UNKNOWN]: 'An unexpected authentication error occurred. Our engineers have been alerted.',
};
