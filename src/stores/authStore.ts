/**
 * 11_HOUR - State Platform Authentication Store
 *
 * Coordinates user session tracking, credentials presentation states,
 * and profile metadata. Coordinates user session tracking, credentials
 * presentation states, and profile lifecycle events.
 */

import { createStateStore } from './platform/factory';
import { STORE_NAMES, StorageType } from './platform/constants';
import { UserProfile } from '@/types';
import { identityServiceInstance } from '@/runtime/identityRegistry';
import { profileServiceInstance } from '@/runtime/profileRegistry';
import { ProfileUtils } from '@/business/domain/profileUtils';

/**
 * Module-level reference to the profile change listener unsubscribe function.
 * Replaces the previous (window as any) global which caused memory leaks and type safety issues.
 */
let _unsubscribeProfileListener: (() => void) | null = null;

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  authStatus: 'loading' | 'unauthenticated' | 'authenticated';
  isLoading: boolean;
  error: string | null;
  resetSuccess: boolean;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  sendForgotPasswordReset: (email: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signInWithFacebook: () => Promise<boolean>;
  clearError: () => void;
  clearResetSuccess: () => void;
  updateProfile: (data: Record<string, unknown>) => Promise<boolean>;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  authStatus: 'loading', // Start in loading to allow observer check
  isLoading: false,
  error: null,
  resetSuccess: false,
};

export const useAuthStore = createStateStore<AuthState, AuthActions>({
  name: STORE_NAMES.AUTH,
  storageType: StorageType.SESSION, // Use Session Storage to survive browser refresh during demo, but clean on tab close
  initialState,
  actions: (set, get) => {
    // Register active authentication observer to synchronize store state dynamically
    identityServiceInstance.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Boostrap/Hydrate the rich user profile
          const domainProfile = await profileServiceInstance.initializeUserProfile(
            user.id,
            user.email,
            user.displayName || null,
            user.photoURL || null,
          );

          const legacyProfile = ProfileUtils.toLegacyProfile(domainProfile);

          set({
            user: legacyProfile,
            isAuthenticated: true,
            authStatus: 'authenticated',
            isLoading: false,
          });

          // Establish a real-time Supabase profile change listener
          if (_unsubscribeProfileListener) {
            try {
              _unsubscribeProfileListener();
            } catch {
              console.debug('Active listener cleanup deferred.');
            }
          }

          _unsubscribeProfileListener = profileServiceInstance.onProfileChanged(
            user.id,
            (updatedDomain) => {
              if (updatedDomain) {
                const updatedLegacy = ProfileUtils.toLegacyProfile(updatedDomain);
                set({ user: updatedLegacy });
              }
            },
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          console.error('⚠️ [AuthStore] Profile initialization failed:', error);
          set({
            user,
            isAuthenticated: true,
            authStatus: 'authenticated',
            isLoading: false,
          });
        }
      } else {
        // Clear snapshot listeners
        if (_unsubscribeProfileListener) {
          try {
            _unsubscribeProfileListener();
          } catch {
            console.debug('Unsubscribe action completed with warning.');
          }
          _unsubscribeProfileListener = null;
        }

        set({
          user: null,
          isAuthenticated: false,
          authStatus: 'unauthenticated',
          isLoading: false,
        });
      }
    });

    return {
      signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          await identityServiceInstance.signIn(email, password);
          return true;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      signUp: async (email, password, displayName) => {
        set({ isLoading: true, error: null });
        try {
          await identityServiceInstance.signUp(email, password, displayName);
          return true;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        set({ isLoading: true, error: null });
        try {
          await identityServiceInstance.signOut();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        } finally {
          set({ isLoading: false });
        }
      },

      sendForgotPasswordReset: async (email) => {
        set({ isLoading: true, error: null, resetSuccess: false });
        try {
          await identityServiceInstance.sendPasswordReset(email);
          set({ resetSuccess: true, isLoading: false });
          return true;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          set({ error: err.message, resetSuccess: false, isLoading: false });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      signInWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          await identityServiceInstance.signInWithGoogle();
          return true;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      signInWithFacebook: async () => {
        set({ isLoading: true, error: null });
        try {
          await identityServiceInstance.signInWithFacebook();
          return true;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      clearResetSuccess: () => {
        set({ resetSuccess: false });
      },

      updateProfile: async (data: Record<string, unknown>) => {
        const currentUser = get().user;
        if (!currentUser) {
          set({ error: 'User is not authenticated' });
          return false;
        }

        set({ isLoading: true, error: null });
        try {
          const updatedDomain = await profileServiceInstance.updateProfile(currentUser.id, data);
          const legacyProfile = ProfileUtils.toLegacyProfile(updatedDomain);
          set({ user: legacyProfile, isLoading: false });
          return true;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          return false;
        }
      },
    };
  },
});
export default useAuthStore;
