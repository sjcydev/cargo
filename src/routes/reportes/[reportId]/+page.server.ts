import { db } from "$lib/server/db";
import { reportes, facturas } from "$lib/server/db/schema";
import { eq, between, and } from "drizzle-orm";
import { error } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { getFriendlyUrl } from "$lib/server/s3";

export const load = (async ({ params }) => {
  const reportId = parseInt(params.reportId);

  if (isNaN(reportId)) {
    throw error(400, "Invalid report ID");
  }

  const report = await db.query.reportes.findFirst({
    where: eq(reportes.reporteId, reportId),
  });

  if (!report) {
    throw error(404, "Report not found");
  }

  const facturasData = await db.query.facturas.findMany({
    where: and(
      eq(facturas.sucursalId, report.sucursalId!),
      between(facturas.pagadoAt, report.fechaInicial!, report.fechaFinal!)
    ),
  });

  const company = await db.query.companies.findFirst()!;

  return {
    report,
    facturas: facturasData,
    logo: getFriendlyUrl(company!.logo!),
  };
}) satisfies PageServerLoad;
