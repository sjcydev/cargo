import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db";
import {
  facturas,
  sucursales,
  trackings,
  usuarios,
} from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { generateInvoice } from "$lib/facturacion/facturar/generatePDF";
import type {
  FacturasWithTrackings,
  User,
  Usuarios,
} from "$lib/server/db/schema";
import { getToday, dateToLocaleString } from "$lib/utils";

export const load = (async ({ locals }) => {
  const sucursalesData = await db.query.sucursales.findFirst({
    where: eq(sucursales.sucursalId, Number(locals.user!.sucursalId)),
  });

  return { sucursales: sucursalesData };
}) satisfies PageServerLoad;

export const actions = {
  crear: async ({ request }) => {
    const formData = await request.formData();
    const facturaInfo = JSON.parse(
      formData.get("facturaInfo") as string
    ) as FacturasWithTrackings;
    const cliente = JSON.parse(formData.get("cliente") as string) as Usuarios;
    const user = JSON.parse(formData.get("user") as string) as User;

    const newFactura = await db
      .insert(facturas)
      .values({
        casillero: Number(facturaInfo.casillero),
        sucursalId: Number(user.sucursalId),
        total: facturaInfo.total,
        empleadoId: facturaInfo.empleadoId,
        clienteId: Number(cliente.id),
        fecha: dateToLocaleString(getToday()),
      })
      .$returningId();

    facturaInfo.trackings = facturaInfo.trackings.map((tracking) => {
      return {
        ...tracking,
        facturaId: Number(newFactura[0].facturaId),
      };
    });

    await db.insert(trackings).values(facturaInfo.trackings);
  },
  descargar: async ({ request }) => {
    const factura = await db.query.facturas.findFirst({
      where: eq(facturas.facturaId, 1),
      with: { trackings: true },
    });

    const cliente = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, Number(factura?.clienteId)),
    });

    await generateInvoice(factura!, cliente!, true);
  },
} satisfies Actions;
