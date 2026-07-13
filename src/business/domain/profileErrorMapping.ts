/**
 * 11_HOUR - Profile Error Mapping Helper
 * 
 * Part of Slice 1.5: User Identity Profile Platform.
 * Maps raw infrastructural or Firebase Exceptions to our domain-specific ProfileException.
 */

import { ProfileException, ProfileErrorCode } from './profileTypes';
import { ProfileLogging } from './profileLogging';

export class ProfileErrorMapper {
  /**
   * Translates an unknown system or infrastructure error into a clean, typed ProfileException.
   */
  public static map(error: any, defaultCode: ProfileErrorCode = ProfileErrorCode.UNKNOWN): ProfileException {
    const correlationId = Math.random().toString(36).substring(2, 11);
    let message = error instanceof Error ? error.message : String(error || 'An unexpected error occurred');
    let code = defaultCode;

    // Detect Firebase Auth or Firestore-specific errors
    if (error && typeof error === 'object') {
      const errCode = error.code || '';
      const errMsg = error.message || '';

      if (errCode.includes('permission-denied') || errMsg.includes('insufficient permissions')) {
        code = ProfileErrorCode.PERSISTENCE_FAILED;
        message = 'Database permission denied. Ensure you are signed in and editing your own profile.';
      } else if (errCode.includes('not-found')) {
        code = ProfileErrorCode.INITIALIZATION_FAILED;
        message = 'The requested user profile was not found on the database.';
      } else if (errCode.includes('failed-precondition')) {
        code = ProfileErrorCode.MIGRATION_FAILED;
        message = 'Active database preconditions not met. Try again later.';
      } else if (errCode.includes('offline') || errCode.includes('network')) {
        code = ProfileErrorCode.PERSISTENCE_FAILED;
        message = 'Transient network failure. Your local modifications have been cached for sync.';
      }
    }

    const domainException = new ProfileException(code, message, correlationId, error);
    ProfileLogging.error(`[CorrelationId: ${correlationId}] Mapped exception code: ${code}. Message: ${message}`, error);
    return domainException;
  }
}
export default ProfileErrorMapper;
