import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { sucursales, usuarios } from "$lib/server/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { redirect } from "@sveltejs/kit";

export const load = (async ({ locals }) => {
  const { user } = locals;

  if (!user) {
    throw redirect(302, "/login");
  }

  if (user.rol !== "ADMIN") {
    const bySucursal = await db.query.sucursales.findMany({
      where: eq(sucursales.sucursalId, user.sucursalId!),
      with: {
        usuarios: {
          orderBy: [desc(usuarios.id)],
          with: { sucursal: true },
        },
      },
    });

    return { todos: [], bySucursal, user };
  }

  const bySucursal = await db.query.sucursales.findMany({
    with: {
      usuarios: {
        orderBy: [desc(usuarios.casillero)],
        with: { sucursal: true },
      },
    },
  });

  const todos = await db.query.usuarios.findMany({
    with: { sucursal: true },
    orderBy: [desc(usuarios.id)],
  });

  return { todos, bySucursal, user };
}) satisfies PageServerLoad;
