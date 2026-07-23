/**
 * 11_HOUR - Supabase Session Repository
 *
 * Part of Slice 1.3: Session Platform (Supabase Migration).
 * Implements ISessionRepository using Supabase PostgreSQL.
 * Stores session records in the 'user_sessions' table.
 */

import { supabase } from '@/lib/supabase/client';
import type { ISessionRepository } from '@/business/domain/SessionRepository';
import {
  ISession,
  SessionState,
  SessionException,
  SessionErrorCode,
} from '@/business/domain/sessionTypes';

const SESSION_TABLE = 'user_sessions';

export class SupabaseSessionRepository implements ISessionRepository {
  private readonly localSessionCache = new Map<string, ISession>();

  public async saveSession(session: ISession): Promise<void> {
    // Always persist locally for optimistic responsiveness
    this.localSessionCache.set(session.sessionId, { ...session });

    const { error } = await supabase.from(SESSION_TABLE).upsert(
      {
        session_id: session.sessionId,
        user_id: session.userId,
        state: session.state,
        created_at: session.createdAt,
        last_active_at: session.lastActiveAt,
        device_id: session.deviceId,
        is_anonymous: session.isAnonymous,
        metadata: session.metadata,
        user_profile: session.userProfile,
      },
      { onConflict: 'session_id' },
    );

    if (error) {
      console.warn(
        '⚠️ [SupabaseSessionRepository] Failed to persist session remotely:',
        error.message,
      );
      // Local cache is already saved, so fail gracefully
    }
  }

  public async getSession(sessionId: string): Promise<ISession | null> {
    // Check local cache first
    const local = this.localSessionCache.get(sessionId);
    if (local) return local;

    // Fall back to remote lookup
    const { data, error } = await supabase
      .from(SESSION_TABLE)
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows
      throw new SessionException(
        SessionErrorCode.RECOVERY_FAILED,
        `Failed to retrieve session: ${error.message}`,
      );
    }

    if (!data) return null;

    return this.rowToSession(data);
  }

  public async deleteSession(sessionId: string): Promise<void> {
    this.localSessionCache.delete(sessionId);

    const { error } = await supabase.from(SESSION_TABLE).delete().eq('session_id', sessionId);

    if (error) {
      console.warn(
        '⚠️ [SupabaseSessionRepository] Failed to delete session remotely:',
        error.message,
      );
    }
  }

  public async getActiveSessions(userId: string): Promise<ISession[]> {
    const { data, error } = await supabase
      .from(SESSION_TABLE)
      .select('*')
      .eq('user_id', userId)
      .not('state', 'in', `("${SessionState.EXPIRED}","${SessionState.SIGNING_OUT}")`);

    if (error) {
      throw new SessionException(
        SessionErrorCode.RECOVERY_FAILED,
        `Failed to fetch active sessions: ${error.message}`,
      );
    }

    const remoteSessions = (data || []).map((row: Record<string, unknown>) =>
      this.rowToSession(row),
    );

    // Merge with local cache
    const seenIds = new Set(remoteSessions.map((s) => s.sessionId));
    for (const [id, session] of this.localSessionCache) {
      if (!seenIds.has(id)) {
        remoteSessions.push(session);
      }
    }

    return remoteSessions;
  }

  public onSessionChanged(
    sessionId: string,
    callback: (session: ISession | null) => void,
  ): () => void {
    const channel = supabase
      .channel(`session-changes-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: SESSION_TABLE,
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            callback(this.rowToSession(payload.new as Record<string, unknown>));
          } else {
            callback(null);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  public async reconcileSession(session: ISession): Promise<ISession> {
    // Last-write-wins based on lastActiveAt
    const remote = await this.getSession(session.sessionId);

    if (!remote) {
      await this.saveSession(session);
      return session;
    }

    const localTime = new Date(session.lastActiveAt).getTime();
    const remoteTime = new Date(remote.lastActiveAt).getTime();

    if (localTime >= remoteTime) {
      await this.saveSession(session);
      return session;
    }

    // Remote is newer — update local cache
    this.localSessionCache.set(remote.sessionId, { ...remote });
    return remote;
  }

  private rowToSession(row: Record<string, unknown>): ISession {
    return {
      sessionId: String(row.session_id || ''),
      userId: String(row.user_id || ''),
      userProfile: (row.user_profile as ISession['userProfile']) || null,
      state: (row.state as SessionState) || SessionState.UNKNOWN,
      createdAt: String(row.created_at || new Date().toISOString()),
      lastActiveAt: String(row.last_active_at || new Date().toISOString()),
      deviceId: String(row.device_id || ''),
      isAnonymous: Boolean(row.is_anonymous),
      metadata: {
        platform: (row.metadata as ISession['metadata'])?.platform || 'Unknown',
        userAgent: (row.metadata as ISession['metadata'])?.userAgent || '',
        clientVersion: (row.metadata as ISession['metadata'])?.clientVersion || '1.0.0',
        lastSyncedAt:
          (row.metadata as ISession['metadata'])?.lastSyncedAt || new Date().toISOString(),
      },
    };
  }
}

export const supabaseSessionRepositoryInstance = new SupabaseSessionRepository();
export default SupabaseSessionRepository;
