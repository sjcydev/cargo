import type { LayoutServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { getFriendlyUrl } from "$lib/server/s3";

export const load = (async ({ locals, depends, setHeaders }) => {
  // Add a dependency on 'app:company' to allow manual invalidation if needed
  depends('app:company');
  
  const { user } = locals;

  // Set cache headers for 1 hour
  setHeaders({
    'Cache-Control': 'max-age=3600'
  });

  const company = await db.query.companies.findFirst();
  const logo = getFriendlyUrl(company!.logo!);

  return { user, company: company!.company, logo };
}) satisfies LayoutServerLoad;
