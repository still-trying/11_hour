/**
 * 11_HOUR - Profile Initialization and Bootstrapping Flow
 * 
 * Part of Slice 1.5: User Identity Profile Platform.
 * Orchestrates user sign-in profile detection, defaults hydration,
 * database migrations, and schema validation.
 */

import { IDomainUserProfile, ProfileErrorCode } from './profileTypes';
import { IProfileRepository } from './ProfileRepository';
import { ProfileSynchronizationManager } from './ProfileSynchronizationManager';
import { profileEventDispatcherInstance } from './ProfileEventDispatcher';
import { ProfileUtils } from './profileUtils';
import { ProfileLogging } from './profileLogging';
import { ProfileDiagnostics } from './profileDiagnostics';
import { PROFILE_VERSION } from './profileConstants';
import { ProfileErrorMapper } from './profileErrorMapping';

export class ProfileInitializationFlow {
  private readonly repository: IProfileRepository;
  private readonly syncManager: ProfileSynchronizationManager;

  constructor(repository: IProfileRepository, syncManager: ProfileSynchronizationManager) {
    this.repository = repository;
    this.syncManager = syncManager;
  }

  /**
   * Orchestrates the complete bootstrapping cycle for an authenticated user's profile.
   * If a profile doesn't exist, it auto-generates a default profile and stores it.
   * If it exists, it validates, migrates, and reconciles the profile document.
   */
  public async execute(uid: string, email: string, displayName?: string | null, photoURL?: string | null): Promise<IDomainUserProfile> {
    try {
      ProfileLogging.info(`Starting initialization flow for user: ${uid} (${email})`);
      
      // 1. Attempt to retrieve remote profile
      const remoteProfile = await this.repository.getProfile(uid);
      const localProfile = this.syncManager.getLocalCache(uid);

      let finalProfile: IDomainUserProfile;

      if (!remoteProfile && !localProfile) {
        // First-time user, generate defaults
        ProfileLogging.info(`No existing profile detected. Creating defaults for user: ${uid}`);
        finalProfile = ProfileUtils.generateDefaultProfile(uid, email, displayName, photoURL);
        
        // Persist default profile
        await this.repository.saveProfile(finalProfile);
        this.syncManager.setLocalCache(uid, finalProfile);
        
        profileEventDispatcherInstance.dispatchCreated(uid);
      } else {
        // Merging and reconciling
        let activeProfile = remoteProfile || localProfile!;

        // 2. Schema Evolution / Migration Support
        if (activeProfile.application.profileVersion < PROFILE_VERSION) {
          activeProfile = await this.migrate(activeProfile, activeProfile.application.profileVersion, PROFILE_VERSION);
        }

        // 3. Diagnostics & Integrity self-healing check
        finalProfile = ProfileDiagnostics.verifyAndHeal(activeProfile);

        // 4. Resolve Cache Reconciliation Conflicts
        if (remoteProfile && localProfile) {
          finalProfile = await this.syncManager.reconcile(localProfile, remoteProfile);
        } else {
          // If only one exists, sync it to both storage layers
          this.syncManager.setLocalCache(uid, finalProfile);
          if (!remoteProfile) {
            await this.repository.saveProfile(finalProfile);
          }
        }
      }

      // 5. Update last login timestamp
      finalProfile.application.lastLoginAt = new Date().toISOString();
      await this.syncManager.scheduleSync(uid, { application: finalProfile.application });

      profileEventDispatcherInstance.dispatchHydrated(uid);
      return finalProfile;
    } catch (error) {
      const domainErr = ProfileErrorMapper.map(error, ProfileErrorCode.INITIALIZATION_FAILED);
      profileEventDispatcherInstance.dispatchError(domainErr);
      throw domainErr;
    }
  }

  /**
   * Processes schema migrations for legacy profiles to avoid database corruption or runtime crashes.
   */
  private async migrate(profile: IDomainUserProfile, fromVersion: number, toVersion: number): Promise<IDomainUserProfile> {
    ProfileLogging.info(`Executing profile version migration: v${fromVersion} -> v${toVersion}`);
    const migrated = { ...profile };

    // Placeholder migration pipeline
    if (fromVersion < 1) {
      // Perform legacy conversions if any
    }

    migrated.application.profileVersion = toVersion;
    migrated.application.updatedAt = new Date().toISOString();

    profileEventDispatcherInstance.dispatchMigrated(profile.uid, fromVersion, toVersion);
    return migrated;
  }
}
export default ProfileInitializationFlow;
