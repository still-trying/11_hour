/**
 * 11_HOUR - Profile Type Definitions
 *
 * Part of Slice 1.5: User Identity Profile Platform.
 * Defines profile-specific domains, preferences, statuses, configurations,
 * and standard event contracts.
 */

/**
 * Standardized profile states.
 */
export enum ProfileState {
  UNINITIALIZED = 'UNINITIALIZED',
  INITIALIZING = 'INITIALIZING',
  ACTIVE = 'ACTIVE',
  MIGRATING = 'MIGRATING',
  DELETING = 'DELETING',
  ERROR = 'ERROR',
}

/**
 * Standardized profile event types.
 */
export enum ProfileEvent {
  PROFILE_CREATED = 'ProfileCreated',
  PROFILE_HYDRATED = 'ProfileHydrated',
  PROFILE_UPDATED = 'ProfileUpdated',
  PROFILE_SYNC_STARTED = 'ProfileSyncStarted',
  PROFILE_SYNC_COMPLETED = 'ProfileSyncCompleted',
  PROFILE_SYNC_FAILED = 'ProfileSyncFailed',
  PROFILE_MIGRATED = 'ProfileMigrated',
  PROFILE_DELETED = 'ProfileDeleted',
  PROFILE_ERROR = 'ProfileError',
}

/**
 * Profile Preferences domain structure.
 */
export interface IProfilePreferences {
  theme: 'light' | 'dark' | 'system';
  locale: string;
  timezone: string;
  reducedMotion: boolean;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
    urgencyThreshold: 'high' | 'all' | 'none';
  };
}

/**
 * Profile Application metadata structure.
 */
export interface IProfileApplication {
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  profileVersion: number;
}

/**
 * Profile Future-Ready structures.
 */
export interface IProfileFutureReady {
  aiPreferences: {
    coachingStyle: 'assertive' | 'supportive' | 'analytical' | 'minimalist';
    preferredModel: string;
    temperature: number;
    autoRefactorEnabled: boolean;
  };
  productivityPreferences: {
    defaultBlockDurationMinutes: number;
    dailyFocusGoalMinutes: number;
    enableSoundAlerts: boolean;
    enableBreakTimer: boolean;
  };
  personalization: {
    occupation?: string;
    focusAreas?: string[];
    skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  };
  featureFlags: Record<string, boolean>;
}

/**
 * Comprehensive Domain User Profile.
 */
export interface IDomainUserProfile {
  uid: string;
  displayName: string | null;
  email: string;
  photoURL: string | null;
  preferences: IProfilePreferences;
  application: IProfileApplication;
  futureReady: IProfileFutureReady;
}

/**
 * Standardized profile error codes.
 */
export enum ProfileErrorCode {
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  MIGRATION_FAILED = 'MIGRATION_FAILED',
  PERSISTENCE_FAILED = 'PERSISTENCE_FAILED',
  SYNC_CONFLICT = 'SYNC_CONFLICT',
  DELETION_FAILED = 'DELETION_FAILED',
  AUDIT_FAILED = 'AUDIT_FAILED',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Custom Domain Exception representing a Profile Platform failure.
 */
export class ProfileException extends Error {
  public readonly code: ProfileErrorCode;
  public readonly correlationId: string;
  public readonly originalError?: unknown;

  constructor(
    code: ProfileErrorCode,
    message: string,
    correlationId: string = Math.random().toString(36).substring(2, 11),
    originalError?: unknown,
  ) {
    super(message);
    this.name = 'ProfileException';
    this.code = code;
    this.correlationId = correlationId;
    this.originalError = originalError;

    Object.setPrototypeOf(this, ProfileException.prototype);
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      correlationId: this.correlationId,
      originalMessage:
        this.originalError instanceof Error
          ? this.originalError.message
          : String(this.originalError || ''),
    };
  }
}

/**
 * Strongly typed payload signatures for individual profile event channels.
 */
export interface ProfileEventPayloads {
  [ProfileEvent.PROFILE_CREATED]: { uid: string; timestamp: string };
  [ProfileEvent.PROFILE_HYDRATED]: { uid: string; timestamp: string };
  [ProfileEvent.PROFILE_UPDATED]: { uid: string; fieldsChanged: string[]; timestamp: string };
  [ProfileEvent.PROFILE_SYNC_STARTED]: { uid: string; timestamp: string };
  [ProfileEvent.PROFILE_SYNC_COMPLETED]: { uid: string; timestamp: string };
  [ProfileEvent.PROFILE_SYNC_FAILED]: { uid: string; error: string; timestamp: string };
  [ProfileEvent.PROFILE_MIGRATED]: {
    uid: string;
    oldVersion: number;
    newVersion: number;
    timestamp: string;
  };
  [ProfileEvent.PROFILE_DELETED]: { uid: string; timestamp: string };
  [ProfileEvent.PROFILE_ERROR]: {
    code: string;
    message: string;
    correlationId: string;
    timestamp: string;
  };
}
