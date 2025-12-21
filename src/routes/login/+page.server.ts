import { db } from '$lib/server/db';
import { getFriendlyUrl } from '$lib/server/s3';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
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
