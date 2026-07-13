/**
 * 11_HOUR - Firestore Profile Gateway
 * 
 * Part of Slice 1.5: User Identity Profile Platform.
 * Provides high-performance, precise read and write operations targeting the /users collection
 * in Firestore, completely insulating upper layers from raw database SDK calls.
 */

import { IDomainUserProfile, ProfileErrorCode } from '@/business/domain/profileTypes';
import { db, config } from '../config';
import { EMULATOR_CONFIGS } from '../constants';
import { ProfileErrorMapper } from '@/business/domain/profileErrorMapping';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

export class FirestoreProfileGateway {
  private readonly isMock: boolean;
  private readonly mockStore = new Map<string, IDomainUserProfile>();

  constructor() {
    this.isMock = config.apiKey.includes('mock-api-key') && !EMULATOR_CONFIGS.USE_EMULATORS;
  }

  /**
   * Safe, low-overhead read transaction for specific profile document.
   */
  public async readProfile(uid: string): Promise<IDomainUserProfile | null> {
    try {
      if (this.isMock) {
        return this.mockStore.get(uid) || null;
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
   * Safe, low-overhead write transaction for specific profile document.
   */
  public async writeProfile(uid: string, profile: IDomainUserProfile): Promise<void> {
    try {
      if (this.isMock) {
        this.mockStore.set(uid, { ...profile });
        return;
      }

      const docRef = doc(db, 'users', uid);
      await setDoc(docRef, profile, { merge: true });
    } catch (error) {
      throw ProfileErrorMapper.map(error, ProfileErrorCode.PERSISTENCE_FAILED);
    }
  }

  /**
   * Complete document deletion request.
   */
  public async removeProfile(uid: string): Promise<void> {
    try {
      if (this.isMock) {
        this.mockStore.delete(uid);
        return;
      }

      const docRef = doc(db, 'users', uid);
      await deleteDoc(docRef);
    } catch (error) {
      throw ProfileErrorMapper.map(error, ProfileErrorCode.DELETION_FAILED);
    }
  }
}
export const firestoreProfileGatewayInstance = new FirestoreProfileGateway();
export default FirestoreProfileGateway;
