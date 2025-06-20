import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db";
import { facturas, trackings, type Sucursales } from "$lib/server/db/schema";
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
      `${API_BASE_URL}/facturas/no-enviados?${queryParams.toString()}`,
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
      facturas: data.facturas ?? [],
      sucursales: sucursalesData,
      rol: user.rol,
      pagination: data.pagination,
    };
  } catch (e) {
    console.error("Error fetching facturas:", e);
    return {
      facturas: [],
      rol: user.rol,
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

export const actions = {
  cancelFactura: async ({ request }) => {
    const formData = await request.formData();
    const facturaId = Number(formData.get("id"));

    await db.transaction(async (tx) => {
      await tx.delete(trackings).where(eq(trackings.facturaId, facturaId));
      await tx.delete(facturas).where(eq(facturas.facturaId, facturaId));
    });

    return { type: "success" };
  },
} satisfies Actions;
