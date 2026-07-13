/**
 * 11_HOUR - Identity Dependency Injection Registration
 * 
 * Part of Slice 1.2: Identity Infrastructure.
 * Instantiates and wires together the gateway, repository, and domain service,
 * exporting them as robust singletons to decouple application layers.
 */

import { AuthGateway } from '@/firebase/gateways/AuthGateway';
import { FirebaseAuthRepository } from '@/firebase/repositories/FirebaseAuthRepository';
import { IdentityService } from '@/business/domain/IdentityService';

// 1. Instantiate the low-level SDK Abstraction Gateway
export const authGatewayInstance = new AuthGateway();

// 2. Inject Gateway into Repository Implementation
export const authRepositoryInstance = new FirebaseAuthRepository(authGatewayInstance);

// 3. Inject Repository into Domain Business Service
export const identityServiceInstance = new IdentityService(authRepositoryInstance);

AuthGateway.prototype.getCurrentUserId.bind(authGatewayInstance);
