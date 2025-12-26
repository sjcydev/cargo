import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db";
import {
  facturas,
  sucursales,
  trackings,
} from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { getToday, dateToLocaleString } from "$lib/utils";
import { fail } from "@sveltejs/kit";
import { z } from "zod";
import { logger } from "$lib/server/logger";

export const load = (async ({ locals }) => {
  const sucursalesData = await db
    .select({
      sucursalId: sucursales.sucursalId,
      sucursal: sucursales.sucursal,
      precio: sucursales.precio,
      codificacion: sucursales.codificacion,
    })
    .from(sucursales)
    .where(eq(sucursales.sucursalId, Number(locals.user!.sucursalId ?? 1)))
    .limit(1);

  return { sucursales: sucursalesData[0] };
}) satisfies PageServerLoad;

const trackingSchema = z.object({
  numeroTracking: z.string().min(1).max(255),
  peso: z.number().positive(),
  base: z.number().positive(),
  precio: z.number().positive(),
});

const facturaSchema = z.object({
  casillero: z.number().int().positive(),
  codificacion: z.string().optional(),
  total: z.number().positive(),
  trackings: z.array(trackingSchema).min(1),
  empleadoId: z.string(),
  sucursalId: z.number().int(),
  clienteId: z.number().int(),
});

const clienteSchema = z.object({
  id: z.number().int(),
  sucursalId: z.number().int(),
  casillero: z.number().int().nullable(),
  nombre: z.string(),
  apellido: z.string(),
});

export const actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { message: "Unauthorized" });
    }

    try {
      const formData = await request.formData();

      // Validate inputs
      const facturaInfo = facturaSchema.parse(
        JSON.parse(formData.get("facturaInfo") as string)
      );
      const cliente = clienteSchema.parse(
        JSON.parse(formData.get("cliente") as string)
      );

      // Verify branch access
      if (cliente.sucursalId !== locals.user.sucursalId && locals.user.rol !== "ADMIN") {
        return fail(403, { message: "Cannot create invoice for different branch" });
      }

      // Use transaction for atomicity
      const result = await db.transaction(async (tx) => {
        const [newFactura] = await tx
          .insert(facturas)
          .values({
            casillero: Number(facturaInfo.casillero),
            sucursalId: cliente.sucursalId,
            total: facturaInfo.total,
            empleadoId: locals.user!.id,
            clienteId: cliente.id,
            fecha: dateToLocaleString(getToday()),
            pagado: false,
            metodoDePago: "no_pagado",
            retirados: false,
            enviado: false,
          })
          .$returningId();

        const trackingsWithFactura = facturaInfo.trackings.map((tracking) => ({
          ...tracking,
          facturaId: newFactura.facturaId,
          sucursalId: cliente.sucursalId,
        }));

        await tx.insert(trackings).values(trackingsWithFactura);

        return newFactura;
      });

      return {
        success: true,
        message: "Factura creada exitosamente",
        facturaId: result.facturaId
      };

    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error("Invalid factura data", {
          userId: locals.user?.id,
          errors: error.errors
        });
        return fail(400, {
          message: "Datos de factura inválidos",
          errors: error.errors
        });
      }

      logger.error("Failed to create factura", {
        userId: locals.user?.id,
        error: error instanceof Error ? error.message : String(error)
      });

      return fail(500, {
        message: "Error al crear factura. Por favor intente de nuevo."
      });
    }
  },
} satisfies Actions;
