import { redirect } from '@sveltejs/kit';
import { clientAuthService } from '$lib/server/services/clientAuth.service';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ cookies }) => {
    const sessionId = cookies.get('client-session');

    if (sessionId) {
      await clientAuthService.revokeClientSession(sessionId);
    }

    cookies.delete('client-session', { path: '/' });

    throw redirect(303, '/login');
  }
};
