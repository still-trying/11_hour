/**
 * 11_HOUR - Profile Domain Business Service
 *
 * Part of Slice 1.5: User Identity Profile Platform.
 * Acts as the primary orchestrator, unifying initialization flows, synchronization queues,
 * and profile lifecycle actions under a clean public API.
 */

import { IDomainUserProfile } from './profileTypes';
import { IProfileRepository } from './ProfileRepository';
import { ProfileSynchronizationManager } from './ProfileSynchronizationManager';
import { ProfileInitializationFlow } from './ProfileInitializationFlow';
import { ProfileLifecycleManager } from './ProfileLifecycleManager';

export class ProfileService {
  private readonly repository: IProfileRepository;
  private readonly syncManager: ProfileSynchronizationManager;
  private readonly initFlow: ProfileInitializationFlow;
  private readonly lifecycleManager: ProfileLifecycleManager;

  constructor(repository: IProfileRepository) {
    this.repository = repository;
    this.syncManager = new ProfileSynchronizationManager(repository);
    this.initFlow = new ProfileInitializationFlow(repository, this.syncManager);
    this.lifecycleManager = new ProfileLifecycleManager(repository, this.syncManager);
  }

  /**
   * Bootstraps the profile of an authenticated user.
   */
  public async initializeUserProfile(
    uid: string,
    email: string,
    displayName?: string | null,
    photoURL?: string | null,
  ): Promise<IDomainUserProfile> {
    return this.initFlow.execute(uid, email, displayName, photoURL);
  }

  /**
   * Retrieves user profile from the local offline storage cache.
   */
  public getCachedProfile(uid: string): IDomainUserProfile | null {
    return this.syncManager.getLocalCache(uid);
  }

  /**
   * Updates user preferences, identity fields, or future-ready flags.
   */
  public async updateProfile(
    uid: string,
    changes: Partial<IDomainUserProfile>,
  ): Promise<IDomainUserProfile> {
    return this.lifecycleManager.updateProfile(uid, changes);
  }

  /**
   * Formally sets the onboarding state to completed.
   */
  public async completeOnboarding(uid: string): Promise<IDomainUserProfile> {
    return this.lifecycleManager.completeOnboarding(uid);
  }

  /**
   * Permanently deletes user account and profile data.
   */
  public async deleteAccount(uid: string): Promise<void> {
    return this.lifecycleManager.deleteAccount(uid);
  }

  /**
   * Generates a structural JSON backup for user data.
   */
  public async exportUserData(uid: string): Promise<string> {
    return this.lifecycleManager.exportUserData(uid);
  }

  /**
   * Registers callback to listen for real-time document updates.
   */
  public onProfileChanged(
    uid: string,
    callback: (profile: IDomainUserProfile | null) => void,
  ): () => void {
    return this.repository.onProfileChanged(uid, (profile) => {
      if (profile) {
        // Sync local cache with real-time remote updates
        this.syncManager.setLocalCache(uid, profile);
      }
      callback(profile);
    });
  }
}
export default ProfileService;
