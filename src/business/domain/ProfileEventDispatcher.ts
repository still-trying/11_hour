/**
 * 11_HOUR - Profile Platform Event Dispatcher
 * 
 * Part of Slice 1.5: User Identity Profile Platform.
 * Dispatches highly isolated, pub/sub telemetry notifications for visual observers and sync workers.
 */

import { AppEventBus } from '@/stores/platform/eventBus';
import { ProfileException } from './profileTypes';
import { ProfileLogging } from './profileLogging';

export class ProfileEventDispatcher {
  /**
   * Publishes a profile creation event.
   */
  public dispatchCreated(uid: string): void {
    ProfileLogging.info(`Broadcasting PROFILE_CREATED for user: ${uid}`);
    AppEventBus.publish('PROFILE_CREATED', {
      uid,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Publishes a profile hydration event.
   */
  public dispatchHydrated(uid: string): void {
    ProfileLogging.info(`Broadcasting PROFILE_HYDRATED for user: ${uid}`);
    AppEventBus.publish('PROFILE_HYDRATED', {
      uid,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Publishes a profile updated event.
   */
  public dispatchUpdated(uid: string, fieldsChanged: string[]): void {
    ProfileLogging.info(`Broadcasting PROFILE_UPDATED for user: ${uid}. Fields: ${fieldsChanged.join(', ')}`);
    AppEventBus.publish('PROFILE_UPDATED', {
      uid,
      fieldsChanged,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Publishes a profile sync started event.
   */
  public dispatchSyncStarted(uid: string): void {
    ProfileLogging.info(`Broadcasting PROFILE_SYNC_STARTED for user: ${uid}`);
    AppEventBus.publish('PROFILE_SYNC_STARTED', {
      uid,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Publishes a profile sync completed event.
   */
  public dispatchSyncCompleted(uid: string): void {
    ProfileLogging.info(`Broadcasting PROFILE_SYNC_COMPLETED for user: ${uid}`);
    AppEventBus.publish('PROFILE_SYNC_COMPLETED', {
      uid,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Publishes a profile sync failed event.
   */
  public dispatchSyncFailed(uid: string, error: string): void {
    ProfileLogging.warn(`Broadcasting PROFILE_SYNC_FAILED for user: ${uid}. Error: ${error}`);
    AppEventBus.publish('PROFILE_SYNC_FAILED', {
      uid,
      error,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Publishes a profile migration event.
   */
  public dispatchMigrated(uid: string, oldVersion: number, newVersion: number): void {
    ProfileLogging.info(`Broadcasting PROFILE_MIGRATED for user: ${uid} (v${oldVersion} -> v${newVersion})`);
    AppEventBus.publish('PROFILE_MIGRATED', {
      uid,
      oldVersion,
      newVersion,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Publishes a profile deleted event.
   */
  public dispatchDeleted(uid: string): void {
    ProfileLogging.info(`Broadcasting PROFILE_DELETED for user: ${uid}`);
    AppEventBus.publish('PROFILE_DELETED', {
      uid,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Publishes a profile error event.
   */
  public dispatchError(error: ProfileException): void {
    ProfileLogging.error(`Broadcasting PROFILE_ERROR | Code: ${error.code} | Msg: ${error.message}`);
    AppEventBus.publish('PROFILE_ERROR', {
      code: error.code,
      message: error.message,
      correlationId: error.correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
export const profileEventDispatcherInstance = new ProfileEventDispatcher();
