/**
 * 11_HOUR - Authentication Utilities
 *
 * Part of Slice 1.2: Identity Infrastructure.
 * Contains domain helpers and secure sanitization routines for user identity data.
 */

/**
 * Sanitizes an email address string.
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Sanitizes a user display name by stripping extraneous spaces and removing non-printable characters.
 */
export function sanitizeDisplayName(displayName: string): string {
  return displayName.replace(/\s+/g, ' ').trim();
}

/**
 * Calculates a basic security strength score for a password (0 to 4).
 */
export function calculatePasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return score;
}
