import { IFirestoreGateway, OperationType } from '../types';
import { handleFirestoreError } from '../errors';
import { FIREBASE_LOG_PREFIX } from '../constants';

/**
 * FirestoreGateway Skeleton / Stub
 *
 * Establishes the standard data persistence contract for Cloud Firestore, satisfying
 * Slice 0.6 requirements. Actual reads and writes are restricted to future slices.
 */
export class FirestoreGateway implements IFirestoreGateway {
  constructor() {
    console.info(`${FIREBASE_LOG_PREFIX} FirestoreGateway instantiated (Slice 0.6 Skeleton).`);
  }

  async testConnection(): Promise<boolean> {
    console.info(`${FIREBASE_LOG_PREFIX} FirestoreGateway.testConnection called.`);
    return true;
  }

  subscribeToCollection<T>(
    path: string,
    callback: (data: T[]) => void,
    errorCallback?: (error: unknown) => void
  ): () => void {
    console.warn(
      `${FIREBASE_LOG_PREFIX} FirestoreGateway.subscribeToCollection called on path: "${path}" (STUB).`
    );

    // Provide skeleton timer to emit empty datasets for UI scaffolding stability
    const timeout = setTimeout(() => {
      try {
        callback([]);
      } catch (err) {
        if (errorCallback) {
          errorCallback(err);
        } else {
          handleFirestoreError(err, OperationType.LIST, path);
        }
      }
    }, 100);

    return () => {
      console.info(`${FIREBASE_LOG_PREFIX} Unsubscribing from path: "${path}" (STUB).`);
      clearTimeout(timeout);
    };
  }

  async saveDocument<T extends Record<string, unknown>>(
    path: string,
    docId: string,
    data: T
  ): Promise<void> {
    console.info(
      `${FIREBASE_LOG_PREFIX} FirestoreGateway.saveDocument called. Path: "${path}/${docId}" (STUB).`,
      data
    );
    // Mimic latent server network trip
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  async deleteDocument(path: string, docId: string): Promise<void> {
    console.info(
      `${FIREBASE_LOG_PREFIX} FirestoreGateway.deleteDocument called. Path: "${path}/${docId}" (STUB).`
    );
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
}
