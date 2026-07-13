import { z } from 'zod';

/**
 * Zod validation schema for Firebase Web SDK Configuration.
 */
export const firebaseConfigSchema = z.object({
  apiKey: z.string().min(1, 'Firebase API Key is required'),
  authDomain: z.string().min(1, 'Firebase Auth Domain is required'),
  projectId: z.string().min(1, 'Firebase Project ID is required'),
  storageBucket: z.string().min(1, 'Firebase Storage Bucket is required'),
  messagingSenderId: z.string().min(1, 'Firebase Messaging Sender ID is required'),
  appId: z.string().min(1, 'Firebase App ID is required'),
  firestoreDatabaseId: z.string().optional().default('(default)'),
});

/**
 * Type inferred from the Firebase config schema.
 */
export type FirebaseConfig = z.infer<typeof firebaseConfigSchema>;

/**
 * Standard Operation Types for Firestore mapping.
 */
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

/**
 * Secure Firestore error structure mapped to conform to security telemetry contracts.
 */
export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Interface contract for standard authentication gateway.
 */
export interface IAuthGateway {
  getCurrentUserId(): string | null;
  isUserVerified(): boolean;
  onAuthStateChanged(callback: (userId: string | null) => void): () => void;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  signInWithEmailAndPassword(email: string, password: string): Promise<string>;
  signUpWithEmailAndPassword(email: string, password: string): Promise<string>;
  sendPasswordResetEmail(email: string): Promise<void>;
}

/**
 * Interface contract for standard Firestore database gateway.
 */
export interface IFirestoreGateway {
  testConnection(): Promise<boolean>;
  subscribeToCollection<T>(
    path: string,
    callback: (data: T[]) => void,
    errorCallback?: (error: unknown) => void
  ): () => void;
  saveDocument<T extends Record<string, unknown>>(
    path: string,
    docId: string,
    data: T
  ): Promise<void>;
  deleteDocument(path: string, docId: string): Promise<void>;
}

/**
 * Interface contract for standard cloud Storage gateway.
 */
export interface IStorageGateway {
  uploadFile(
    file: File,
    userId: string,
    episodeId: string,
    onProgress?: (progress: number) => void
  ): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}
