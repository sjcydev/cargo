import { db } from "$lib/server/db";
import type { PageServerLoad, Actions } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { sucursalesSchema } from "./schema";
import { fail } from "@sveltejs/kit";
import { sucursales } from "$lib/server/db/schema";

export const load = (async () => {
  const sucursales = await db.query.sucursales.findMany();
  const company = await db.query.companies.findFirst();

  const form = await superValidate(zod(sucursalesSchema));
  return { sucursales, form, limite: company?.sucursalesLimit };
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
