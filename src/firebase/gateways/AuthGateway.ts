import { 
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  User
} from 'firebase/auth';
import { auth, config } from '../config';
import { IAuthGateway } from '../types';
import { EMULATOR_CONFIGS, FIREBASE_LOG_PREFIX } from '../constants';
import { AuthErrorMapper } from '../errors/AuthErrorMapper';
import { AuthLogger } from '../logging/AuthLogger';
import { AuthLifecycle } from '../lifecycle/AuthLifecycle';

/**
 * Production-ready Firebase Authentication Gateway.
 * 
 * Part of Slice 1.2: Identity Infrastructure.
 * Integrates directly with the official Firebase Web SDK, utilizing Popup-based
 * Google Sign-In and credentials-based Email/Password pipelines. Maps all infrastructure
 * errors to clean domain errors and provides high-fidelity local-only preview simulation when using mock keys.
 */
export class AuthGateway implements IAuthGateway {
  private currentUserId: string | null = null;
  private listeners: Set<(userId: string | null) => void> = new Set();
  private readonly isMock: boolean;

  constructor() {
    this.isMock = config.apiKey.includes('mock-api-key') && !EMULATOR_CONFIGS.USE_EMULATORS;
    
    if (this.isMock) {
      console.warn(
        `${FIREBASE_LOG_PREFIX} Running AuthGateway in HIGH-FIDELITY PREVIEW MOCK mode. Operations will simulate transitions.`
      );
    } else {
      console.info(`${FIREBASE_LOG_PREFIX} AuthGateway instantiated successfully for live/emulator authentication.`);
    }

    // Set up the internal lifecycle subscription to coordinate currentUserId
    this.setupLifecycleListener();
  }

  private setupLifecycleListener(): void {
    if (this.isMock) {
      // Safe initial mock state
      this.currentUserId = null;
      return;
    }

    AuthLifecycle.subscribe((user: User | null) => {
      this.currentUserId = user ? user.uid : null;
      this.notifyListeners();
    });
  }

  public getCurrentUserId(): string | null {
    if (this.isMock) {
      return this.currentUserId;
    }
    return auth.currentUser ? auth.currentUser.uid : this.currentUserId;
  }

  public isUserVerified(): boolean {
    if (this.isMock) {
      return this.currentUserId !== null;
    }
    return auth.currentUser !== null;
  }

  public onAuthStateChanged(callback: (userId: string | null) => void): () => void {
    AuthLogger.logLifecycle('Registering state change callback in AuthGateway.');
    this.listeners.add(callback);
    
    // Instantly invoke with current value
    callback(this.getCurrentUserId());

    return () => {
      AuthLogger.logLifecycle('Deregistering state change callback in AuthGateway.');
      this.listeners.delete(callback);
    };
  }

  public async signInWithEmailAndPassword(email: string, password: string): Promise<string> {
    AuthLogger.logLifecycle(`Gateway signInWithEmailAndPassword initiated for: ${email}`);

    if (this.isMock) {
      // High-fidelity simulation for visual testing
      await new Promise((resolve) => setTimeout(resolve, 800));
      this.currentUserId = 'mock-uid-11hour';
      this.notifyListeners();
      AuthLogger.logSuccess('signInWithEmailAndPassword (Simulated)', this.currentUserId);
      return this.currentUserId;
    }

    try {
      const userCredential = await firebaseSignInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      AuthLogger.logSuccess('signInWithEmailAndPassword', uid);
      return uid;
    } catch (error) {
      AuthLogger.logFailure('signInWithEmailAndPassword', error);
      throw AuthErrorMapper.map(error);
    }
  }

  public async signUpWithEmailAndPassword(email: string, password: string): Promise<string> {
    AuthLogger.logLifecycle(`Gateway signUpWithEmailAndPassword initiated for: ${email}`);

    if (this.isMock) {
      // High-fidelity simulation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.currentUserId = 'mock-uid-11hour';
      this.notifyListeners();
      AuthLogger.logSuccess('signUpWithEmailAndPassword (Simulated)', this.currentUserId);
      return this.currentUserId;
    }

    try {
      const userCredential = await firebaseCreateUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      AuthLogger.logSuccess('signUpWithEmailAndPassword', uid);
      return uid;
    } catch (error) {
      AuthLogger.logFailure('signUpWithEmailAndPassword', error);
      throw AuthErrorMapper.map(error);
    }
  }

  public async signInWithGoogle(): Promise<void> {
    AuthLogger.logLifecycle('Gateway signInWithGoogle initiated.');

    if (this.isMock) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.currentUserId = 'mock-uid-11hour';
      this.notifyListeners();
      AuthLogger.logSuccess('signInWithGoogle (Simulated)', this.currentUserId);
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const userCredential = await signInWithPopup(auth, provider);
      const uid = userCredential.user.uid;
      AuthLogger.logSuccess('signInWithGoogle', uid);
    } catch (error) {
      AuthLogger.logFailure('signInWithGoogle', error);
      throw AuthErrorMapper.map(error);
    }
  }

  public async signOut(): Promise<void> {
    AuthLogger.logLifecycle('Gateway signOut initiated.');

    if (this.isMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      this.currentUserId = null;
      this.notifyListeners();
      AuthLogger.logSuccess('signOut (Simulated)', 'none');
      return;
    }

    try {
      await firebaseSignOut(auth);
      AuthLogger.logSuccess('signOut', 'none');
    } catch (error) {
      AuthLogger.logFailure('signOut', error);
      throw AuthErrorMapper.map(error);
    }
  }

  public async sendPasswordResetEmail(email: string): Promise<void> {
    AuthLogger.logLifecycle(`Gateway sendPasswordResetEmail initiated for: ${email}`);

    if (this.isMock) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      AuthLogger.logSuccess('sendPasswordResetEmail (Simulated)', email);
      return;
    }

    try {
      await firebaseSendPasswordResetEmail(auth, email);
      AuthLogger.logSuccess('sendPasswordResetEmail', email);
    } catch (error) {
      AuthLogger.logFailure('sendPasswordResetEmail', error);
      throw AuthErrorMapper.map(error);
    }
  }

  private notifyListeners(): void {
    const uid = this.getCurrentUserId();
    this.listeners.forEach((listener) => {
      try {
        listener(uid);
      } catch (e) {
        console.error(`${FIREBASE_LOG_PREFIX} Failed to dispatch auth state in notifyListeners:`, e);
      }
    });
  }
}
