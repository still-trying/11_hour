/**
 * 11_HOUR - Profile Domain Repository Interface
 * 
 * Part of Slice 1.5: User Identity Profile Platform.
 * Enforces the contract for saving, loading, deleting, and syncing active profiles
 * without exposing the underlying database SDK or storage medium.
 */

import { IDomainUserProfile } from './profileTypes';

export interface IProfileRepository {
  /**
   * Persists the user profile document to durable cloud or high-fidelity local memory storage.
   */
  saveProfile(profile: IDomainUserProfile): Promise<void>;

  /**
   * Loads the user profile by user auth ID. Returns null if no record exists.
   */
  getProfile(uid: string): Promise<IDomainUserProfile | null>;

  /**
   * Deletes the user profile document completely.
   */
  deleteProfile(uid: string): Promise<void>;

  /**
   * Registers a callback listener triggered when user profile undergoes database updates.
   */
  onProfileChanged(uid: string, callback: (profile: IDomainUserProfile | null) => void): () => void;
}
export default IProfileRepository;
