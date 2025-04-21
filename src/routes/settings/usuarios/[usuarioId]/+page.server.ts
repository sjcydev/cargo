import { db } from "$lib/server/db";
import type { PageServerLoad, Actions } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { userUpdateSchema } from "./schema";
import { fail } from "@sveltejs/kit";
import { users } from "$lib/server/db/schema";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { sucursales } from "$lib/server/db/schema";

export const load = (async ({ params }) => {
  const userId = params.usuarioId;

  const user = (
    await db.select().from(users).where(eq(users.id, userId)).limit(1)
  )[0];

  const sucursalesData = await db.select().from(sucursales);

  if (!user) {
    throw error(404, "Usuario no encontrado");
  }

  const form = await superValidate(zod(userUpdateSchema));

  // Pre-fill the form with user data
  form.data = {
    id: user.id,
    nombre: user.nombre!,
    apellido: user.apellido!,
    rol: user.rol,
    sucursalId: String(user.sucursalId),
  };

  return {
    form,
    user,
    sucursales: sucursalesData,
  };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod(userUpdateSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    let { id, sucursalId, nombre, apellido, rol } = form.data;

    try {
      await db
        .update(users)
        .set({
          nombre,
          apellido,
          rol,
          sucursalId: Number(sucursalId),
        })
        .where(eq(users.id, id));

      const updatedForm = await superValidate(zod(userUpdateSchema));

      updatedForm.data = {
        id,
        sucursalId,
        nombre,
        apellido,
        rol,
      };

      return {
        form: updatedForm,
      };
    } catch (e) {
      console.log(e);
    }
  },
} satisfies Actions;
