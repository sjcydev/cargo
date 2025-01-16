import { clientesRegisterSchema } from "$lib/clientes_registrar/schema";
import { db } from "$lib/server/db";
import type { Actions, PageServerLoad } from "./$types";
import { usuarios, sucursales } from "$lib/server/db/schema";
import { superValidate, fail, message } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { eq } from "drizzle-orm";
import { capitaliseWord } from "$lib/utils";

export const load: PageServerLoad = async ({ locals }) => {
  const sucursales = await db.query.sucursales.findMany();

  return {
    form: await superValidate(zod(clientesRegisterSchema)),
    sucursales,
  };
};

export const actions: Actions = {
  registrar: async (event) => {
    const { request, fetch } = event;
    const form = await superValidate(request, zod(clientesRegisterSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const {
      nombre: currNombre,
      apellido: currApellido,
      telefono,
      cedula,
      correo,
      sexo,
      sucursalId,
      precio: currPrecio,
    } = form.data;

    const nombre = capitaliseWord(currNombre);
    const apellido = capitaliseWord(currApellido);

    const sucursal = await db.query.sucursales.findFirst({
      where: eq(sucursales.sucursalId, Number(sucursalId)),
    });

    let precio = sucursal?.precio;
    if (currPrecio) {
      precio = Number(currPrecio.toFixed(2));
    }

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
        nacimiento: new Date(),
        precio,
        tipo: sucursal!.precio === precio ? "REGULAR" : "ESPECIAL",
      })
      .$returningId();

    await db
      .update(usuarios)
      .set({ casillero: Number(newUsuario[0].id) })
      .where(eq(usuarios.id, newUsuario[0].id));

    const response = await fetch(`/api/emails/bienvenida`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre,
        apellido,
        casillero: newUsuario[0].id,
        sucursalId: Number(sucursalId),
        correo,
        cedula,
        telefono,
      }),
    });

    const data = await response.json();
    console.log(data);
  },
};
