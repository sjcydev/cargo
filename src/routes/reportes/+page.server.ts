import type { Actions, PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { reportes, sucursales, facturas } from "$lib/server/db/schema";
import { desc, eq, and, between, sql } from "drizzle-orm";
import { redirect, error, json, fail } from "@sveltejs/kit";
import { getLocalTimeZone, parseDate } from "@internationalized/date";

export const load = (async ({ locals }) => {
  const { user } = locals;

  if (!user) {
    throw redirect(302, "/login");
  }

  // Get all sucursales for tabs
  const allSucursales = await db.query.sucursales.findMany();

  // Get reports based on user role
  if (user.rol !== "ADMIN") {
    const reportesData = await db.query.reportes.findMany({
      where: eq(reportes.sucursalId, user.sucursalId!),
      orderBy: [desc(reportes.createdAt)],
    });

    return {
      reportes: reportesData,
      sucursales: [
        allSucursales.find((s) => s.sucursalId === user.sucursalId),
      ].filter(Boolean),
      user,
    };
  }

  const reportesData = await db.query.reportes.findMany({
    orderBy: [desc(reportes.createdAt)],
  });

  return {
    reportes: reportesData,
    sucursales: allSucursales,
    user,
  };
}) satisfies PageServerLoad;

export const actions = {
  generate: async ({ request, locals }) => {
    const { user } = locals;
    if (!user) throw redirect(302, "/login");

    const data = await request.formData();
    const fechaInicial = parseDate(data.get("fechaInicial") as string).toDate(
      getLocalTimeZone()
    );
    const fechaFinal = parseDate(data.get("fechaFinal") as string).toDate(
      getLocalTimeZone()
    );
    const sucursalId = parseInt(data.get("sucursalId") as string);

    const facturasData = await db
      .select()
      .from(facturas)
      .where(
        sucursalId === 0
          ? and(
              between(facturas.pagadoAt, fechaInicial, fechaFinal),
              eq(facturas.cancelada, false)
            )
          : and(
              eq(facturas.sucursalId, sucursalId),
              between(facturas.pagadoAt, fechaInicial, fechaFinal),
              eq(facturas.cancelada, false)
            )
      );

    // Check if there are any invoices
    if (facturasData.length === 0) {
      return fail(400, {
        message: "No hay facturas para el rango de fechas seleccionado",
      });
    }

    // Calculate totals and group by payment method
    const { total, metodoDePago } = facturasData.reduce(
      (acc, factura) => {
        const totalValue = Number(factura.total) || 0;
        acc.total += totalValue;
        const method = factura.metodoDePago;
        if (!acc.metodoDePago[method]) {
          acc.metodoDePago[method] = { count: 0, total: 0 };
        }
        acc.metodoDePago[method].count += 1;
        acc.metodoDePago[method].total += totalValue;
        return acc;
      },
      {
        total: 0,
        metodoDePago: {} as Record<string, { count: number; total: number }>,
      }
    );

    const facturasIds = JSON.stringify(
      facturasData.map((factura) => factura.facturaId)
    );

    // Create report
    await db.insert(reportes).values({
      fechaInicial,
      fechaFinal,
      facturas: facturasData.length,
      facturasIds,
      total,
      empleadoId: user.id,
      sucursalId: sucursalId === 0 ? null : sucursalId,
      metodoDePago: JSON.stringify(metodoDePago),
    });

    return { success: true };
  },
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get("id") as string;

    await db.delete(reportes).where(eq(reportes.reporteId, Number(id)));
    return { success: true };
  },
} satisfies Actions;
