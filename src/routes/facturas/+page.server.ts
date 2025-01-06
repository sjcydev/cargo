import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";

export const load = (async () => {
  const facturas = await db.query.facturas.findMany({
    with: {
      trackings: true,
      cliente: { with: { sucursal: true } },
    },
  });
  return { facturas };
}) satisfies PageServerLoad;
