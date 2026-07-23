/**
 * 11_HOUR - Profile Dependency Injection Registry
 *
 * Part of Slice 1.5: User Identity Profile Platform.
 * Instantiates the Supabase repository and service components as robust singletons.
 */

import { SupabaseProfileRepository } from '@/lib/supabase/repositories/SupabaseProfileRepository';
import { ProfileService } from '@/business/domain/ProfileService';

// 1. Instantiate the Supabase profile repository
export const profileRepositoryInstance = new SupabaseProfileRepository();

// 2. Inject repository into the unified Profile business domain service
export const profileServiceInstance = new ProfileService(profileRepositoryInstance);
