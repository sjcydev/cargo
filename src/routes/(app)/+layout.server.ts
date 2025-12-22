import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  // Public routes that don't require auth
  const publicPaths = ['/login', '/auth/verify'];

  if (!publicPaths.includes(url.pathname)) {
    // Protected route - require client session
    if (!locals.clientUser) {
      throw redirect(303, '/login');
    }

    // Return client data to all authenticated pages
    return {
      client: locals.clientUser
    };
  }

  // Public route
  return {};
};
