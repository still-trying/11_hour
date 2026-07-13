/**
 * 11_HOUR - Profile Dependency Injection Registry
 * 
 * Part of Slice 1.5: User Identity Profile Platform.
 * Instantiates the gateway, repository, and service components as robust, singletons
 * to decouple domain logic from presentation or state stores.
 */

import { FirebaseProfileRepository } from '@/firebase/repositories/FirebaseProfileRepository';
import { ProfileService } from '@/business/domain/ProfileService';

// 1. Instantiate the live Firebase repository
export const profileRepositoryInstance = new FirebaseProfileRepository();

// 2. Inject repository into the unified Profile business domain service
export const profileServiceInstance = new ProfileService(profileRepositoryInstance);
