/**
 * 11_HOUR - Authorization Repository
 * 
 * Part of Slice 1.4: Authorization Platform & Route Access Framework.
 * Declares domain repository boundaries for retrieving user roles, permission sets,
 * and active feature flag states without exposing Firebase directly.
 */

import { IAuthorizationContext, UserRole, UserPermission } from './authzTypes';
import { AuthzUtils } from './authzUtils';
import { DEFAULT_FEATURE_FLAGS } from './authzConstants';
import { UserProfile } from '@/types';

export interface IAuthorizationRepository {
  /**
   * Retrieves or constructs the complete authorization profile context for an authenticated user.
   */
  getAuthorizationContext(userId: string, userProfile: UserProfile | null): Promise<IAuthorizationContext>;

  /**
   * Saves or overrides permissions/role flags (for admin actions or overrides).
   */
  updateAuthorizationContext(userId: string, role: UserRole, extraPermissions?: Set<UserPermission>): Promise<void>;
}

export class MemoryAuthorizationRepository implements IAuthorizationRepository {
  private customContexts = new Map<string, { role: UserRole; extraPermissions?: Set<UserPermission> }>();

  public async getAuthorizationContext(userId: string, userProfile: UserProfile | null): Promise<IAuthorizationContext> {
    // Determine default role based on profile email, or fallback to Member or Anonymous
    const email = userProfile?.email;
    let role = AuthzUtils.determineRoleFromEmail(email);

    // Check if anonymous session is active
    if (!userId || userId === 'anonymous_user') {
      role = UserRole.ANONYMOUS;
    }

    let permissions = new Set<UserPermission>(AuthzUtils.getDefaultPermissionsForRole(role));

    // Hydrate any overrides or admin adjustments
    const override = this.customContexts.get(userId);
    if (override) {
      role = override.role;
      permissions = new Set<UserPermission>([
        ...AuthzUtils.getDefaultPermissionsForRole(role),
        ...(override.extraPermissions ? Array.from(override.extraPermissions) : []),
      ]);
    }

    return {
      userId,
      userProfile,
      role,
      permissions,
      featureFlags: { ...DEFAULT_FEATURE_FLAGS },
      timestamp: new Date().toISOString(),
    };
  }

  public async updateAuthorizationContext(userId: string, role: UserRole, extraPermissions?: Set<UserPermission>): Promise<void> {
    this.customContexts.set(userId, { role, extraPermissions });
  }
}

export const authorizationRepositoryInstance = new MemoryAuthorizationRepository();
export default MemoryAuthorizationRepository;
