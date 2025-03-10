import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db";
import { trackings, sucursales } from "$lib/server/db/schema";
import { redirect } from "@sveltejs/kit";
import { desc, eq, getTableColumns } from "drizzle-orm";

export const load = (async ({ locals }) => {
  const { user } = locals;

  if (!user) {
    throw redirect(302, "/login");
  }

  // Get trackings based on user role
  if (user.rol !== "ADMIN") {
    // const trackingsData = await db.query.sucursales.findMany({
    //   where: eq(sucursales.sucursalId, user.sucursalId!),
    //   with: {
    //     trackings: {
    //       orderBy: [desc(trackings.createdAt)],
    //     },
    //   },
    // });

    const sucursalesData = await db
      .select({ ...getTableColumns(sucursales) })
      .from(sucursales)
      .where(eq(sucursales.sucursalId, user.sucursalId!));

    const trackingsData = await db
      .select()
      .from(trackings)
      .where(eq(trackings.sucursalId, user.sucursalId!))
      .orderBy(desc(trackings.createdAt));

    const bySucursal = sucursalesData.map((sucursal) => ({
      ...sucursal,
      trackings: trackingsData
        .filter((tracking) => tracking.sucursalId === sucursal.sucursalId)
        .map((tracking) => ({ ...tracking })),
    }));

    return {
      todos: [],
      bySucursal,
      user,
    };
  }

  const todos = await db
    .select()
    .from(trackings)
    .orderBy(desc(trackings.createdAt));

  const sucursalesData = await db
    .select({ ...getTableColumns(sucursales) })
    .from(sucursales);

  const trackingsData = await db
    .select()
    .from(trackings)
    .orderBy(desc(trackings.createdAt));

  const bySucursal = sucursalesData.map((sucursal) => ({
    ...sucursal,
    trackings: trackingsData
      .filter((tracking) => tracking.sucursalId === sucursal.sucursalId)
      .map((tracking) => ({ ...tracking })),
  }));

  return {
    todos,
    bySucursal,
    user,
  };
}) satisfies PageServerLoad;
