import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { sucursales } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const load = (async ({ locals }) => {
  const sucursalesData = await db.query.sucursales.findFirst({
    where: eq(sucursales.sucursalId, Number(locals.user!.sucursalId)),
  });

  return { sucursales: sucursalesData };
}) satisfies PageServerLoad;
