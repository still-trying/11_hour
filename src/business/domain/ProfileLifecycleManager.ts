/**
 * 11_HOUR - Profile Platform Lifecycle Manager
 * 
 * Part of Slice 1.5: User Identity Profile Platform.
 * Coordinates user-specific onboarding completion, account deletion, and custom user settings updates.
 */

import { IDomainUserProfile, ProfileErrorCode } from './profileTypes';
import { IProfileRepository } from './ProfileRepository';
import { ProfileSynchronizationManager } from './ProfileSynchronizationManager';
import { profileEventDispatcherInstance } from './ProfileEventDispatcher';
import { ProfileLogging } from './profileLogging';
import { ProfileErrorMapper } from './profileErrorMapping';

export class ProfileLifecycleManager {
  private readonly repository: IProfileRepository;
  private readonly syncManager: ProfileSynchronizationManager;

  constructor(repository: IProfileRepository, syncManager: ProfileSynchronizationManager) {
    this.repository = repository;
    this.syncManager = syncManager;
  }

  /**
   * Updates specific settings inside the user profile, handling background synchronization.
   */
  public async updateProfile(uid: string, changes: Partial<IDomainUserProfile>): Promise<IDomainUserProfile> {
    try {
      ProfileLogging.info(`Initiating profile update request for user: ${uid}`);
      
      const updated = await this.syncManager.scheduleSync(uid, changes);
      
      // Determine what high-level areas changed for audit trails
      const changedKeys = Object.keys(changes);
      profileEventDispatcherInstance.dispatchUpdated(uid, changedKeys);
      ProfileLogging.audit('ProfileUpdated', uid, true, { changedKeys });

      return updated;
    } catch (error) {
      const domainErr = ProfileErrorMapper.map(error, ProfileErrorCode.PERSISTENCE_FAILED);
      profileEventDispatcherInstance.dispatchError(domainErr);
      throw domainErr;
    }
  }

  /**
   * Marks user onboarding as fully completed, allowing access to active dashboards.
   */
  public async completeOnboarding(uid: string): Promise<IDomainUserProfile> {
    try {
      ProfileLogging.info(`User: ${uid} completed onboarding cycle.`);
      const current = this.syncManager.getLocalCache(uid);
      if (!current) {
        throw new Error('Profile not loaded.');
      }

      const updatedApplication = {
        ...current.application,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString(),
      };

      const updated = await this.syncManager.scheduleSync(uid, {
        application: updatedApplication,
      });

      profileEventDispatcherInstance.dispatchUpdated(uid, ['application.onboardingCompleted']);
      ProfileLogging.audit('OnboardingCompleted', uid, true);

      return updated;
    } catch (error) {
      const domainErr = ProfileErrorMapper.map(error, ProfileErrorCode.PERSISTENCE_FAILED);
      throw domainErr;
    }
  }

  /**
   * Deletes user profiles completely.
   */
  public async deleteAccount(uid: string): Promise<void> {
    try {
      ProfileLogging.info(`Processing account deletion request for user: ${uid}`);
      ProfileLogging.audit('AccountDeletionStarted', uid, true);

      // 1. Delete remote storage representation
      await this.repository.deleteProfile(uid);

      // 2. Clear local storage cache
      this.syncManager.clearLocalCache(uid);

      // 3. Dispatch event
      profileEventDispatcherInstance.dispatchDeleted(uid);
      ProfileLogging.audit('AccountDeletionCompleted', uid, true);
    } catch (error) {
      const domainErr = ProfileErrorMapper.map(error, ProfileErrorCode.DELETION_FAILED);
      profileEventDispatcherInstance.dispatchError(domainErr);
      throw domainErr;
    }
  }

  /**
   * Future account export/import hooks to facilitate easy user backups.
   */
  public async exportUserData(uid: string): Promise<string> {
    try {
      ProfileLogging.info(`Exporting backup database snapshot for user: ${uid}`);
      const profile = this.syncManager.getLocalCache(uid) || await this.repository.getProfile(uid);
      if (!profile) {
        throw new Error('User profile does not exist.');
      }
      return JSON.stringify(profile, null, 2);
    } catch (error) {
      throw ProfileErrorMapper.map(error, ProfileErrorCode.AUDIT_FAILED);
    }
  }
}
export default ProfileLifecycleManager;
