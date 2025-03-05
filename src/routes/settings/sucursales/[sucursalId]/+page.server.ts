import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import { sucursales } from "$lib/server/db/schema";

export const load = (async ({ params }) => {
  const sucursalId = parseInt(params.sucursalId);
  if (isNaN(sucursalId)) {
    throw error(404, "Sucursal not found");
  }

  const sucursal = await db.query.sucursales.findFirst({
    where: eq(sucursales.sucursalId, sucursalId),
  });

  if (!sucursal) {
    throw error(404, "Sucursal not found");
  }
  return { sucursal };
}) satisfies PageServerLoad;
