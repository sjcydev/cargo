import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { facturas } from "$lib/server/db/schema";
import { eq, desc } from "drizzle-orm";

export const load = (async () => {
  const facturasData = await db.query.facturas.findMany({
    where: eq(facturas.enviado, false),
    with: {
      trackings: true,
      cliente: { with: { sucursal: true } },
    },
    orderBy: [desc(facturas.facturaId)],
  });
  return { facturas: facturasData };
}) satisfies PageServerLoad;
