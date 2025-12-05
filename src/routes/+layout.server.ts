import type { LayoutServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { companies } from "$lib/server/db/schema";
import { getFriendlyUrl } from "$lib/server/s3";

export const load = (async ({ locals, depends, setHeaders }) => {
  const { user } = locals;
  if (user) {
    const companyResult = await db
      .select({
        company: companies.company,
        logo: companies.logo,
      })
      .from(companies)
      .limit(1);

    const logo = getFriendlyUrl(companyResult[0]?.logo!);

    return { user, company: companyResult[0]?.company, logo };
  }

  return { user };
}) satisfies LayoutServerLoad;
