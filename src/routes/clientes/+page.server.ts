import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { usuarios, sucursales } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "@sveltejs/kit";
import { usuariosService } from "$lib/server/services";

export const load = (async ({ locals }) => {
  const { user } = locals;

  if (!user) {
    throw redirect(302, "/login");
  }

  // Determine sucursalId filter based on user role
  const sucursalId = user.rol === "ADMIN" ? undefined : user.sucursalId!;

  // Fetch clientes using service layer
  const clientes = await usuariosService.list({
    limit: 100,
    sucursalId,
  });

  const last = clientes[clientes.length - 1]?.casillero;

  // Fetch sucursales for tabs (only user's sucursal if not ADMIN)
  const sucursalesData =
    user.rol === "ADMIN"
      ? await db
          .select({
            sucursalId: sucursales.sucursalId,
            sucursal: sucursales.sucursal,
          })
          .from(sucursales)
      : await db
          .select({
            sucursalId: sucursales.sucursalId,
            sucursal: sucursales.sucursal,
          })
          .from(sucursales)
          .where(eq(sucursales.sucursalId, user.sucursalId!));

  return {
    sucursales: sucursalesData,
    clientes,
    last,
  };
}) satisfies PageServerLoad;

import type { Actions } from "./$types";

export const actions: Actions = {
  delete: async ({ request, locals }) => {
    const data = await request.formData();
    const casillero = data.get("id") as string;

    // Find the usuario first to get the ID
    const usuario = await usuariosService.findByCasillero(Number(casillero));

    if (usuario) {
      // Use service layer for archiving
      await usuariosService.archive(usuario.id);
    }
  },
};
