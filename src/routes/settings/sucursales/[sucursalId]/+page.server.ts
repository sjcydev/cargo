import { db } from "$lib/server/db";
import type { PageServerLoad, Actions } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { sucursalesSchema } from "../schema";
import { fail } from "@sveltejs/kit";
import { sucursales } from "$lib/server/db/schema";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export const load = (async ({ params }) => {
  const sucursalId = parseInt(params.sucursalId);
  if (isNaN(sucursalId)) {
    throw error(404, "Sucursal not found");
  }

  const sucursal = await db.query.sucursales.findFirst({
    where: eq(sucursales.sucursalId, sucursalId),
  });

  if (!sucursal) {
    throw error(404, "Sucursal not found");
  }

  const form = await superValidate(zod(sucursalesSchema));

  // Pre-fill the form with user data
  form.data = {
    sucursalId: sucursal.sucursalId,
    sucursal: sucursal.sucursal!,
    direccion: sucursal.direccion!,
    telefono: sucursal.telefono!,
    codificacion: sucursal.codificacion!,
    correoSucursal: sucursal.correo!,
    maps: sucursal.maps,
    precio: sucursal.precio,
  };

  return {
    form,
    sucursal,
  };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod(sucursalesSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    let {
      sucursalId,
      sucursal,
      direccion,
      telefono,
      codificacion,
      correoSucursal,
      maps,
      precio,
    } = form.data;

    precio = precio ? Number(precio) : 2.75;

    try {
      await db
        .update(sucursales)
        .set({
          sucursal,
          direccion,
          telefono,
          codificacion,
          correo: correoSucursal,
          maps,
          precio,
        })
        .where(eq(sucursales.sucursalId, Number(sucursalId!)));

      const updatedForm = await superValidate(zod(sucursalesSchema));

      updatedForm.data = {
        sucursalId,
        sucursal,
        direccion,
        telefono,
        codificacion,
        correoSucursal,
        maps,
        precio,
      };

      return {
        form: updatedForm,
      };
    } catch (e) {
      console.log(e);
    }
  },
} satisfies Actions;
