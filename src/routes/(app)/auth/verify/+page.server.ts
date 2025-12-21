import { redirect } from '@sveltejs/kit';
import { clientAuthService } from '$lib/server/services/clientAuth.service';
import { logger } from '$lib/server/logger';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, cookies, request }) => {
  const token = url.searchParams.get('token');

  // 1. Validate token parameter exists
  if (!token) {
    logger.warn('Magic link verification attempted without token');
    return {
      error: 'Invalid verification link. Please request a new login link.'
    };
  }

  // 2. Verify token and get client ID
  const clientId = await clientAuthService.verifyMagicToken(token);

  if (!clientId) {
    logger.warn('Magic link verification failed', { token });
    return {
      error: 'This login link has expired or is invalid. Please request a new one.'
    };
  }

  // 3. Create session
  const userAgent = request.headers.get('user-agent') || undefined;
  const sessionId = await clientAuthService.createClientSession(clientId, userAgent);

  // 4. Set session cookie
  cookies.set('client-session', sessionId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });

  logger.info('Client logged in via magic link', { clientId });

  // 5. Redirect to dashboard
  throw redirect(303, '/dashboard');
};
