import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { usuarios, type Sucursales } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "@sveltejs/kit";
import { API_BASE_URL, API_KEY } from "$env/static/private";

export const load = (async ({ locals, url }) => {
  const { user } = locals;

  if (!user) {
    throw redirect(302, "/login");
  }

  const sucursalId = url.searchParams.get("sucursalId") ?? "";
  let page = url.searchParams.get("page") ?? "1";
  const limit = url.searchParams.get("limit") ?? "10";
  const search = url.searchParams.get("search") ?? "";

  const queryParams = new URLSearchParams({
    sucursalId: user.rol !== "ADMIN" ? user.sucursalId!.toString() : sucursalId,
    page,
    limit,
    search,
  });

  try {
    const response = await fetch(
      `${API_BASE_URL}/clientes?${queryParams.toString()}`,
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

    const sucursalesData =
      user.rol === "ADMIN"
        ? data.sucursales
        : data.sucursales.filter(
            (sucursal: Sucursales) => sucursal.sucursalId === user.sucursalId
          );

    return {
      todos: data.clientes ?? [],
      sucursales: sucursalesData,
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
