/**
 * 11_HOUR - Firebase Authentication Adapter
 * 
 * Part of Slice 1.2: Identity Infrastructure.
 * Adapts raw, infrastructure-specific Firebase User payloads into strongly-typed
 * domain UserProfile structures, fully isolating the UI and domain layers.
 */

import { User } from 'firebase/auth';
import { UserProfile } from '@/types';

export class AuthAdapter {
  /**
   * Adapts a raw Firebase SDK User object into a standard domain UserProfile object.
   */
  public static toDomain(firebaseUser: User, customDisplayName?: string): UserProfile {
    const creationTime = firebaseUser.metadata.creationTime 
      ? new Date(firebaseUser.metadata.creationTime).toISOString() 
      : new Date().toISOString();

    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: customDisplayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Unknown User',
      photoURL: firebaseUser.photoURL || undefined,
      createdAt: creationTime,
    };
  }
}
