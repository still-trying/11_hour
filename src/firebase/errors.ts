import { getAuth } from 'firebase/auth';
import { FirestoreErrorInfo, OperationType } from './types';
import { FIREBASE_LOG_PREFIX } from './constants';

/**
 * Standardized logging utility for infrastructure errors.
 */
export function logInfrastructureError(message: string, error: unknown): void {
  console.error(`${FIREBASE_LOG_PREFIX} [ERROR] ${message}`, error);
}

/**
 * Handles Firestore exceptions by capturing diagnostic context, compiling it into
 * a standardized JSON-string structured object, logging it, and re-throwing.
 *
 * Conforms precisely to the FirestoreErrorInfo contract in security instructions.
 */
export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  let auth;
  let currentUser = null;

  try {
    auth = getAuth();
    currentUser = auth.currentUser;
  } catch {
    // If Auth is not yet initialized or fails retrieval, ignore and proceed with null auth context
  }

  const errorString = error instanceof Error ? error.message : String(error);

  const errInfo: FirestoreErrorInfo = {
    error: errorString,
    operationType,
    path,
    authInfo: {
      userId: currentUser?.uid || null,
      email: currentUser?.email || null,
      emailVerified: currentUser?.emailVerified || null,
      isAnonymous: currentUser?.isAnonymous || null,
      tenantId: currentUser?.tenantId || null,
      providerInfo: currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
  };

  // Structured log execution for telemetry diagnostics
  console.error(`${FIREBASE_LOG_PREFIX} Firestore Exception Captured:`, JSON.stringify(errInfo, null, 2));

  throw new Error(JSON.stringify(errInfo));
}
