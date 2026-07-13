/**
 * 11_HOUR - Authorization Diagnostics & Configuration Audit
 * 
 * Part of Slice 1.4: Authorization Platform & Route Access Framework.
 * Verifies routing registry integrity, assesses coverage metrics,
 * and compiles audit telemetry.
 */

import { ROUTE_ACCESS_REGISTRY } from './authzConstants';
import { RouteAccessType } from './authzTypes';
import { ROUTES } from '@/routes/constants';

export interface IAuthzDiagnosticReport {
  timestamp: string;
  totalRoutesChecked: number;
  unconfiguredRoutes: string[];
  publicRoutesCount: number;
  guestOnlyRoutesCount: number;
  authenticatedRoutesCount: number;
  coverageScore: number; // percentage of ROUTES correctly covered in ROUTE_ACCESS_REGISTRY
  isHealthy: boolean;
}

export class AuthzDiagnostics {
  /**
   * Scans and verifies the route security configuration against system route constants.
   */
  public static run(): IAuthzDiagnosticReport {
    const allRoutePaths = Object.values(ROUTES).filter((p) => p !== '*');
    const unconfiguredRoutes: string[] = [];
    let publicCount = 0;
    let guestOnlyCount = 0;
    let authCount = 0;

    for (const path of allRoutePaths) {
      const config = ROUTE_ACCESS_REGISTRY[path];
      if (!config) {
        unconfiguredRoutes.push(path);
        continue;
      }

      switch (config.accessType) {
        case RouteAccessType.PUBLIC:
          publicCount++;
          break;
        case RouteAccessType.GUEST_ONLY:
          guestOnlyCount++;
          break;
        case RouteAccessType.AUTHENTICATED:
        case RouteAccessType.ROLE_PROTECTED:
        case RouteAccessType.FEATURE_FLAG_PROTECTED:
          authCount++;
          break;
      }
    }

    const totalRoutesChecked = allRoutePaths.length;
    const configuredCount = totalRoutesChecked - unconfiguredRoutes.length;
    const coverageScore = totalRoutesChecked > 0 ? Math.round((configuredCount / totalRoutesChecked) * 100) : 100;
    const isHealthy = unconfiguredRoutes.length === 0;

    return {
      timestamp: new Date().toISOString(),
      totalRoutesChecked,
      unconfiguredRoutes,
      publicRoutesCount: publicCount,
      guestOnlyRoutesCount: guestOnlyCount,
      authenticatedRoutesCount: authCount,
      coverageScore,
      isHealthy,
    };
  }
}
