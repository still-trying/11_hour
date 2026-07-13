/**
 * 11_HOUR - Profile Schema Validators
 * 
 * Part of Slice 1.5: User Identity Profile Platform.
 * Leverages Zod to strictly validate profile structure boundaries, preferences, and future-ready flags.
 */

import { z } from 'zod';
import { PROFILE_CONSTRAINTS } from './profileConstants';

export const notificationPreferencesSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  sms: z.boolean(),
  urgencyThreshold: z.enum(PROFILE_CONSTRAINTS.supportedUrgencyThresholds),
});

export const profilePreferencesSchema = z.object({
  theme: z.enum(PROFILE_CONSTRAINTS.supportedThemes),
  locale: z.string().min(2).max(10),
  timezone: z.string().min(1),
  reducedMotion: z.boolean(),
  notificationPreferences: notificationPreferencesSchema,
});

export const profileApplicationSchema = z.object({
  onboardingCompleted: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastLoginAt: z.string().datetime(),
  profileVersion: z.number().int().positive(),
});

export const aiPreferencesSchema = z.object({
  coachingStyle: z.enum(PROFILE_CONSTRAINTS.supportedCoachingStyles),
  preferredModel: z.string().min(1),
  temperature: z.number()
    .min(PROFILE_CONSTRAINTS.aiTemperature.MIN)
    .max(PROFILE_CONSTRAINTS.aiTemperature.MAX),
  autoRefactorEnabled: z.boolean(),
});

export const productivityPreferencesSchema = z.object({
  defaultBlockDurationMinutes: z.number()
    .int()
    .min(PROFILE_CONSTRAINTS.preferredBlockMinutes.MIN)
    .max(PROFILE_CONSTRAINTS.preferredBlockMinutes.MAX),
  dailyFocusGoalMinutes: z.number()
    .int()
    .min(PROFILE_CONSTRAINTS.dailyFocusGoalMinutes.MIN)
    .max(PROFILE_CONSTRAINTS.dailyFocusGoalMinutes.MAX),
  enableSoundAlerts: z.boolean(),
  enableBreakTimer: z.boolean(),
});

export const personalizationSchema = z.object({
  occupation: z.string().max(100).optional(),
  focusAreas: z.array(z.string().max(50)).max(10).optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});

export const profileFutureReadySchema = z.object({
  aiPreferences: aiPreferencesSchema,
  productivityPreferences: productivityPreferencesSchema,
  personalization: personalizationSchema,
  featureFlags: z.record(z.string(), z.boolean()),
});

export const domainUserProfileSchema = z.object({
  uid: z.string().min(1, 'User UID is required'),
  displayName: z.string().nullable(),
  email: z.string().email('Invalid email address format'),
  photoURL: z.string().nullable(),
  preferences: profilePreferencesSchema,
  application: profileApplicationSchema,
  futureReady: profileFutureReadySchema,
});

/**
 * Validates updates made to the profile model, making sure partial inputs conform.
 */
export const profileUpdateSchema = domainUserProfileSchema.partial();
export type ProfileUpdatePayload = z.infer<typeof profileUpdateSchema>;
