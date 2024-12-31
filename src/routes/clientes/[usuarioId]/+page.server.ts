import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import type { PageServerLoad, Actions } from "./$types";
import { usuarios } from "$lib/server/db/schema";
import { error, fail, redirect } from "@sveltejs/kit";
import { superValidate, setError } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { clientesRegisterSchema } from "$lib/clientes_registrar/schema";
import { capitaliseWord } from "$lib/utils";

export const load = (async ({ params }) => {
  const cliente = await db.query.usuarios.findFirst({
    where: eq(usuarios.casillero, Number(params.usuarioId)),
  });

  if (!cliente) {
    throw redirect(302, "/clientes");
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

    // if (cliente) {
    //   return setError(
    //     form,
    //     "casillero",
    //     `Casillero debe ser unico, ya existe casillero ${form.data.casillero}`
    //   );
    // }

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

    const nombreCapital = capitaliseWord(nombre);
    const apellidoCapital = capitaliseWord(apellido);

    await db
      .update(usuarios)
      .set({
        casillero: Number(casillero),
        nombre: nombreCapital,
        apellido: apellidoCapital,
        telefono,
        cedula,
        correo,
        sexo,
        sucursalId: Number(sucursalId),
      })
      .where(eq(usuarios.id, Number(id)));

    return { nombre: nombreCapital, apellido: apellidoCapital };
  },
};
