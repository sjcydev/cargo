import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db";
import { trackings, sucursales } from "$lib/server/db/schema";
import { redirect } from "@sveltejs/kit";
import { desc, eq } from "drizzle-orm";

export const load = (async ({ locals }) => {
  const { user } = locals;

  if (!user) {
    throw redirect(302, "/login");
  }

  // Get all sucursales for tabs
  const allSucursales = await db.query.sucursales.findMany();

  // Get trackings based on user role
  if (user.rol !== "ADMIN") {
    const trackingsData = await db.query.sucursales.findMany({
      where: eq(sucursales.sucursalId, user.sucursalId!),
      with: {
        trackings: {
          orderBy: [desc(trackings.createdAt)],
        },
      },
    });
    return {
      todos: [],
      bySucursal: trackingsData,
      user,
    };
  }

  const todos = await db.query.trackings.findMany({
    orderBy: [desc(trackings.createdAt)],
  });

  const trackingsData = await db.query.sucursales.findMany({
    with: {
      trackings: {
        orderBy: [desc(trackings.createdAt)],
      },
    },
  });

  return {
    todos,
    bySucursal: trackingsData,
    user,
  };
}) satisfies PageServerLoad;
