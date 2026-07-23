/**
 * 11_HOUR - Supabase Profile Repository
 *
 * Part of Slice 1.5: User Identity Profile Platform (Supabase Migration).
 * Implements IProfileRepository using Supabase PostgreSQL.
 * Stores and retrieves user profiles from the 'user_profiles' table.
 */

import { supabase } from '@/lib/supabase/client';
import type { IProfileRepository } from '@/business/domain/ProfileRepository';
import type { IDomainUserProfile } from '@/business/domain/profileTypes';
import { ProfileException, ProfileErrorCode } from '@/business/domain/profileTypes';

const PROFILE_TABLE = 'user_profiles';

export class SupabaseProfileRepository implements IProfileRepository {
  /**
   * Persists the user profile to the Supabase 'user_profiles' table.
   */
  public async saveProfile(profile: IDomainUserProfile): Promise<void> {
    const { error } = await supabase.from(PROFILE_TABLE).upsert(
      {
        id: profile.uid,
        uid: profile.uid,
        display_name: profile.displayName,
        email: profile.email,
        photo_url: profile.photoURL,
        preferences: profile.preferences,
        application: profile.application,
        future_ready: profile.futureReady,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );

    if (error) {
      throw new ProfileException(
        ProfileErrorCode.PERSISTENCE_FAILED,
        `Failed to save profile: ${error.message}`,
        undefined,
        error,
      );
    }
  }

  /**
   * Retrieves a user profile by user ID from the Supabase table.
   */
  public async getProfile(uid: string): Promise<IDomainUserProfile | null> {
    const { data, error } = await supabase.from(PROFILE_TABLE).select('*').eq('id', uid).single();

    if (error) {
      // PGRST116 = no rows returned
      if (error.code === 'PGRST116') return null;
      throw new ProfileException(
        ProfileErrorCode.INITIALIZATION_FAILED,
        `Failed to retrieve profile: ${error.message}`,
        undefined,
        error,
      );
    }

    if (!data) return null;

    return this.rowToDomainProfile(data);
  }

  /**
   * Deletes a user profile from the Supabase table.
   */
  public async deleteProfile(uid: string): Promise<void> {
    const { error } = await supabase.from(PROFILE_TABLE).delete().eq('id', uid);

    if (error) {
      throw new ProfileException(
        ProfileErrorCode.DELETION_FAILED,
        `Failed to delete profile: ${error.message}`,
        undefined,
        error,
      );
    }
  }

  /**
   * Subscribes to real-time changes to a user's profile.
   */
  public onProfileChanged(
    uid: string,
    callback: (profile: IDomainUserProfile | null) => void,
  ): () => void {
    const channel = supabase
      .channel(`profile-changes-${uid}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: PROFILE_TABLE,
          filter: `id=eq.${uid}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            callback(this.rowToDomainProfile(payload.new as Record<string, unknown>));
          } else {
            callback(null);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Converts a raw Supabase row into the domain IDomainUserProfile type.
   */
  private rowToDomainProfile(row: Record<string, unknown>): IDomainUserProfile {
    return {
      uid: String(row.uid || row.id || ''),
      displayName: (row.display_name as string) || null,
      email: String(row.email || ''),
      photoURL: (row.photo_url as string) || null,
      preferences: (row.preferences as IDomainUserProfile['preferences']) || {
        theme: 'dark',
        locale: 'en-US',
        timezone: 'UTC',
        reducedMotion: false,
        notificationPreferences: {
          email: true,
          push: true,
          sms: false,
          urgencyThreshold: 'high',
        },
      },
      application: (row.application as IDomainUserProfile['application']) || {
        onboardingCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profileVersion: 1,
      },
      futureReady: (row.future_ready as IDomainUserProfile['futureReady']) || {
        aiPreferences: {
          coachingStyle: 'assertive',
          preferredModel: 'gemini-2.5-flash',
          temperature: 0.7,
          autoRefactorEnabled: false,
        },
        productivityPreferences: {
          defaultBlockDurationMinutes: 25,
          dailyFocusGoalMinutes: 120,
          enableSoundAlerts: true,
          enableBreakTimer: true,
        },
        personalization: { skillLevel: 'beginner' },
        featureFlags: {
          enableDeepCoaching: false,
          enableTimelineRefactor: true,
          enableVisualMetrics: false,
        },
      },
    };
  }
}

export const supabaseProfileRepositoryInstance = new SupabaseProfileRepository();
export default SupabaseProfileRepository;
