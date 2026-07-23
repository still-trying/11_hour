/**
 * 11_HOUR - Profile System Utilities
 *
 * Part of Slice 1.5: User Identity Profile Platform.
 * Provides deep merging, standard fallback conversions, default generator,
 * and mapping between legacy UserProfile models and comprehensive IDomainUserProfile objects.
 */

import { IDomainUserProfile } from './profileTypes';
import { UserProfile } from '@/types';
import { DEFAULT_PREFERENCES, DEFAULT_FUTURE_READY, PROFILE_VERSION } from './profileConstants';

export class ProfileUtils {
  /**
   * Generates a fully compliant, production-ready default profile for a newly authenticated user.
   */
  public static generateDefaultProfile(
    uid: string,
    email: string,
    displayName?: string | null,
    photoURL?: string | null,
  ): IDomainUserProfile {
    const now = new Date().toISOString();
    return {
      uid,
      displayName: displayName || null,
      email,
      photoURL: photoURL || null,
      preferences: { ...DEFAULT_PREFERENCES },
      application: {
        onboardingCompleted: false,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
        profileVersion: PROFILE_VERSION,
      },
      futureReady: { ...DEFAULT_FUTURE_READY },
    };
  }

  /**
   * Maps a fully specified Domain Profile back to the legacy/backward-compatible UserProfile type.
   */
  public static toLegacyProfile(domainProfile: IDomainUserProfile): UserProfile {
    return {
      id: domainProfile.uid,
      email: domainProfile.email,
      displayName: domainProfile.displayName || undefined,
      photoURL: domainProfile.photoURL || undefined,
      createdAt: domainProfile.application.createdAt,
      // Pass these as dynamic fields to ensure seamless backward-compatibility
      preferences: domainProfile.preferences,
      application: domainProfile.application,
      futureReady: domainProfile.futureReady,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }

  /**
   * Performs deep merging on partial profile updates.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const output = { ...target };
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach((key) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sourceVal = (source as any)[key];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const targetVal = (target as any)[key];
        if (this.isObject(sourceVal)) {
          if (!(key in target)) {
            Object.assign(output, { [key]: sourceVal });
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (output as any)[key] = this.deepMerge(targetVal, sourceVal);
          }
        } else {
          Object.assign(output, { [key]: sourceVal });
        }
      });
    }
    return output;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
}
export default ProfileUtils;
