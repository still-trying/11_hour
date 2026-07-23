/**
 * 11_HOUR - Session Manager Orchestrator
 *
 * Part of Slice 1.3: Session Platform.
 * Acts as the centralized Dependency Injection entry point, wiring together the repository,
 * services, and state lifecycle manager to provide a unified control panel.
 */

import { SessionService } from './SessionService';
import { SessionLifecycleManager } from './SessionLifecycleManager';
import { supabaseSessionRepositoryInstance } from '@/lib/supabase/repositories/SupabaseSessionRepository';
import { identityServiceInstance } from '@/runtime/identityRegistry';
import { SessionState, ISession } from './sessionTypes';

class SessionManagerClass {
  private readonly sessionService: SessionService;
  private readonly lifecycleManager: SessionLifecycleManager;
  private isStarted = false;

  constructor() {
    this.sessionService = new SessionService(supabaseSessionRepositoryInstance);
    this.lifecycleManager = new SessionLifecycleManager(
      this.sessionService,
      identityServiceInstance,
    );
  }

  /**
   * Returns the underlying SessionService instance.
   */
  public getService(): SessionService {
    return this.sessionService;
  }

  /**
   * Returns the underlying SessionLifecycleManager instance.
   */
  public getLifecycleManager(): SessionLifecycleManager {
    return this.lifecycleManager;
  }

  /**
   * Starts tracking active session lifecycles and registers state sync hooks to state platform stores.
   */
  public start(onStateChanged: (state: SessionState, session: ISession | null) => void): void {
    if (this.isStarted) {
      console.warn('🛡️ [SessionManager] Session manager is already running.');
      return;
    }

    this.lifecycleManager.registerStateListener(onStateChanged);
    this.lifecycleManager.start();
    this.isStarted = true;
    console.info('🛡️ [SessionManager] Orchestration and tracking successfully started.');
  }

  /**
   * Gracefully shuts down active lifecycle interval timers and event listeners.
   */
  public stop(): void {
    if (!this.isStarted) return;
    this.lifecycleManager.stop();
    this.isStarted = false;
    console.info('🛡️ [SessionManager] Orchestration and tracking successfully stopped.');
  }
}

export const SessionManager = new SessionManagerClass();
