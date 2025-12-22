import { db } from '$lib/server/db';
import { getFriendlyUrl } from '$lib/server/s3';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // If user is already authenticated, redirect to dashboard
  if (locals.clientUser) {
    throw redirect(303, '/');
  }

  // Fetch the first company's logo
  // In a multi-tenant setup, you'd determine which company based on domain or other logic
  const company = await db.query.companies.findFirst({
    columns: {
      logo: true,
      company: true
    }
  });

  let logoUrl: string | null = null;

  if (company?.logo) {
    logoUrl = getFriendlyUrl(company.logo);
  }

  return {
    logoUrl,
    companyName: company?.company || 'Cargo Portal'
  };
};
