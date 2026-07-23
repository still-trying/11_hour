/**
 * 11_HOUR - Authentication Repository Interface
 *
 * Part of Slice 1.2: Identity Infrastructure.
 * Establishes the decoupled domain contract for authentication gateways, fully hiding
 * raw Auth SDK references from the application and presentation layers.
 */

import { UserProfile } from '@/types';

export interface IAuthRepository {
  /**
   * Returns the current authenticated user's ID or null if unauthenticated.
   */
  getCurrentUserId(): string | null;

  /**
   * Retrieves the current user's profile metadata or null if unauthenticated.
   */
  getCurrentUser(): Promise<UserProfile | null>;

  /**
   * Performs credentials-based email/password sign-in.
   * Returns the authenticated user's profile.
   */
  signInWithEmail(email: string, password: string): Promise<UserProfile>;

  /**
   * Registers a new credentials-based user account and populates profile metadata.
   * Returns the newly created user's profile.
   */
  signUpWithEmail(email: string, password: string, displayName: string): Promise<UserProfile>;

  /**
   * Signs in a user using Google OAuth.
   * Returns the authenticated user's profile.
   */
  signInWithGoogle(): Promise<UserProfile>;

  /**
   * Signs in a user using Facebook OAuth.
   * Returns the authenticated user's profile.
   */
  signInWithFacebook(): Promise<UserProfile>;

  /**
   * Logs out the current user session.
   */
  signOut(): Promise<void>;

  /**
   * Triggers a password reset instruction email.
   */
  sendPasswordReset(email: string): Promise<void>;

  /**
   * Registers an active subscription listener watching for user session state changes.
   * Emits the UserProfile or null when the authentication state shifts.
   */
  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void;
}
