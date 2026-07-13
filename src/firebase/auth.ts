import { auth } from './config';
import { AuthGateway } from './gateways/AuthGateway';

/**
 * 11_HOUR - Firebase Authentication Ingress Core
 *
 * Exposes the standard SDK instance alongside the custom AuthGateway
 * implementation of the application.
 */

export const authGateway = new AuthGateway();

export { auth };
export * from './gateways/AuthGateway';
