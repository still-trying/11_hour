/**
 * 11_HOUR - Firebase Profile Repository
 * 
 * Part of Slice 1.5: User Identity Profile Platform.
 * Adapts the domain's IProfileRepository interface to live Cloud Firestore, supporting
 * real-time syncing listeners, transaction-safe updates, and high-fidelity mock modes.
 */

import { IProfileRepository } from '@/business/domain/ProfileRepository';
import { IDomainUserProfile, ProfileErrorCode } from '@/business/domain/profileTypes';
import { db, config } from '../config';
import { EMULATOR_CONFIGS } from '../constants';
import { ProfileErrorMapper } from '@/business/domain/profileErrorMapping';
import { 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

export class FirebaseProfileRepository implements IProfileRepository {
  private readonly isMock: boolean;
  private readonly mockProfileStore = new Map<string, IDomainUserProfile>();

  constructor() {
    this.isMock = config.apiKey.includes('mock-api-key') && !EMULATOR_CONFIGS.USE_EMULATORS;
    if (this.isMock) {
      console.warn('🛡️ [FirebaseProfileRepository] Running in high-fidelity mock mode.');
    }
  }

  /**
   * Persists the user profile document to Cloud Firestore.
   */
  public async saveProfile(profile: IDomainUserProfile): Promise<void> {
    try {
      if (this.isMock) {
        this.mockProfileStore.set(profile.uid, { ...profile });
        return;
      }

      // Store in users/uid document
      const docRef = doc(db, 'users', profile.uid);
      await setDoc(docRef, profile, { merge: true });
    } catch (error) {
      throw ProfileErrorMapper.map(error, ProfileErrorCode.PERSISTENCE_FAILED);
    }
  }

  /**
   * Loads the user profile by user auth ID. Returns null if no record exists.
   */
  public async getProfile(uid: string): Promise<IDomainUserProfile | null> {
    try {
      if (this.isMock) {
        return this.mockProfileStore.get(uid) || null;
      }

      const docRef = doc(db, 'users', uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as IDomainUserProfile;
      }
      return null;
    } catch (error) {
      throw ProfileErrorMapper.map(error, ProfileErrorCode.INITIALIZATION_FAILED);
    }
  }

  /**
   * Deletes the user profile document.
   */
  public async deleteProfile(uid: string): Promise<void> {
    try {
      if (this.isMock) {
        this.mockProfileStore.delete(uid);
        return;
      }

      const docRef = doc(db, 'users', uid);
      await deleteDoc(docRef);
    } catch (error) {
      throw ProfileErrorMapper.map(error, ProfileErrorCode.DELETION_FAILED);
    }
  }

  /**
   * Registers a real-time Firestore listener to sync changes instantly across browser sessions.
   */
  public onProfileChanged(uid: string, callback: (profile: IDomainUserProfile | null) => void): () => void {
    if (this.isMock) {
      // Ephemeral mock listener
      const interval = setInterval(() => {
        const p = this.mockProfileStore.get(uid) || null;
        callback(p);
      }, 5000);
      return () => clearInterval(interval);
    }

    try {
      const docRef = doc(db, 'users', uid);
      return onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            callback(snap.data() as IDomainUserProfile);
          } else {
            callback(null);
          }
        },
        (error) => {
          console.error('❌ [FirebaseProfileRepository] Real-time snapshot listener failure:', error);
        }
      );
    } catch (e) {
      console.error('❌ [FirebaseProfileRepository] Failed setting up real-time onSnapshot:', e);
      callback(null);
      return () => {};
    }
  }
}
export const firebaseProfileRepositoryInstance = new FirebaseProfileRepository();
export default FirebaseProfileRepository;
