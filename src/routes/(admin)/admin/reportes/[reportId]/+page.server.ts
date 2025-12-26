import { db } from "$lib/server/db";
import { reportes, facturas, companies } from "$lib/server/db/schema";
import { eq, between, and, inArray } from "drizzle-orm";
import { error, type Action } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { getFriendlyUrl } from "$lib/server/s3";

export const load = (async ({ params }) => {
  const reportId = parseInt(params.reportId);

  if (isNaN(reportId)) {
    throw error(400, "Invalid report ID");
  }

  const reportResult = await db
    .select({
      reporteId: reportes.reporteId,
      fechaInicial: reportes.fechaInicial,
      fechaFinal: reportes.fechaFinal,
      facturas: reportes.facturas,
      facturasIds: reportes.facturasIds,
      total: reportes.total,
      empleadoId: reportes.empleadoId,
      sucursalId: reportes.sucursalId,
      metodoDePago: reportes.metodoDePago,
    })
    .from(reportes)
    .where(eq(reportes.reporteId, reportId))
    .limit(1);

  if (reportResult.length === 0) {
    throw error(404, "Report not found");
  }

  const report = reportResult[0];

  const facturasData = await db
    .select()
    .from(facturas)
    .where(inArray(facturas.facturaId, JSON.parse(report.facturasIds ?? "[]")));

  const companyResult = await db
    .select({ logo: companies.logo })
    .from(companies)
    .limit(1);

  return {
    report,
    facturas: facturasData,
    logo: getFriendlyUrl(companyResult[0]?.logo!),
  };
}) satisfies PageServerLoad;

export const actions = {
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get("id") as string;

    await db.delete(reportes).where(eq(reportes.reporteId, Number(id)));
    return { success: true };
  },
} satisfies Actions;
