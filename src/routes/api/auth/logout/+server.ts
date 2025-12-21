import { json, redirect } from '@sveltejs/kit';
import { clientAuthService } from '$lib/server/services/clientAuth.service';
import type { RequestHandler } from './$types';

/**
 * Client logout endpoint - POST for API calls
 */
export const POST: RequestHandler = async ({ cookies }) => {
  const sessionId = cookies.get('client-session');

  if (sessionId) {
    await clientAuthService.revokeClientSession(sessionId);
  }

  cookies.delete('client-session', { path: '/' });

  // Return JSON for API calls
  return json({ success: true });
};

/**
 * Client logout endpoint - GET for simple link-based logout
 */
export const GET: RequestHandler = async ({ cookies }) => {
  const sessionId = cookies.get('client-session');

  if (sessionId) {
    await clientAuthService.revokeClientSession(sessionId);
  }

  cookies.delete('client-session', { path: '/' });

  throw redirect(303, '/login');
};
