/**
 * 11_HOUR - Unified Authorization Hooks
 *
 * Part of Slice 1.4: Authorization Platform & Route Access Framework.
 * Re-exports core context consumers to streamline UI-level permission checks.
 */

export { useAuthorization, useFeatureFlags } from '@/context/AuthorizationContext';
export { UserRole, UserPermission } from '@/business/domain/authzTypes';
