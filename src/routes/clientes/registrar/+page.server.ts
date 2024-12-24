import { clientesRegisterSchema } from "$lib/clientes_registrar/schema";
import * as auth from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import type { Actions, PageServerLoad } from "./$types";
import { usuarios } from "$lib/server/db/schema";
import { superValidate, fail, message } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { eq } from "drizzle-orm";
import { toast } from "svelte-sonner";

export const load: PageServerLoad = async ({ locals }) => {
  const sucursales = await db.query.sucursales.findMany();

  return {
    form: await superValidate(zod(clientesRegisterSchema)),
    sucursales,
  };
};

export const actions: Actions = {
  default: async (event) => {
    const { request } = event;
    const form = await superValidate(request, zod(clientesRegisterSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const { nombre, apellido, telefono, cedula, correo, sexo, sucursalId } =
      form.data;

    const newUsuario = await db
      .insert(usuarios)
      .values({
        nombre,
        apellido,
        telefono,
        cedula,
        correo,
        sexo,
        sucursalId: Number(sucursalId),
      })
      .$returningId();

    await db
      .update(usuarios)
      .set({ casillero: Number(newUsuario[0].id) })
      .where(eq(usuarios.id, newUsuario[0].id));
  },
};
