/**
 * 11_HOUR - Identity Service Domain Controller
 *
 * Part of Slice 1.2: Identity Infrastructure.
 * Coordinates input validation, repository calls, and central diagnostic events.
 * Fully decoupled from specific platform-rendering frameworks.
 */

import { IAuthRepository } from './AuthRepository';
import { UserProfile } from '@/types';
import { signInSchema, signUpSchema, passwordResetSchema } from './authValidators';
import { AuthException, AuthErrorCode } from './authTypes';
import { AppEventBus } from '@/stores/platform/eventBus';

export class IdentityService {
  private readonly authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  /**
   * Retrieves the current user's profile metadata.
   */
  public async getCurrentUser(): Promise<UserProfile | null> {
    try {
      return await this.authRepository.getCurrentUser();
    } catch (error) {
      console.error('❌ [IdentityService] Failed to retrieve current user:', error);
      return null;
    }
  }

  /**
   * Authenticates a user using email and password credentials.
   */
  public async signIn(email: string, password: string): Promise<UserProfile> {
    // 1. Client-Side Input Validation
    const validation = signInSchema.safeParse({ email, password });
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid input credentials';
      throw new AuthException(AuthErrorCode.INVALID_EMAIL, firstError);
    }

    try {
      console.info(`🔒 [IdentityService] Attempting authentication for email: ${email}`);
      const userProfile = await this.authRepository.signInWithEmail(email, password);

      // 2. Broadcast success event
      AppEventBus.publish('USER_SIGNED_IN', { uid: userProfile.id, email: userProfile.email });
      return userProfile;
    } catch (error) {
      console.error(`❌ [IdentityService] Authentication failed for ${email}:`, error);
      throw error;
    }
  }

  /**
   * Registers a new user account with display name and password credentials.
   */
  public async signUp(email: string, password: string, displayName: string): Promise<UserProfile> {
    // 1. Client-Side Input Validation
    const validation = signUpSchema.safeParse({ email, password, displayName });
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Registration validation failed';
      throw new AuthException(AuthErrorCode.WEAK_PASSWORD, firstError);
    }

    try {
      console.info(`🔒 [IdentityService] Initiating registration workflow for email: ${email}`);
      const userProfile = await this.authRepository.signUpWithEmail(email, password, displayName);

      // 2. Broadcast success event
      AppEventBus.publish('USER_SIGNED_IN', { uid: userProfile.id, email: userProfile.email });
      return userProfile;
    } catch (error) {
      console.error(`❌ [IdentityService] Registration workflow failed for ${email}:`, error);
      throw error;
    }
  }

  /**
   * Authenticates a user using Google OAuth.
   */
  public async signInWithGoogle(): Promise<UserProfile> {
    try {
      console.info('🔒 [IdentityService] Spawning Google OAuth flow...');
      const userProfile = await this.authRepository.signInWithGoogle();

      // 2. Broadcast success event
      AppEventBus.publish('USER_SIGNED_IN', { uid: userProfile.id, email: userProfile.email });
      return userProfile;
    } catch (error) {
      console.error('❌ [IdentityService] Google OAuth flow failed:', error);
      throw error;
    }
  }

  /**
   * Authenticates a user using Facebook OAuth.
   */
  public async signInWithFacebook(): Promise<UserProfile> {
    try {
      console.info('🔒 [IdentityService] Spawning Facebook OAuth flow...');
      const userProfile = await this.authRepository.signInWithFacebook();

      AppEventBus.publish('USER_SIGNED_IN', { uid: userProfile.id, email: userProfile.email });
      return userProfile;
    } catch (error) {
      console.error('❌ [IdentityService] Facebook OAuth flow failed:', error);
      throw error;
    }
  }

  /**
   * Closes the active authenticated user session.
   */
  public async signOut(): Promise<void> {
    try {
      console.info('🔒 [IdentityService] Terminating authenticated user session...');
      await this.authRepository.signOut();
    } catch (error) {
      console.error('❌ [IdentityService] Sign out failed:', error);
      throw error;
    }
  }

  /**
   * Dispatches a secure, automated password-reset email link.
   */
  public async sendPasswordReset(email: string): Promise<void> {
    // 1. Client-Side Input Validation
    const validation = passwordResetSchema.safeParse({ email });
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid email format';
      throw new AuthException(AuthErrorCode.INVALID_EMAIL, firstError);
    }

    try {
      console.info(`🔒 [IdentityService] Sending password reset for email: ${email}`);
      await this.authRepository.sendPasswordReset(email);
    } catch (error) {
      console.error(`❌ [IdentityService] Password reset failed for ${email}:`, error);
      throw error;
    }
  }

  /**
   * Subscribes to dynamic auth lifecycle triggers.
   */
  public onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    return this.authRepository.onAuthStateChanged(callback);
  }
}
