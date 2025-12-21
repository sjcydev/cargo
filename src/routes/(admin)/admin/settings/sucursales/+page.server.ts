import { db } from "$lib/server/db";
import type { PageServerLoad, Actions } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { sucursalesSchema } from "./schema";
import { fail } from "@sveltejs/kit";
import { sucursales, companies } from "$lib/server/db/schema";

export const load = (async () => {
  const sucursalesData = await db
    .select({
      sucursalId: sucursales.sucursalId,
      sucursal: sucursales.sucursal,
      direccion: sucursales.direccion,
      telefono: sucursales.telefono,
      correo: sucursales.correo,
      precio: sucursales.precio,
      codificacion: sucursales.codificacion,
      maps: sucursales.maps,
    })
    .from(sucursales);

  const companyData = await db
    .select({ sucursalesLimit: companies.sucursalesLimit })
    .from(companies)
    .limit(1);

  const form = await superValidate(zod(sucursalesSchema));
  return { sucursales: sucursalesData, form, limite: companyData[0]?.sucursalesLimit };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod(sucursalesSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    let {
      codificacion,
      correoSucursal,
      direccion,
      sucursal,
      telefono,
      maps,
      precio,
    } = form.data;

    precio = precio ? Number(precio) : 2.75;

    try {
      await db.insert(sucursales).values({
        codificacion,
        correo: correoSucursal,
        direccion,
        sucursal,
        telefono,
        maps,
        precio,
        companyId: 1,
      });

      return { success: true, form };
    } catch (e) {
      console.log(e);
    }
  },
} satisfies Actions;
