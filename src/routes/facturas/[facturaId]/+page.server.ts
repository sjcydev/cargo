import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import { facturas, trackings, usuarios } from "$lib/server/db/schema";

export const load = (async ({ params }) => {
  const facturaId = params.facturaId;

  const factura = await db.query.facturas.findFirst({
    where: eq(facturas.facturaId, Number(facturaId)),
    with: { trackings: true, cliente: { with: { sucursal: true } } },
  });

  return { factura };
}) satisfies PageServerLoad;
