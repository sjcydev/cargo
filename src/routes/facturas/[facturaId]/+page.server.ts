import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db";
import { eq, and, inArray, getTableColumns } from "drizzle-orm";
import {
  facturas,
  trackings,
  sucursales,
  usuarios,
  type Sucursales,
  type UsuariosWithSucursal,
} from "$lib/server/db/schema";
import { getFriendlyUrl } from "$lib/server/s3";
import { getLocalTimeZone, today } from "@internationalized/date";

export const load = (async ({ params }) => {
  const facturaId = params.facturaId;

  // const factura = await db.query.facturas.findFirst({
  //   where: eq(facturas.facturaId, Number(facturaId)),
  //   with: { trackings: true, cliente: { with: { sucursal: true } } },
  // });

  const facturaData = await db
    .select({
      ...getTableColumns(facturas),
    })
    .from(facturas)
    .where(eq(facturas.facturaId, Number(facturaId)))
    .limit(1);

  if (!facturaData[0]) {
    throw new Error("Factura not found");
  }

  const trackingsData = await db
    .select({
      ...getTableColumns(trackings),
    })
    .from(trackings)
    .where(eq(trackings.facturaId, Number(facturaId)));

  const clienteData = await db
    .select({
      ...getTableColumns(usuarios),
      sucursal: { ...getTableColumns(sucursales) },
    })
    .from(usuarios)
    .leftJoin(sucursales, eq(usuarios.sucursalId, sucursales.sucursalId))
    .where(eq(usuarios.id, facturaData[0]?.clienteId))
    .limit(1);

  const factura = facturaData.map((f) => ({
    ...f,
    cliente: clienteData[0] as UsuariosWithSucursal,
    trackings: trackingsData,
  }))[0];

  const company = await db.query.companies.findFirst()!;
  const logo = getFriendlyUrl(company!.logo!);

  return { factura, company, logo };
}) satisfies PageServerLoad;

export const actions = {
  updateMetodoPago: async ({ request }) => {
    const formData = await request.formData();
    const facturaIds = JSON.parse(formData.get("facturaIds") as string);
    const metodoPago = formData.get("metodoPago") as
      | "efectivo"
      | "otros"
      | "tarjeta"
      | "transferencia"
      | "yappy"
      | "no_pagado";

    try {
      await db
        .update(facturas)
        .set({
          metodoDePago: metodoPago,
          pagado: metodoPago !== "no_pagado",
          pagadoAt:
            metodoPago !== "no_pagado"
              ? today(getLocalTimeZone()).toDate(getLocalTimeZone())
              : null,
        })
        .where(inArray(facturas.facturaId, facturaIds));
    } catch (e) {
      console.log(e);
    }

    return { type: "success" };
  },

  cancelFactura: async ({ request }) => {
    const formData = await request.formData();
    const facturaId = Number(formData.get("id"));

    await db
      .update(facturas)
      .set({
        cancelada: true,
        canceladaAt: new Date(),
      })
      .where(eq(facturas.facturaId, facturaId));

    // await db.transaction(async (tx) => {
    //   // Update factura status
    //   await tx
    //     .update(facturas)
    //     .set({
    //       cancelada: true,
    //       canceladaAt: new Date(),
    //     })
    //     .where(eq(facturas.facturaId, facturaId));
    // });

    return { type: "success" };
  },

  updateTrackings: async ({ request }) => {
    const formData = await request.formData();
    const facturaIds = JSON.parse(formData.get("facturaIds") as string);
    const trackingIds = JSON.parse(
      formData.get("trackingIds") as string
    ) as number[];
    const setRetirado = formData.get("setRetirado") === "true";

    await db.transaction(async (tx) => {
      // Update tracking status
      await tx
        .update(trackings)
        .set({
          retirado: setRetirado,
          retiradoAt: setRetirado
            ? today(getLocalTimeZone()).toDate(getLocalTimeZone())
            : null,
        })
        .where(inArray(trackings.trackingId, trackingIds));

      // Get all trackings for this factura
      const facturaTrackings = await tx
        .select({ retirado: trackings.retirado })
        .from(trackings)
        .where(inArray(trackings.facturaId, facturaIds));

      // Check if all trackings are retirado
      const allRetirado = facturaTrackings.every((t) => t.retirado);

      // Update factura retirados status
      await tx
        .update(facturas)
        .set({ retirados: allRetirado })
        .where(inArray(facturas.facturaId, facturaIds));
    });

    return { type: "success" };
  },
} satisfies Actions;
