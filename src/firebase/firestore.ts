import { db } from './config';
import { FirestoreGateway } from './gateways/FirestoreGateway';

/**
 * 11_HOUR - Firebase Firestore Ingress Core
 *
 * Exposes the standard SDK instance alongside the custom FirestoreGateway
 * implementation of the application.
 */

export const firestoreGateway = new FirestoreGateway();

export { db };
export * from './gateways/FirestoreGateway';
