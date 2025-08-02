import { db } from "$lib/server/db";
import {
  facturas,
  trackings,
  usuarios,
  sucursales,
  type UsuariosWithSucursal,
} from "$lib/server/db/schema";
import { eq, inArray, getTableColumns } from "drizzle-orm";
import type { PageServerLoad } from "./$types";
import type { Actions } from "@sveltejs/kit";
import { getLocalTimeZone, today } from "@internationalized/date";

export const load = (async ({ url }) => {
  const facturaIds =
    url.searchParams.get("facturas")?.split(",").map(Number) || [];

  if (facturaIds.length === 0) {
    return {
      facturas: [],
      cliente: null,
    };
  }

  const facturaData = await db
    .select({
      ...getTableColumns(facturas),
    })
    .from(facturas)
    .where(inArray(facturas.facturaId, facturaIds));

  if (!facturaData[0]) {
    throw new Error("Factura not found");
  }

  const trackingsData = await db
    .select({
      ...getTableColumns(trackings),
    })
    .from(trackings)
    .where(inArray(trackings.facturaId, facturaIds));

  const clienteData = await db
    .select({
      ...getTableColumns(usuarios),
      sucursal: { ...getTableColumns(sucursales) },
    })
    .from(usuarios)
    .leftJoin(sucursales, eq(usuarios.sucursalId, sucursales.sucursalId))
    .where(eq(usuarios.id, facturaData[0]?.clienteId))
    .limit(1);

  const facturasData = facturaData.map((f) => ({
    ...f,
    cliente: clienteData[0] as UsuariosWithSucursal,
    trackings: trackingsData.filter((t) => t.facturaId === f.facturaId),
  }));

  // Get the selected facturas and their related data
  // const facturasData = await db.query.facturas.findMany({
  //   where: (facturas, { inArray }) => inArray(facturas.facturaId, facturaIds),
  //   with: {
  //     trackings: true,
  //     cliente: {
  //       with: {
  //         sucursal: true,
  //       },
  //     },
  //   },
  // });

  // All facturas must be from the same client
  const cliente = clienteData[0] as UsuariosWithSucursal;

  return {
    facturas: facturasData,
    cliente,
  };
}) satisfies PageServerLoad;

export const actions = {
  updateMetodoPago: async ({ request }) => {
    const data = await request.formData();
    const facturaIds = JSON.parse(data.get("facturaIds") as string);
    const metodoPago = data.get("metodoPago") as
      | "transferencia"
      | "efectivo"
      | "tarjeta"
      | "yappy"
      | "otros"
      | "no_pagado";

    await db.transaction(async (tx) => {
      for (const facturaId of facturaIds) {
        await tx
          .update(facturas)
          .set({
            metodoDePago: metodoPago,
            pagado: metodoPago !== "no_pagado",
            pagadoAt:
              metodoPago !== "no_pagado"
                ? today(getLocalTimeZone()).toDate(getLocalTimeZone())
                : null,
          })
          .where(eq(facturas.facturaId, facturaId));
      }
    });

    return { success: true };
  },

  updateTrackings: async ({ request }) => {
    const data = await request.formData();
    const facturaIds = JSON.parse(data.get("facturaIds") as string);
    const trackingIds = JSON.parse(data.get("trackingIds") as string);
    const setRetirado = data.get("setRetirado") === "true";

    await db.transaction(async (tx) => {
      // Update trackings
      await tx
        .update(trackings)
        .set({
          retirado: setRetirado,
          retiradoAt: setRetirado
            ? today(getLocalTimeZone()).toDate(getLocalTimeZone())
            : null,
        })
        .where(inArray(trackings.trackingId, trackingIds));

      // For each factura, check if all its trackings are retrieved
      for (const facturaId of facturaIds) {
        const facturaTrackings = await tx.query.trackings.findMany({
          where: eq(trackings.facturaId, facturaId),
        });

        const allRetrieved = facturaTrackings.every((t) => t.retirado);

        // Update factura retirados status
        await tx
          .update(facturas)
          .set({
            retirados: allRetrieved,
          })
          .where(eq(facturas.facturaId, facturaId));
      }
    });

    return { success: true };
  },
} satisfies Actions;
