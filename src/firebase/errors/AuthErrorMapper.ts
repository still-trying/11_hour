/**
 * 11_HOUR - Authentication Error Mapper
 * 
 * Part of Slice 1.2: Identity Infrastructure.
 * Translates low-level Firebase Authentication SDK errors into secure, standardized
 * domain-level AuthException types with user-friendly messages.
 */

import { AuthErrorCode, AuthException } from '@/business/domain/authTypes';
import { AUTH_ERROR_MESSAGES } from '@/business/domain/authConstants';

export class AuthErrorMapper {
  /**
   * Translates a raw Firebase Auth SDK error into a domain AuthException.
   */
  public static map(rawError: unknown): AuthException {
    if (rawError instanceof AuthException) {
      return rawError;
    }

    const firebaseError = rawError as { code?: string; message?: string };
    const code = firebaseError.code || '';
    
    let domainCode: AuthErrorCode;

    switch (code) {
      case 'auth/email-already-in-use':
        domainCode = AuthErrorCode.EMAIL_ALREADY_IN_USE;
        break;
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials':
        domainCode = AuthErrorCode.INVALID_CREDENTIALS;
        break;
      case 'auth/weak-password':
        domainCode = AuthErrorCode.WEAK_PASSWORD;
        break;
      case 'auth/user-not-found':
        domainCode = AuthErrorCode.USER_NOT_FOUND;
        break;
      case 'auth/wrong-password':
        domainCode = AuthErrorCode.WRONG_PASSWORD;
        break;
      case 'auth/network-request-failed':
        domainCode = AuthErrorCode.NETWORK_ERROR;
        break;
      case 'auth/too-many-requests':
        domainCode = AuthErrorCode.TOO_MANY_REQUESTS;
        break;
      case 'auth/invalid-email':
        domainCode = AuthErrorCode.INVALID_EMAIL;
        break;
      case 'auth/operation-not-allowed':
        domainCode = AuthErrorCode.OPERATION_NOT_ALLOWED;
        break;
      case 'auth/user-disabled':
        domainCode = AuthErrorCode.USER_DISABLED;
        break;
      default:
        domainCode = AuthErrorCode.UNKNOWN;
        break;
    }

    const message = AUTH_ERROR_MESSAGES[domainCode] || firebaseError.message || 'An unexpected authentication error occurred.';
    
    return new AuthException(domainCode, message, rawError);
  }
}
