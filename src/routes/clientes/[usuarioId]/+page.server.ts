import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import type { PageServerLoad, Actions } from "./$types";
import { usuarios } from "$lib/server/db/schema";
import { error, fail } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms/server";
import { zod } from "sveltekit-superforms/adapters";
import { clientesRegisterSchema } from "$lib/clientes_registrar/schema";
import { capitaliseWord } from "$lib/utils";

export const load = (async ({ params }) => {
  const cliente = await db.query.usuarios.findFirst({
    where: eq(usuarios.casillero, Number(params.usuarioId)),
  });

  if (!cliente) {
    throw error(404, "Cliente no encontrado");
  }

  const sucursales = await db.query.sucursales.findMany();

  return {
    cliente,
    form: await superValidate(zod(clientesRegisterSchema)),
    sucursales,
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async (event) => {
    const { request } = event;
    const form = await superValidate(request, zod(clientesRegisterSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const {
      nombre,
      apellido,
      telefono,
      cedula,
      correo,
      sexo,
      sucursalId,
      casillero,
      id,
    } = form.data;

    await db
      .update(usuarios)
      .set({
        casillero: Number(casillero),
        nombre: capitaliseWord(nombre),
        apellido: capitaliseWord(apellido),
        telefono,
        cedula,
        correo,
        sexo,
        sucursalId: Number(sucursalId),
      })

      .where(eq(usuarios.id, Number(id)));
  },
};
