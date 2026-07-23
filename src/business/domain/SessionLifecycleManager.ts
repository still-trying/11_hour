/**
 * 11_HOUR - Session Lifecycle Manager
 *
 * Part of Slice 1.3: Session Platform.
 * Coordinates the automated integration between authentication state changes and active sessions,
 * and maintains mouse/keyboard window listeners to enforce idle timeout boundaries.
 */

import { ISession, SessionState } from './sessionTypes';
import { SessionService } from './SessionService';
import { SessionHydration } from './SessionHydration';
import { SessionRecovery } from './SessionRecovery';
import { SESSION_TIMEOUTS } from './sessionConstants';
import { SessionLogging } from './sessionLogging';
import { IdentityService } from './IdentityService';
import { UserProfile } from '@/types';

export class SessionLifecycleManager {
  private readonly sessionService: SessionService;
  private readonly identityService: IdentityService;

  private activeSession: ISession | null = null;
  private currentLifecycleState: SessionState = SessionState.UNKNOWN;
  private unsubscribeAuth: (() => void) | null = null;

  private lastActivityTimestamp: number = Date.now();
  private lastPingTimestamp: number = Date.now();
  private idleCheckIntervalId: ReturnType<typeof setInterval> | null = null;
  private activityListenersAttached = false;

  private onStateChangedCallback: ((state: SessionState, session: ISession | null) => void) | null =
    null;

  constructor(sessionService: SessionService, identityService: IdentityService) {
    this.sessionService = sessionService;
    this.identityService = identityService;
  }

  /**
   * Binds a global callback to receive state transition events.
   */
  public registerStateListener(
    callback: (state: SessionState, session: ISession | null) => void,
  ): void {
    this.onStateChangedCallback = callback;
  }

  /**
   * Begins tracking the user session lifecycle, coordinating auth listeners and starting idle pings.
   */
  public start(): void {
    SessionLogging.info('Initializing Session Lifecycle Manager...');

    // 1. Attempt optimistic startup hydration
    this.transitionState(SessionState.INITIALIZING);
    const hydrated = SessionHydration.hydrate();

    if (hydrated) {
      this.activeSession = hydrated.session;
      this.lastActivityTimestamp = new Date(hydrated.session.lastActiveAt).getTime();
      this.transitionState(hydrated.state);
    } else {
      this.transitionState(SessionState.UNKNOWN);
    }

    // 2. Attach Auth state subscription
    this.unsubscribeAuth = this.identityService.onAuthStateChanged(
      async (userProfile: UserProfile | null) => {
        await this.handleAuthStateChanged(userProfile);
      },
    );

    // 3. Launch background idle timeout monitors
    this.startIdleMonitor();
    this.attachActivityListeners();
  }

  /**
   * Gracefully tears down the lifecycle manager, cleaning up interval loops and event handlers.
   */
  public stop(): void {
    SessionLogging.info('Stopping Session Lifecycle Manager...');

    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
      this.unsubscribeAuth = null;
    }

    this.stopIdleMonitor();
    this.detachActivityListeners();
  }

  /**
   * Evaluates the active user's presence, updating activity timers or forcing idle logouts.
   */
  public recordLocalActivity(): void {
    this.lastActivityTimestamp = Date.now();

    if (!this.activeSession) return;

    // Throttle remote database writes to prevent network flooding (via PING_INTERVAL_MS)
    const timeSinceLastPing = Date.now() - this.lastPingTimestamp;
    if (timeSinceLastPing >= SESSION_TIMEOUTS.PING_INTERVAL_MS) {
      this.lastPingTimestamp = Date.now();

      // Update session activity asynchronously
      this.sessionService
        .pingActivity(this.activeSession)
        .then((updated) => {
          this.activeSession = updated;
          if (this.onStateChangedCallback) {
            this.onStateChangedCallback(this.currentLifecycleState, updated);
          }
        })
        .catch((e) => {
          SessionLogging.error('Transient failure syncing activity ping:', e);
        });
    }
  }

  /**
   * Forces active session recovery, re-verifying credentials and syncing state.
   */
  public async forceRecovery(): Promise<boolean> {
    if (!this.activeSession) return false;

    const previous = this.currentLifecycleState;
    this.transitionState(SessionState.RECOVERING);

    try {
      const recovered = await SessionRecovery.recover(
        this.activeSession,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.sessionService as any).repository,
      );
      this.activeSession = recovered;
      this.lastActivityTimestamp = new Date(recovered.lastActiveAt).getTime();
      this.transitionState(recovered.state);
      return true;
    } catch (e) {
      SessionLogging.error('Session manual recovery failed:', e);
      this.transitionState(previous);
      return false;
    }
  }

  /**
   * Responds to structural changes in core Identity authentication status.
   */
  private async handleAuthStateChanged(userProfile: UserProfile | null): Promise<void> {
    SessionLogging.info(
      `Auth lifecycle trigger detected. User: ${userProfile ? userProfile.email : '[Unauthenticated]'}`,
    );

    if (userProfile) {
      // User is logged in
      if (this.activeSession && this.activeSession.userId === userProfile.id) {
        // Hydrated session matches user, attempt remote recovery/re-validation
        if (this.currentLifecycleState === SessionState.EXPIRED) {
          // If session was expired, we must force re-validation or spawn fresh
          SessionLogging.info('Session is expired. Re-authenticating.');
          const session = await this.sessionService.createSession(userProfile);
          this.activeSession = session;
          this.lastActivityTimestamp = Date.now();
          this.transitionState(SessionState.AUTHENTICATED);
        } else {
          await this.forceRecovery();
        }
      } else {
        // Spawn a brand new session for this user
        const session = await this.sessionService.createSession(userProfile);
        this.activeSession = session;
        this.lastActivityTimestamp = Date.now();
        this.transitionState(SessionState.AUTHENTICATED);
      }
    } else {
      // User has logged out or is anonymous
      if (this.activeSession && this.currentLifecycleState !== SessionState.SIGNING_OUT) {
        const sessionToTerminate = this.activeSession;
        this.activeSession = null;
        this.transitionState(SessionState.SIGNING_OUT);

        try {
          await this.sessionService.terminateSession(sessionToTerminate);
        } catch (e) {
          SessionLogging.error('Error terminating active session during logout:', e);
        } finally {
          this.transitionState(SessionState.UNKNOWN);
        }
      } else {
        this.activeSession = null;
        this.transitionState(SessionState.UNKNOWN);
      }
    }
  }

  /**
   * Starts checking the idle timeline at a low-frequency rate.
   */
  private startIdleMonitor(): void {
    this.stopIdleMonitor();

    // Check every 15 seconds to minimize battery/main-thread drains
    this.idleCheckIntervalId = setInterval(() => {
      this.evaluateIdleTimeout();
    }, 15000);
  }

  private stopIdleMonitor(): void {
    if (this.idleCheckIntervalId) {
      clearInterval(this.idleCheckIntervalId);
      this.idleCheckIntervalId = null;
    }
  }

  /**
   * Evaluates if the current inactivity window exceeds the safety thresholds.
   */
  private evaluateIdleTimeout(): void {
    if (!this.activeSession || this.currentLifecycleState !== SessionState.AUTHENTICATED) {
      return;
    }

    const idleDuration = Date.now() - this.lastActivityTimestamp;

    if (idleDuration >= SESSION_TIMEOUTS.IDLE_TIMEOUT_MS) {
      this.stopIdleMonitor();
      this.transitionState(SessionState.EXPIRED);

      const sessionToExpire = this.activeSession;
      this.activeSession = null;

      this.sessionService.expireSession(sessionToExpire).catch((e) => {
        SessionLogging.error('Failed to gracefully sync session expiration:', e);
      });
    }
  }

  /**
   * Transitions the active lifecycle state and dispatches changes to subscribers.
   */
  private transitionState(newState: SessionState): void {
    if (this.currentLifecycleState === newState) return;

    SessionLogging.info(`Lifecycle Transition: [${this.currentLifecycleState}] -> [${newState}]`);
    this.currentLifecycleState = newState;

    if (this.onStateChangedCallback) {
      this.onStateChangedCallback(newState, this.activeSession);
    }
  }

  /**
   * Attach keyboard, scroll, and mouse movement event handlers to refresh the idle timers.
   */
  private attachActivityListeners(): void {
    if (typeof window === 'undefined' || this.activityListenersAttached) return;

    const refreshHandler = () => this.recordLocalActivity();

    window.addEventListener('mousemove', refreshHandler, { passive: true });
    window.addEventListener('keydown', refreshHandler, { passive: true });
    window.addEventListener('mousedown', refreshHandler, { passive: true });
    window.addEventListener('touchstart', refreshHandler, { passive: true });
    window.addEventListener('scroll', refreshHandler, { passive: true });

    this.activityListenersAttached = true;
  }

  private detachActivityListeners(): void {
    if (typeof window === 'undefined' || !this.activityListenersAttached) return;

    const refreshHandler = () => this.recordLocalActivity();

    window.removeEventListener('mousemove', refreshHandler);
    window.removeEventListener('keydown', refreshHandler);
    window.removeEventListener('mousedown', refreshHandler);
    window.removeEventListener('touchstart', refreshHandler);
    window.removeEventListener('scroll', refreshHandler);

    this.activityListenersAttached = false;
  }
}
