import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { db } from "$lib/server/db";
import { companies } from "$lib/server/db/schema";
import { getFriendlyUrl } from "$lib/server/s3";

export const load: LayoutServerLoad = async ({ locals, url }) => {
  // Allow login page to load without auth (prevent redirect loop)
  if (url.pathname === '/admin/login') {
    return {};
  }

  // Require admin session for all other admin routes
  if (!locals.adminUser) {
    throw redirect(303, '/admin/login');
  }

  // Load company data for admin interface
  const companyResult = await db
    .select({
      company: companies.company,
      logo: companies.logo,
    })
    .from(companies)
    .limit(1);

  const logo = getFriendlyUrl(companyResult[0]?.logo!);

  // Provide admin user context and company data to all admin pages
  return {
    adminUser: locals.adminUser,
    user: locals.adminUser, // For backward compatibility with existing components
    company: companyResult[0]?.company,
    logo
  };
};
