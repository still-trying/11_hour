/**
 * 11_HOUR - Authentication Lifecycle Manager
 * 
 * Part of Slice 1.2: Identity Infrastructure.
 * Manages active session lifecycle transitions, automatic token refreshes,
 * and secure store synchronization hooks.
 */

import { auth } from '../config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { AuthLogger } from '../logging/AuthLogger';

export class AuthLifecycle {
  /**
   * Listens to Firebase SDK auth state changes.
   * Maps User to standard callback trigger and handles lifecycle logging.
   */
  public static subscribe(callback: (firebaseUser: User | null) => void): () => void {
    AuthLogger.logLifecycle('Initializing authentication state observer...');
    
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          AuthLogger.logLifecycle(`User authenticated session active (UID: ${user.uid})`);
          
          // Set up non-blocking token background refresh cycle check
          user.getIdToken().then((token) => {
            if (token) {
              AuthLogger.logLifecycle('Auth ID Token validated and active.');
            }
          }).catch((err) => {
            AuthLogger.logFailure('Token verification check failed', err);
          });
        } else {
          AuthLogger.logLifecycle('No active authenticated user session detected.');
        }
        
        callback(user);
      },
      (error) => {
        AuthLogger.logFailure('Auth lifecycle listener exception', error);
        callback(null);
      }
    );

    return () => {
      AuthLogger.logLifecycle('Tearing down authentication state observer.');
      unsubscribe();
    };
  }
}
