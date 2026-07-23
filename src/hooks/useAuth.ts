import { useAuthStore, AuthState, AuthActions } from '@/stores/authStore';
import { BaseState, BaseActions } from '@/stores/platform/contracts';

type CombinedStoreState = AuthState & AuthActions & BaseState & BaseActions;

/**
 * 11_HOUR - Unified Authentication Hook
 *
 * Provides a streamlined interface for components to consume authentication
 * state, loading phases, and visual errors.
 */
export function useAuth() {
  const user = useAuthStore((state: CombinedStoreState) => state.user);
  const isAuthenticated = useAuthStore((state: CombinedStoreState) => state.isAuthenticated);
  const authStatus = useAuthStore((state: CombinedStoreState) => state.authStatus);
  const isLoading = useAuthStore((state: CombinedStoreState) => state.isLoading);
  const error = useAuthStore((state: CombinedStoreState) => state.error);
  const resetSuccess = useAuthStore((state: CombinedStoreState) => state.resetSuccess);

  const signIn = useAuthStore((state: CombinedStoreState) => state.signIn);
  const signUp = useAuthStore((state: CombinedStoreState) => state.signUp);
  const signOut = useAuthStore((state: CombinedStoreState) => state.signOut);
  const sendForgotPasswordReset = useAuthStore(
    (state: CombinedStoreState) => state.sendForgotPasswordReset,
  );
  const signInWithGoogle = useAuthStore((state: CombinedStoreState) => state.signInWithGoogle);
  const signInWithFacebook = useAuthStore((state: CombinedStoreState) => state.signInWithFacebook);
  const clearError = useAuthStore((state: CombinedStoreState) => state.clearError);
  const clearResetSuccess = useAuthStore((state: CombinedStoreState) => state.clearResetSuccess);

  return {
    user,
    isAuthenticated,
    authStatus,
    isLoading,
    error,
    resetSuccess,
    signIn,
    signUp,
    signOut,
    sendForgotPasswordReset,
    signInWithGoogle,
    signInWithFacebook,
    clearError,
    clearResetSuccess,
  };
}

export default useAuth;
