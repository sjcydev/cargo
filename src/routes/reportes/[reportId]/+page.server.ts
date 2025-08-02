import { db } from "$lib/server/db";
import { reportes, facturas } from "$lib/server/db/schema";
import { eq, between, and, inArray } from "drizzle-orm";
import { error, type Action } from "@sveltejs/kit";
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

  const facturasData = await db
    .select()
    .from(facturas)
    .where(inArray(facturas.facturaId, JSON.parse(report.facturasIds ?? "[]")));

  const company = await db.query.companies.findFirst()!;

  return {
    report,
    facturas: facturasData,
    logo: getFriendlyUrl(company!.logo!),
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
