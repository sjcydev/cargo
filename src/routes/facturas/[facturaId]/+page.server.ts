import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db";
import { eq, inArray, getTableColumns } from "drizzle-orm";
import {
  facturas,
  trackings,
  sucursales,
  usuarios,
  companies,
  type UsuariosWithSucursal,
} from "$lib/server/db/schema";
import { getFriendlyUrl } from "$lib/server/s3";
import { redirect } from "@sveltejs/kit";
import { getToday } from "$lib/utils";

export const load = (async ({ params }) => {
  const facturaId = params.facturaId;

  const facturaData = await db
    .select({
      facturaId: facturas.facturaId,
      casillero: facturas.casillero,
      fecha: facturas.fecha,
      pagado: facturas.pagado,
      clienteId: facturas.clienteId,
      total: facturas.total,
      metodoDePago: facturas.metodoDePago,
      pagadoAt: facturas.pagadoAt,
      sucursalId: facturas.sucursalId,
      empleadoId: facturas.empleadoId,
      retirados: facturas.retirados,
      enviado: facturas.enviado,
      cancelada: facturas.cancelada,
    })
    .from(facturas)
    .where(eq(facturas.facturaId, Number(facturaId)))
    .limit(1);

  if (!facturaData[0]) {
    throw new Error("Factura not found");
  }

  if (facturaData[0].cancelada) {
    throw redirect(301, "/facturas");
  }

  const trackingsData = await db
    .select({
      trackingId: trackings.trackingId,
      facturaId: trackings.facturaId,
      numeroTracking: trackings.numeroTracking,
      peso: trackings.peso,
      base: trackings.base,
      precio: trackings.precio,
      retirado: trackings.retirado,
      retiradoAt: trackings.retiradoAt,
      cancelada: trackings.cancelada,
    })
    .from(trackings)
    .where(eq(trackings.facturaId, Number(facturaId)));

  const clienteData = await db
    .select({
      id: usuarios.id,
      nombre: usuarios.nombre,
      apellido: usuarios.apellido,
      cedula: usuarios.cedula,
      telefono: usuarios.telefono,
      casillero: usuarios.casillero,
      correo: usuarios.correo,
      sucursalId: usuarios.sucursalId,
      sucursal: {
        sucursalId: sucursales.sucursalId,
        sucursal: sucursales.sucursal,
        direccion: sucursales.direccion,
        telefono: sucursales.telefono,
        correo: sucursales.correo,
      },
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

  const companyResult = await db
    .select({
      company: companies.company,
      logo: companies.logo,
    })
    .from(companies)
    .limit(1);

  const company = companyResult[0];
  const logo = getFriendlyUrl(company?.logo!);

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
              ? getToday().toJSDate()
              : null,
        })
        .where(inArray(facturas.facturaId, facturaIds));
    } catch (e) {
      console.log(e);
    }

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
            ? getToday().toJSDate()
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
