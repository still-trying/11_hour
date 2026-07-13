/**
 * 11_HOUR - Profile Synchronization Manager
 * 
 * Part of Slice 1.5: User Identity Profile Platform.
 * Orchestrates offline-first caches, local queue buffers, optimistic merges, and conflict reconciliation.
 */

import { IDomainUserProfile, ProfileErrorCode } from './profileTypes';
import { IProfileRepository } from './ProfileRepository';
import { profileEventDispatcherInstance } from './ProfileEventDispatcher';
import { ProfileLogging } from './profileLogging';
import { ProfileErrorMapper } from './profileErrorMapping';
import { 
  PROFILE_LOCAL_CACHE_KEY, 
  PROFILE_QUEUE_KEY 
} from './profileConstants';
import { ProfileUtils } from './profileUtils';

export class ProfileSynchronizationManager {
  private readonly repository: IProfileRepository;
  private syncQueue: Partial<IDomainUserProfile>[] = [];
  private isProcessingSync = false;

  constructor(repository: IProfileRepository) {
    this.repository = repository;
    this.hydrateQueueFromLocalStorage();
  }

  /**
   * Reads or writes profile to local offline storage cache.
   */
  public getLocalCache(uid: string): IDomainUserProfile | null {
    try {
      const cached = localStorage.getItem(`${PROFILE_LOCAL_CACHE_KEY}_${uid}`);
      return cached ? (JSON.parse(cached) as IDomainUserProfile) : null;
    } catch (e) {
      ProfileLogging.warn('Failed to access local profile storage cache.', e);
      return null;
    }
  }

  /**
   * Sets profile to local offline storage cache.
   */
  public setLocalCache(uid: string, profile: IDomainUserProfile): void {
    try {
      localStorage.setItem(`${PROFILE_LOCAL_CACHE_KEY}_${uid}`, JSON.stringify(profile));
    } catch (e) {
      ProfileLogging.warn('Failed to set local profile storage cache.', e);
    }
  }

  /**
   * Removes profile from local offline storage cache.
   */
  public clearLocalCache(uid: string): void {
    try {
      localStorage.removeItem(`${PROFILE_LOCAL_CACHE_KEY}_${uid}`);
    } catch (e) {
      ProfileLogging.warn('Failed to clear local profile storage cache.', e);
    }
  }

  /**
   * Schedules a change to be synchronized, committing it locally and queueing it.
   */
  public async scheduleSync(uid: string, changes: Partial<IDomainUserProfile>): Promise<IDomainUserProfile> {
    try {
      profileEventDispatcherInstance.dispatchSyncStarted(uid);

      // 1. Load active state, merge changes
      const current = this.getLocalCache(uid);
      if (!current) {
        throw new Error('No local profile cached. Must load or generate profile first.');
      }

      const updatedProfile = ProfileUtils.deepMerge(current, changes);
      updatedProfile.application.updatedAt = new Date().toISOString();

      // 2. Commit to local cache immediately (Optimistic rendering)
      this.setLocalCache(uid, updatedProfile);

      // 3. Queue changes for backend write
      this.enqueueSyncItem(uid, changes);

      // 4. Fire trigger to process background write
      this.triggerProcessQueue().catch((err) => {
        ProfileLogging.warn('Background sync processor deferred.', err);
      });

      return updatedProfile;
    } catch (error) {
      const domainErr = ProfileErrorMapper.map(error, ProfileErrorCode.PERSISTENCE_FAILED);
      profileEventDispatcherInstance.dispatchSyncFailed(uid, domainErr.message);
      throw domainErr;
    }
  }

  /**
   * Attempts to reconcile local profile with remote server document using a last-write-wins merge strategy.
   */
  public async reconcile(local: IDomainUserProfile, remote: IDomainUserProfile): Promise<IDomainUserProfile> {
    const localTime = new Date(local.application.updatedAt).getTime();
    const remoteTime = new Date(remote.application.updatedAt).getTime();

    if (localTime >= remoteTime) {
      // Local changes are newer, overwrite remote document
      ProfileLogging.info(`Reconciliation: Local profile is newer than remote. Syncing to remote.`);
      await this.repository.saveProfile(local);
      return local;
    } else {
      // Remote changes are newer, overwrite local cache
      ProfileLogging.info(`Reconciliation: Remote profile is newer than local. Pulling remote state.`);
      this.setLocalCache(local.uid, remote);
      return remote;
    }
  }

  /**
   * Triggers the asynchronous queue consumer to write pending queue items to database.
   */
  private async triggerProcessQueue(): Promise<void> {
    if (this.isProcessingSync || this.syncQueue.length === 0) {
      return;
    }

    this.isProcessingSync = true;
    ProfileLogging.info(`Starting background synchronization queue processing (${this.syncQueue.length} items)...`);

    while (this.syncQueue.length > 0) {
      const activeChanges = this.syncQueue[0];
      const uid = (activeChanges as any).uid;

      if (!uid) {
        this.syncQueue.shift();
        this.persistQueueToLocalStorage();
        continue;
      }

      try {
        const localCached = this.getLocalCache(uid);
        if (localCached) {
          // Attempt to write the fully merged local representation back to server
          await this.repository.saveProfile(localCached);
          profileEventDispatcherInstance.dispatchSyncCompleted(uid);
        }
        
        // Remove successfully synced item
        this.syncQueue.shift();
        this.persistQueueToLocalStorage();
      } catch (error) {
        ProfileLogging.warn(`Sync queue block failed write. Retrying on next cycle.`, error);
        // Break out of cycle if network is offline to prevent blocking loop
        break;
      }
    }

    this.isProcessingSync = false;
    ProfileLogging.info(`Finished background synchronization processing.`);
  }

  private enqueueSyncItem(uid: string, changes: Partial<IDomainUserProfile>): void {
    const itemWithId = { uid, ...changes };
    this.syncQueue.push(itemWithId);
    this.persistQueueToLocalStorage();
  }

  private hydrateQueueFromLocalStorage(): void {
    try {
      const rawQueue = localStorage.getItem(PROFILE_QUEUE_KEY);
      if (rawQueue) {
        this.syncQueue = JSON.parse(rawQueue);
      }
    } catch (e) {
      ProfileLogging.warn('Failed reading persistent sync queue.', e);
    }
  }

  private persistQueueToLocalStorage(): void {
    try {
      localStorage.setItem(PROFILE_QUEUE_KEY, JSON.stringify(this.syncQueue));
    } catch (e) {
      ProfileLogging.warn('Failed saving persistent sync queue.', e);
    }
  }
}
export default ProfileSynchronizationManager;
