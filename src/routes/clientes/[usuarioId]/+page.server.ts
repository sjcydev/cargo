import { db } from "$lib/server/db";
import { eq, desc, getTableColumns } from "drizzle-orm";
import type { PageServerLoad, Actions } from "./$types";
import { usuarios, facturas, sucursales } from "$lib/server/db/schema";
import { error, fail, redirect } from "@sveltejs/kit";
import { superValidate, setError } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { clientesRegisterSchema } from "$lib/clientes_registrar/schema";
import { capitaliseWord } from "$lib/utils";

export const load = (async ({ params }) => {
  // const cliente = await db.query.usuarios.findFirst({
  //   where: eq(usuarios.casillero, Number(params.usuarioId)),
  //   with: {
  //     facturas: {
  //       orderBy: [desc(facturas.facturaId)],
  //     },
  //   },
  // });

  const clienteData = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.casillero, Number(params.usuarioId)))
    .limit(1);

  if (!clienteData[0]) {
    throw redirect(302, "/clientes");
  }

  const facturasData = await db
    .select()
    .from(facturas)
    .where(eq(facturas.clienteId, Number(params.usuarioId)))
    .orderBy(desc(facturas.facturaId));

  const cliente = clienteData.map((cliente) => ({
    ...cliente,
    facturas: facturasData,
  }))[0];

  const sucursalesData = await db.select().from(sucursales);

  return {
    cliente,
    form: await superValidate(zod(clientesRegisterSchema)),
    sucursales: sucursalesData,
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
      precio: currPrecio,
      id,
    } = form.data;

    const cliente = await db.query.usuarios.findFirst({
      where: eq(usuarios.casillero, Number(casillero)),
    });

    if (cliente && cliente.id !== Number(id)) {
      return setError(
        form,
        "casillero",
        `Casillero debe ser unico, ya existe casillero ${form.data.casillero}`
      );
    }

    const nombreCapital = capitaliseWord(nombre);
    const apellidoCapital = capitaliseWord(apellido);

    const sucursal = await db.query.sucursales.findFirst({
      where: eq(sucursales.sucursalId, Number(sucursalId)),
    });

    let precio = sucursal?.precio;
    if (currPrecio) {
      precio = Number(currPrecio.toFixed(2));
    }

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
        precio,
        tipo: sucursal!.precio === precio ? "REGULAR" : "ESPECIAL",
      })
      .where(eq(usuarios.id, Number(id)));

    return { form, nombre: nombreCapital, apellido: apellidoCapital };
  },
};
