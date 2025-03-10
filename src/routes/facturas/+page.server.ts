import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import {
  facturas,
  sucursales,
  trackings,
  usuarios,
} from "$lib/server/db/schema";
import { eq, desc, getTableColumns } from "drizzle-orm";

export const load = (async () => {
  const clienteData = await db
    .select({
      ...getTableColumns(usuarios),
      sucursal: sucursales.sucursal,
    })
    .from(usuarios)
    .leftJoin(sucursales, eq(usuarios.sucursalId, sucursales.sucursalId));

  const facturasD = await db
    .select({
      ...getTableColumns(facturas),
    })
    .from(facturas)
    .where(eq(facturas.enviado, true))
    .orderBy(desc(facturas.facturaId));

  const facturasData = facturasD.map((factura) => ({
    ...factura,
    cliente: clienteData.find((user) => user.id === factura.clienteId),
  }));

  return { facturas: facturasData };
}) satisfies PageServerLoad;
