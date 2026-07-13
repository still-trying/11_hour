/// <reference types="vite/client" />

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
  connectFirestoreEmulator,
  doc,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { buildFirebaseConfig, isMockConfiguration } from './configBuilder';
import { EMULATOR_CONFIGS, FIREBASE_LOG_PREFIX } from './constants';

// Build validated configuration
const config = buildFirebaseConfig();

// 1. Firebase App Singleton Initialization
const app = getApps().length > 0 ? getApp() : initializeApp(config);

// 2. Cloud Firestore with persistent tab-resilient local cache support
let db: Firestore;
if (getApps().length > 0) {
  db = getFirestore(app, config.firestoreDatabaseId);
} else {
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    }, config.firestoreDatabaseId);
    console.info(`${FIREBASE_LOG_PREFIX} Firestore persistence cache successfully enabled (Multi-Tab).`);
  } catch (error) {
    console.warn(
      `${FIREBASE_LOG_PREFIX} Multi-tab persistence failed initialization, falling back to default instance.`,
      error
    );
    db = getFirestore(app, config.firestoreDatabaseId);
  }
}

// 3. Initialize Auth and Storage instances
const auth = getAuth(app);
const storage = getStorage(app);

// 4. Local Emulator Suite Support
if (EMULATOR_CONFIGS.USE_EMULATORS) {
  console.info(`${FIREBASE_LOG_PREFIX} Connecting to local Firebase Emulators...`);
  try {
    connectAuthEmulator(auth, `http://${EMULATOR_CONFIGS.HOST}:${EMULATOR_CONFIGS.AUTH_PORT}`);
    connectFirestoreEmulator(db, EMULATOR_CONFIGS.HOST, EMULATOR_CONFIGS.FIRESTORE_PORT);
    connectStorageEmulator(storage, EMULATOR_CONFIGS.HOST, EMULATOR_CONFIGS.STORAGE_PORT);
    console.info(`${FIREBASE_LOG_PREFIX} Emulators connected successfully!`);
  } catch (error) {
    console.error(`${FIREBASE_LOG_PREFIX} Error binding to Local Emulators:`, error);
  }
}

/**
 * Validates connectivity to the Firestore Cloud server.
 * Only runs if a real Firebase configuration (non-mock) is detected.
 */
export async function validateFirestoreConnection(): Promise<boolean> {
  if (isMockConfiguration(config)) {
    console.info(
      `${FIREBASE_LOG_PREFIX} Offline Mock mode active. Skipping remote Firestore validation.`
    );
    return true;
  }

  try {
    console.info(`${FIREBASE_LOG_PREFIX} Testing connection to Cloud Firestore...`);
    // Safe low-overhead server read test
    const testDocRef = doc(db, 'system_metadata', 'connection_probe');
    await getDocFromServer(testDocRef);
    console.info(`${FIREBASE_LOG_PREFIX} Cloud connection verified successfully.`);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn(
        `${FIREBASE_LOG_PREFIX} Verification warning: Client appears offline. Persistence cache will capture actions.`
      );
    } else {
      console.warn(
        `${FIREBASE_LOG_PREFIX} Verification warning: Remote validation failed. Check credentials or Firestore billing status.`,
        error
      );
    }
    return false;
  }
}

// Perform connection validation on app bootstrap safely inside a microtask
if (!isMockConfiguration(config) && !EMULATOR_CONFIGS.USE_EMULATORS) {
  setTimeout(() => {
    validateFirestoreConnection().catch((err) => {
      console.error(`${FIREBASE_LOG_PREFIX} Asynchronous connection verification failed:`, err);
    });
  }, 500);
}

export { app, db, auth, storage, config };
