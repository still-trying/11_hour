/**
 * 11_HOUR - Identity Dependency Injection Registration
 *
 * Part of Slice 1.2: Identity Infrastructure.
 * Instantiates and wires together the database auth repository and domain service,
 * exporting them as robust singletons to decouple application layers.
 */

import { SupabaseAuthRepository } from '@/lib/supabase/repositories/SupabaseAuthRepository';
import { IdentityService } from '@/business/domain/IdentityService';

// 1. Instantiate the Supabase Auth Repository
export const authRepositoryInstance = new SupabaseAuthRepository();

// 2. Inject Repository into Domain Business Service
export const identityServiceInstance = new IdentityService(authRepositoryInstance);
