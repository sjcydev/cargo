import { db } from "$lib/server/db";
import { eq, desc, and } from "drizzle-orm";
import type { PageServerLoad, Actions } from "./$types";
import { usuarios, facturas, sucursales, companies } from "$lib/server/db/schema";
import { fail, redirect } from "@sveltejs/kit";
import { superValidate, setError } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { regWithTipoSchema } from "$lib/clientes_registrar/schema";
import { capitaliseWord } from "$lib/utils";

export const load = (async ({ params }) => {
  const usuarioId = Number(params.usuarioId);

  const conditions = [
    eq(usuarios.casillero, usuarioId),
    eq(usuarios.archivado, false),
  ];

  const clienteData = await db
    .select({
      id: usuarios.id,
      casillero: usuarios.casillero,
      nombre: usuarios.nombre,
      apellido: usuarios.apellido,
      correo: usuarios.correo,
      cedula: usuarios.cedula,
      precio: usuarios.precio,
      telefono: usuarios.telefono,
      sexo: usuarios.sexo,
      sucursalId: usuarios.sucursalId,
      tipo: usuarios.tipo,
      codificacion: usuarios.codificacion
    })
    .from(usuarios)
    .where(and(...conditions))
    .limit(1);

  if (!clienteData[0]) {
    throw redirect(302, "/clientes");
  }

  const facturasConditions = [
    eq(facturas.clienteId, clienteData[0].id),
    eq(facturas.cancelada, false),
  ];

  const [facturasData, sucursalesData, allowCorps] = await Promise.all([
    db
      .select({
        fecha: facturas.fecha,
        facturaId: facturas.facturaId,
        total: facturas.total,
        enviado: facturas.enviado,
        pagado: facturas.pagado,
        retirados: facturas.retirados,
      })
      .from(facturas)
      .where(and(...facturasConditions))
      .orderBy(desc(facturas.facturaId)),
    db
      .select({
        sucursalId: sucursales.sucursalId,
        sucursal: sucursales.sucursal,
        precio: sucursales.precio
      })
      .from(sucursales),
    db
      .select({ allowCorps: companies.allowCorporativos }).from(companies).then(res => res[0].allowCorps)
  ]);

  const cliente = clienteData.map((cliente) => ({
    ...cliente,
    facturas: facturasData,
  }))[0];

  return {
    cliente,
    allowCorps,
    form: await superValidate(zod(regWithTipoSchema)),
    sucursales: sucursalesData,
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async (event) => {
    const { request } = event;
    const form = await superValidate(request, zod(regWithTipoSchema));

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
      tipo,
      codificacion,
    } = form.data;

    const clienteResult = await db
      .select({ id: usuarios.id })
      .from(usuarios)
      .where(eq(usuarios.casillero, Number(casillero)))
      .limit(1);

    if (clienteResult.length > 0 && clienteResult[0].id !== Number(id)) {
      return setError(
        form,
        "casillero",
        `Casillero debe ser unico, ya existe casillero ${form.data.casillero}`,
      );
    }

    const nombreCapital = capitaliseWord(nombre);
    const apellidoCapital = capitaliseWord(apellido);

    const sucursalResult = await db
      .select({ precio: sucursales.precio })
      .from(sucursales)
      .where(eq(sucursales.sucursalId, Number(sucursalId)))
      .limit(1);

    let precio = sucursalResult[0]?.precio;
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
        tipo: tipo !== "CORPORATIVO" ? sucursal!.precio === precio ? "REGULAR" : "ESPECIAL" : tipo,
        codificacion: tipo === "CORPORATIVO" ? codificacion?.toUpperCase() : null
      })
      .where(eq(usuarios.id, Number(id)));

    return { form, nombre: nombreCapital, apellido: apellidoCapital };
  },
};
