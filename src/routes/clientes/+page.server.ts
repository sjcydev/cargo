import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { sucursales, usuarios } from "$lib/server/db/schema";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import { fail, redirect } from "@sveltejs/kit";
import { API_BASE_URL, API_KEY } from "$env/static/private";
import { page as pageStore } from "$app/state";

export const load = (async ({ locals, url }) => {
  const { user } = locals;

  if (!user) {
    throw redirect(302, "/login");
  }

  const sucursalId = url.searchParams.get("sucursalId") ?? "";
  let page = url.searchParams.get("page") ?? "1";
  const limit = url.searchParams.get("limit") ?? "10";
  const search = url.searchParams.get("search") ?? "";

  if (user.rol === "ADMIN") {
    try {
      const queryParams = new URLSearchParams({
        sucursalId,
        page,
        limit,
        search,
      });

      const response = await fetch(
        `${API_BASE_URL}/clientes/admin?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();

      return {
        todos: data.clientes ?? [],
        sucursales: data.sucursales ?? [],
        user,
        pagination: data.pagination,
      };
    } catch (e) {
      console.error("Error fetching clientes/admin:", e);
      return {
        todos: [],
        user,
        sucursales: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };
    }
  } else {
    try {
      const data = await fetch(`${API_BASE_URL}/clientes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          sucursalId: user.sucursalId,
          page,
          limit,
          search,
        }),
      });

      if (!data.ok) {
        throw new Error(`Request failed with status ${data.status}`);
      }

      const dataJson = await data.json();

      return {
        todos: dataJson.clientes ?? [],
        user,
        sucursales: dataJson.sucursales ?? [],
        pagination: dataJson.pagination,
      };
    } catch (e) {
      console.error("Error fetching clientes:", e);
      return {
        todos: [],
        user,
        sucursales: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };
    }
  }

  // const usuariosData = await db
  //   .select({
  //     ...getTableColumns(usuarios),
  //     sucursal: sucursales.sucursal,
  //   })
  //   .from(usuarios)
  //   .where(eq(usuarios.archivado, false))
  //   .leftJoin(sucursales, eq(usuarios.sucursalId, sucursales.sucursalId))
  //   .orderBy(desc(usuarios.casillero));

  // if (user.rol !== "ADMIN") {
  //   const sucursalesData = await db
  //     .select()
  //     .from(sucursales)
  //     .where(eq(sucursales.sucursalId, user.sucursalId!));

  //   const bySucursal = sucursalesData.map((sucursal) => ({
  //     ...sucursal,
  //     usuarios: usuariosData
  //       .filter((user) => user.sucursalId === sucursal.sucursalId)
  //       .map((user) => ({ ...user })),
  //   }));

  //   return { todos: [], bySucursal, user };
  // }

  // const sucursalesData = await db.select().from(sucursales);

  // const bySucursal = sucursalesData.map((sucursal) => ({
  //   ...sucursal,
  //   usuarios: usuariosData
  //     .filter((user) => user.sucursalId === sucursal.sucursalId)
  //     .map((user) => ({ ...user })),
  // }));

  // return { todos: usuariosData, bySucursal, user };
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
