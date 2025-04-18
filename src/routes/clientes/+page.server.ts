import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { sucursales, usuarios } from "$lib/server/db/schema";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import { fail, redirect } from "@sveltejs/kit";

export const load = (async ({ locals }) => {
  const { user } = locals;

  if (!user) {
    throw redirect(302, "/login");
  }

  const usuariosData = await db
    .select({
      ...getTableColumns(usuarios),
      sucursal: sucursales.sucursal,
    })
    .from(usuarios)
    .where(eq(usuarios.archivado, false))
    .leftJoin(sucursales, eq(usuarios.sucursalId, sucursales.sucursalId))
    .orderBy(desc(usuarios.casillero));

  if (user.rol !== "ADMIN") {
    const sucursalesData = await db
      .select()
      .from(sucursales)
      .where(eq(sucursales.sucursalId, user.sucursalId!));

    const bySucursal = sucursalesData.map((sucursal) => ({
      ...sucursal,
      usuarios: usuariosData
        .filter((user) => user.sucursalId === sucursal.sucursalId)
        .map((user) => ({ ...user })),
    }));

    return { todos: [], bySucursal, user };
  }

  const sucursalesData = await db.select().from(sucursales);

  const bySucursal = sucursalesData.map((sucursal) => ({
    ...sucursal,
    usuarios: usuariosData
      .filter((user) => user.sucursalId === sucursal.sucursalId)
      .map((user) => ({ ...user })),
  }));

  return { todos: usuariosData, bySucursal, user };
}) satisfies PageServerLoad;

import type { Actions } from "./$types";

export const actions: Actions = {
  delete: async ({ request }) => {
    const data = await request.formData();
    const casillero = data.get("id") as string;

    await db
      .update(usuarios)
      .set({
        archivado: true,
        archivadoAt: new Date(),
      })
      .where(eq(usuarios.casillero, Number(casillero)));
  },
};
