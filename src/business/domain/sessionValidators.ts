/**
 * 11_HOUR - Session Validators
 * 
 * Part of Slice 1.3: Session Platform.
 * Leverages Zod schemas to construct a rigid validation wall around incoming session state mutations.
 */

import { z } from 'zod';
import { SessionState } from './sessionTypes';

/**
 * Zod validation schema for a single user profile reference.
 */
export const userProfileSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  email: z.string().email('Valid email address is required'),
  displayName: z.string().optional(),
  photoURL: z.string().url().optional().or(z.literal('')),
  createdAt: z.string().datetime({ message: 'Invalid ISO creation datetime' }),
});

/**
 * Zod validation schema for session metadata.
 */
export const sessionMetadataSchema = z.object({
  ipAddress: z.string().optional().or(z.literal('')),
  userAgent: z.string().optional(),
  lastSyncedAt: z.string().datetime().optional().or(z.literal('')),
  clientVersion: z.string().min(1),
  platform: z.string().min(1),
});

/**
 * Zod validation schema for a full, production-grade session object.
 */
export const sessionSchema = z.object({
  sessionId: z.string().min(5, 'Session ID must be specified'),
  userId: z.string().min(1, 'User ID is required'),
  userProfile: userProfileSchema.nullable(),
  state: z.nativeEnum(SessionState),
  createdAt: z.string().datetime({ message: 'Invalid ISO creation timestamp' }),
  lastActiveAt: z.string().datetime({ message: 'Invalid ISO last active timestamp' }),
  deviceId: z.string().min(1, 'Device fingerprint signature is required'),
  isAnonymous: z.boolean(),
  metadata: sessionMetadataSchema,
});

/**
 * Validates a session payload against the schema rules.
 * Returns true if valid, or throws a SessionException / ZodError if invalid.
 */
export function validateSession(payload: unknown): boolean {
  sessionSchema.parse(payload);
  return true;
}

/**
 * Performs a safe parse on a session object, returning a validation result.
 */
export function safeValidateSession(payload: unknown) {
  return sessionSchema.safeParse(payload);
}
