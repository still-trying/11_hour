/**
 * 11_HOUR - Authentication Validators
 *
 * Part of Slice 1.2: Identity Infrastructure.
 * Uses Zod schemas to construct bulletproof validation layers for sign-in and sign-up inputs.
 */

import { z } from 'zod';
import { PASSWORD_CONSTRAINTS } from './authConstants';

/**
 * Zod validation schema for signing in.
 */
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Zod validation schema for registering a new account.
 */
export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase(),
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name cannot exceed 50 characters')
    .trim()
    .regex(
      /^[a-zA-Z0-9 _-]+$/,
      'Display name can only contain alphanumeric characters, spaces, hyphens, or underscores',
    ),
  password: z
    .string()
    .min(
      PASSWORD_CONSTRAINTS.MIN_LENGTH,
      `Password must be at least ${PASSWORD_CONSTRAINTS.MIN_LENGTH} characters long`,
    )
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
});

/**
 * Zod validation schema for password reset requests.
 */
export const passwordResetSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase(),
});
