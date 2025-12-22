import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { companies } from '$lib/server/db/schema';
import { getFriendlyUrl } from '$lib/server/s3';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  // Public routes that don't require auth
  const publicPaths = ['/login', '/auth/verify'];

  if (!publicPaths.includes(url.pathname)) {
    // Protected route - require client session
    if (!locals.clientUser) {
      throw redirect(303, '/login');
    }

    // Fetch company logo
    const companyResult = await db
      .select({ logo: companies.logo, company: companies.company })
      .from(companies)
      .limit(1);

    const logo = companyResult[0]?.logo ? getFriendlyUrl(companyResult[0].logo) : null;
    const companyName = companyResult[0]?.company || 'Cargo Portal';

    // Return client data to all authenticated pages
    return {
      client: locals.clientUser,
      logo,
      companyName
    };
  }

  // Public route
  return {};
};
