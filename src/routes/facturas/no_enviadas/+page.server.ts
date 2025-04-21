import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db";
import {
  facturas,
  sucursales,
  usuarios,
  trackings,
} from "$lib/server/db/schema";
import { eq, and, desc, getTableColumns } from "drizzle-orm";

export const load = (async ({ locals }) => {
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
    .where(and(eq(facturas.enviado, false), eq(facturas.cancelada, false)))
    .orderBy(desc(facturas.facturaId));

  const facturasData = facturasD.map((factura) => ({
    ...factura,
    cliente: clienteData.find((user) => user.id === factura.clienteId),
  }));

  return { facturas: facturasData, rol: locals.user?.rol };
}) satisfies PageServerLoad;

export const actions = {
  cancelFactura: async ({ request }) => {
    const formData = await request.formData();
    const facturaId = Number(formData.get("id"));

    await db.transaction(async (tx) => {
      await tx.delete(trackings).where(eq(trackings.facturaId, facturaId));
      await tx.delete(facturas).where(eq(facturas.facturaId, facturaId));
    });

    return { type: "success" };
  },
} satisfies Actions;
