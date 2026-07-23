/**
 * 11_HOUR - Profile System Constants and Configuration
 *
 * Part of Slice 1.5: User Identity Profile Platform.
 * Governs fallback default settings, validation boundaries, and metadata structures.
 */

import { IProfilePreferences, IProfileFutureReady } from './profileTypes';

export const PROFILE_VERSION = 1;

export const DEFAULT_NOTIFICATIONS = {
  email: true,
  push: true,
  sms: false,
  urgencyThreshold: 'high' as const,
};

export const DEFAULT_PREFERENCES: IProfilePreferences = {
  theme: 'dark',
  locale: 'en-US',
  timezone: 'UTC',
  reducedMotion: false,
  notificationPreferences: DEFAULT_NOTIFICATIONS,
};

export const DEFAULT_AI_PREFERENCES = {
  coachingStyle: 'assertive' as const,
  preferredModel: 'gemini-2.5-flash',
  temperature: 0.7,
  autoRefactorEnabled: false,
};

export const DEFAULT_PRODUCTIVITY_PREFERENCES = {
  defaultBlockDurationMinutes: 25,
  dailyFocusGoalMinutes: 120,
  enableSoundAlerts: true,
  enableBreakTimer: true,
};

export const DEFAULT_PERSONALIZATION = {
  skillLevel: 'beginner' as const,
};

export const DEFAULT_FUTURE_READY: IProfileFutureReady = {
  aiPreferences: DEFAULT_AI_PREFERENCES,
  productivityPreferences: DEFAULT_PRODUCTIVITY_PREFERENCES,
  personalization: DEFAULT_PERSONALIZATION,
  featureFlags: {
    enableDeepCoaching: false,
    enableTimelineRefactor: true,
    enableVisualMetrics: false,
  },
};

export const PROFILE_CONSTRAINTS = {
  preferredBlockMinutes: {
    MIN: 5,
    MAX: 60,
  },
  dailyFocusGoalMinutes: {
    MIN: 15,
    MAX: 480,
  },
  aiTemperature: {
    MIN: 0.0,
    MAX: 1.0,
  },
  supportedThemes: ['light', 'dark', 'system'] as const,
  supportedCoachingStyles: ['assertive', 'supportive', 'analytical', 'minimalist'] as const,
  supportedUrgencyThresholds: ['high', 'all', 'none'] as const,
};

export const PROFILE_LOG_PREFIX = '👤 [ProfilePlatform]';
export const PROFILE_LOCAL_CACHE_KEY = '11hour_active_profile';
export const PROFILE_QUEUE_KEY = '11hour_profile_sync_queue';
