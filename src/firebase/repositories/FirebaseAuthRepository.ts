/**
 * 11_HOUR - Firebase Authentication Repository
 * 
 * Part of Slice 1.2: Identity Infrastructure.
 * Implements the IAuthRepository contract, bridging domain requests with
 * the lower-level AuthGateway and Firebase Web SDK.
 */

import { updateProfile } from 'firebase/auth';
import { auth, config } from '../config';
import { IAuthRepository } from '@/business/domain/AuthRepository';
import { UserProfile } from '@/types';
import { AuthGateway } from '../gateways/AuthGateway';
import { AuthAdapter } from '../adapters/AuthAdapter';
import { EMULATOR_CONFIGS } from '../constants';

export class FirebaseAuthRepository implements IAuthRepository {
  private readonly authGateway: AuthGateway;
  private readonly isMock: boolean;

  constructor(authGateway: AuthGateway) {
    this.authGateway = authGateway;
    this.isMock = config.apiKey.includes('mock-api-key') && !EMULATOR_CONFIGS.USE_EMULATORS;
  }

  public getCurrentUserId(): string | null {
    return this.authGateway.getCurrentUserId();
  }

  public async getCurrentUser(): Promise<UserProfile | null> {
    const uid = this.getCurrentUserId();
    if (!uid) {
      return null;
    }

    if (this.isMock) {
      return {
        id: uid,
        email: 'mock-user@11hour.app',
        displayName: 'Mock User',
        createdAt: new Date().toISOString(),
      };
    }

    const user = auth.currentUser;
    return user ? AuthAdapter.toDomain(user) : null;
  }

  public async signInWithEmail(email: string, password: string): Promise<UserProfile> {
    const uid = await this.authGateway.signInWithEmailAndPassword(email, password);

    if (this.isMock) {
      return {
        id: uid,
        email,
        displayName: email.split('@')[0],
        createdAt: new Date().toISOString(),
      };
    }

    const user = auth.currentUser;
    if (!user) {
      throw new Error('User session not loaded after successful gateway authentication.');
    }

    return AuthAdapter.toDomain(user);
  }

  public async signUpWithEmail(email: string, password: string, displayName: string): Promise<UserProfile> {
    const uid = await this.authGateway.signUpWithEmailAndPassword(email, password);

    if (this.isMock) {
      return {
        id: uid,
        email,
        displayName,
        createdAt: new Date().toISOString(),
      };
    }

    const user = auth.currentUser;
    if (!user) {
      throw new Error('User session not created after successful gateway signup.');
    }

    // Set displayName on the live Firebase User profile
    try {
      await updateProfile(user, { displayName });
    } catch (e) {
      console.warn('⚠️ [FirebaseAuthRepository] Failed to attach displayName to user profile:', e);
    }

    return AuthAdapter.toDomain(user, displayName);
  }

  public async signInWithGoogle(): Promise<UserProfile> {
    await this.authGateway.signInWithGoogle();

    if (this.isMock) {
      return {
        id: 'mock-uid-11hour',
        email: 'mock-google@11hour.app',
        displayName: 'Google Mock User',
        createdAt: new Date().toISOString(),
      };
    }

    const user = auth.currentUser;
    if (!user) {
      throw new Error('User session not loaded after successful Google OAuth trigger.');
    }

    return AuthAdapter.toDomain(user);
  }

  public async signOut(): Promise<void> {
    await this.authGateway.signOut();
  }

  public async sendPasswordReset(email: string): Promise<void> {
    await this.authGateway.sendPasswordResetEmail(email);
  }

  public onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    return this.authGateway.onAuthStateChanged((uid) => {
      if (!uid) {
        callback(null);
        return;
      }

      if (this.isMock) {
        callback({
          id: uid,
          email: 'mock-user@11hour.app',
          displayName: 'Mock User',
          createdAt: new Date().toISOString(),
        });
        return;
      }

      const user = auth.currentUser;
      callback(user ? AuthAdapter.toDomain(user) : null);
    });
  }
}
