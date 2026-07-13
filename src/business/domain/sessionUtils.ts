/**
 * 11_HOUR - Session Utilities
 * 
 * Part of Slice 1.3: Session Platform.
 * Contains domain helpers to parse browser metadata, verify session status transitions,
 * and calculate idle countdown targets.
 */

import { SessionState } from './sessionTypes';

/**
 * Extracts clean user agent and device platform details safely.
 */
export function parseBrowserMetadata(): { platform: string; userAgent: string; clientVersion: string } {
  if (typeof window === 'undefined') {
    return {
      platform: 'Server-Side Node',
      userAgent: 'NodeJS',
      clientVersion: '1.0.0',
    };
  }

  const ua = navigator.userAgent;
  let platform = 'Unknown';
  if (/android/i.test(ua)) platform = 'Android';
  else if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) platform = 'iOS';
  else if (/Macintosh/i.test(ua)) platform = 'MacOS';
  else if (/Windows/i.test(ua)) platform = 'Windows';
  else if (/Linux/i.test(ua)) platform = 'Linux';

  return {
    platform,
    userAgent: ua.substring(0, 150), // Prevent sending bloated strings
    clientVersion: '1.0.0', // Standard application manifest target
  };
}

/**
 * Determines if a state transition between two SessionStates is mathematically legal.
 * Prevents race conditions or illegal lifecycle loops.
 */
export function isValidTransition(from: SessionState, to: SessionState): boolean {
  if (from === to) return true;

  const transitions: Record<SessionState, SessionState[]> = {
    [SessionState.UNKNOWN]: [SessionState.INITIALIZING],
    [SessionState.INITIALIZING]: [
      SessionState.AUTHENTICATED,
      SessionState.ANONYMOUS,
      SessionState.UNKNOWN,
    ],
    [SessionState.AUTHENTICATED]: [
      SessionState.REFRESHING,
      SessionState.RECOVERING,
      SessionState.EXPIRED,
      SessionState.SIGNING_OUT,
    ],
    [SessionState.ANONYMOUS]: [
      SessionState.AUTHENTICATED,
      SessionState.RECOVERING,
      SessionState.EXPIRED,
      SessionState.SIGNING_OUT,
    ],
    [SessionState.EXPIRED]: [
      SessionState.INITIALIZING,
      SessionState.AUTHENTICATED,
      SessionState.SIGNING_OUT,
    ],
    [SessionState.REFRESHING]: [
      SessionState.AUTHENTICATED,
      SessionState.RECOVERING,
      SessionState.EXPIRED,
      SessionState.SIGNING_OUT,
    ],
    [SessionState.RECOVERING]: [
      SessionState.AUTHENTICATED,
      SessionState.EXPIRED,
      SessionState.SIGNING_OUT,
    ],
    [SessionState.SIGNING_OUT]: [
      SessionState.UNKNOWN,
      SessionState.INITIALIZING,
    ],
  };

  return (transitions[from] || []).includes(to);
}
