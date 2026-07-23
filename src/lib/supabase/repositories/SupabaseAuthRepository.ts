/**
 * 11_HOUR - Supabase Authentication Repository
 *
 * Part of Slice 1.2: Identity Infrastructure (Supabase Migration).
 * Implements the IAuthRepository contract using Supabase Auth.
 * Bridges domain auth requests with the Supabase Auth SDK.
 */

import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import type { IAuthRepository } from '@/business/domain/AuthRepository';
import type { UserProfile } from '@/types';
import { AuthException, AuthErrorCode } from '@/business/domain/authTypes';
import { AUTH_ERROR_MESSAGES } from '@/business/domain/authConstants';

/**
 * Maps a Supabase User object to the domain UserProfile type.
 */
function toUserProfile(supabaseUser: User): UserProfile {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    displayName:
      supabaseUser.user_metadata?.display_name ||
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.email?.split('@')[0] ||
      'Unknown User',
    photoURL: supabaseUser.user_metadata?.avatar_url || undefined,
    createdAt: supabaseUser.created_at || new Date().toISOString(),
  };
}

/**
 * Maps a Supabase Auth error to a domain AuthException.
 */
function mapAuthError(error: unknown): AuthException {
  if (error instanceof AuthException) return error;

  const supabaseError = error as { code?: string; message?: string; status?: number; name?: string };
  const code = supabaseError?.code || '';
  const message = supabaseError?.message || '';

  console.debug('🔍 [AuthErrorMapping] Raw error:', JSON.stringify({ code, message, status: supabaseError?.status, name: supabaseError?.name }));

  let domainCode: AuthErrorCode;

  if (
    code === 'user_already_exists' ||
    message.includes('already registered') ||
    message.includes('already in use')
  ) {
    domainCode = AuthErrorCode.EMAIL_ALREADY_IN_USE;
  } else if (
    code === 'invalid_credentials' ||
    message.includes('Invalid login credentials') ||
    supabaseError?.status === 400 ||
    supabaseError?.status === 401
  ) {
    domainCode = AuthErrorCode.INVALID_CREDENTIALS;
  } else if (
    code === 'weak_password' ||
    message.includes('weak password') ||
    message.includes('too short')
  ) {
    domainCode = AuthErrorCode.WEAK_PASSWORD;
  } else if (code === 'user_not_found' || message.includes('no user found')) {
    domainCode = AuthErrorCode.USER_NOT_FOUND;
  } else if (code === 'email_not_confirmed' || message.includes('Email not confirmed')) {
    domainCode = AuthErrorCode.INVALID_EMAIL;
  } else if (
    code === 'rate_limit' ||
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    supabaseError?.status === 429
  ) {
    domainCode = AuthErrorCode.TOO_MANY_REQUESTS;
  } else if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('timeout') ||
    message.includes('connection')
  ) {
    domainCode = AuthErrorCode.NETWORK_ERROR;
  } else if (code === 'signup_disabled' || message.includes('Signups not allowed')) {
    domainCode = AuthErrorCode.OPERATION_NOT_ALLOWED;
  } else if (code === 'user_banned' || message.includes('User is banned')) {
    domainCode = AuthErrorCode.USER_DISABLED;
  } else {
    domainCode = AuthErrorCode.UNKNOWN;
  }

  const userMessage =
    AUTH_ERROR_MESSAGES[domainCode] || message || 'An unexpected authentication error occurred.';
  return new AuthException(domainCode, userMessage, error);
}

export class SupabaseAuthRepository implements IAuthRepository {
  private currentUser: UserProfile | null = null;

  public getCurrentUserId(): string | null {
    return this.currentUser?.id || null;
  }

  public async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        this.currentUser = null;
        return null;
      }
      this.currentUser = toUserProfile(data.user);
      return this.currentUser;
    } catch {
      return null;
    }
  }

  public async signInWithEmail(email: string, password: string): Promise<UserProfile> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      throw mapAuthError(error || new Error('Sign in returned no user'));
    }
    this.currentUser = toUserProfile(data.user);

    // Update the display name in user_metadata if it was provided on sign-up but not present
    if (!data.user.user_metadata?.display_name && !data.user.user_metadata?.full_name) {
      await supabase.auth
        .updateUser({
          data: { display_name: email.split('@')[0] },
        })
        .catch(() => {
          /* Non-critical, silently ignore */
        });
    }

    return this.currentUser;
  }

  public async signUpWithEmail(
    email: string,
    password: string,
    displayName: string,
  ): Promise<UserProfile> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          full_name: displayName,
        },
      },
    });

    if (error || !data.user) {
      throw mapAuthError(error || new Error('Sign up returned no user'));
    }

    this.currentUser = toUserProfile(data.user);
    return this.currentUser;
  }

  public async signInWithGoogle(): Promise<UserProfile> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });

    if (error) {
      throw mapAuthError(error);
    }

    // OAuth redirects the browser to Google's consent page.
    // The onAuthStateChanged listener will restore the session when
    // the user is redirected back. This code won't execute further
    // because the browser navigates away.
    throw new AuthException(
      AuthErrorCode.UNKNOWN,
      'Redirecting to Google for authentication. Please wait...',
    );
  }

  public async signInWithFacebook(): Promise<UserProfile> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });

    if (error) {
      throw mapAuthError(error);
    }

    throw new AuthException(
      AuthErrorCode.UNKNOWN,
      'Redirecting to Facebook for authentication. Please wait...',
    );
  }

  public async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn(
        '⚠️ [SupabaseAuthRepository] Sign out encountered a non-blocking error:',
        error.message,
      );
    }
    this.currentUser = null;
  }

  public async sendPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        typeof window !== 'undefined' ? `${window.location.origin}/auth?reset=true` : undefined,
    });
    if (error) {
      throw mapAuthError(error);
    }
  }

  public onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        this.currentUser = toUserProfile(session.user);
        callback(this.currentUser);
      } else {
        this.currentUser = null;
        callback(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }
}

export const supabaseAuthRepositoryInstance = new SupabaseAuthRepository();
export default SupabaseAuthRepository;
