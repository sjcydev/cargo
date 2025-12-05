import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { sucursales } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { redirect, type Actions } from "@sveltejs/kit";
import { facturasService } from "$lib/server/services";

export const load = (async ({ locals }) => {
  const { user } = locals;

  if (!user) {
    throw redirect(302, "/login");
  }

  // Determine sucursalId filter based on user role
  const sucursalId = user.rol === "ADMIN" ? undefined : user.sucursalId!;

  // Fetch facturas using service layer
  const facturasData = await facturasService.list({
    limit: 100,
    sucursalId,
    enviado: true,
  });

  // Fetch sucursales for tabs
  const sucursalesReq = db
    .select({
      sucursalId: sucursales.sucursalId,
      sucursal: sucursales.sucursal,
    })
    .from(sucursales);

  const sucursalesData =
    user.rol === "ADMIN"
      ? await sucursalesReq
      : await sucursalesReq.where(eq(sucursales.sucursalId, user.sucursalId!));

  return {
    facturas: facturasData,
    sucursales: sucursalesData,
    last: facturasData[facturasData.length - 1]?.facturaId ?? 0,
  };
}) satisfies PageServerLoad;

export const actions = {
  cancelFactura: async ({ request, locals }) => {
    const formData = await request.formData();
    const facturaId = Number(formData.get("id"));

    if (!locals.user) {
      return { type: "error", message: "Unauthorized" };
    }

    // Use service layer to cancel factura
    // Ensure sucursalId filtering for non-ADMIN users
    const sucursalId =
      locals.user.rol === "ADMIN" ? locals.user.sucursalId! : undefined;

    await facturasService.cancel(facturaId, sucursalId!);

    return { type: "success" };
  },
} satisfies Actions;
