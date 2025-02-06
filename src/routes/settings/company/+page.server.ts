import { db } from "$lib/server/db";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
  const company = await db.query.companies.findFirst();
  return { company };
}) satisfies PageServerLoad;
