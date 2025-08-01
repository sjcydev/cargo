import type { LayoutServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { getFriendlyUrl } from "$lib/server/s3";

export const load = (async ({ locals, depends, setHeaders }) => {
  const { user } = locals;
  if (user) {

    const company = await db.query.companies.findFirst();
    const logo = getFriendlyUrl(company?.logo!);

    return { user, company: company!.company, logo };
  }

  return { user };
}) satisfies LayoutServerLoad;
