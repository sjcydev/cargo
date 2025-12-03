import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { usuarios, sucursales } from "$lib/server/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { redirect } from "@sveltejs/kit";

export const load = (async ({ locals }) => {
  const { user } = locals;

  if (!user) {
    throw redirect(302, "/login");
  }

  const conditions = [eq(usuarios.archivado, false)];

  if (user.rol !== "ADMIN") {
    conditions.push(eq(usuarios.sucursalId, user.sucursalId!));

    const [sucursalesData, clientes] = await Promise.all([
      db
        .select({
          sucursalId: sucursales.sucursalId,
          sucursal: sucursales.sucursal,
        })
        .from(sucursales)
        .where(eq(sucursales.sucursalId, user.sucursalId!)),
      db
        .select({
          id: usuarios.id,
          nombre: usuarios.nombre,
          apellido: usuarios.apellido,
          correo: usuarios.correo,
          casillero: usuarios.casillero,
          cedula: usuarios.cedula,
          telefono: usuarios.telefono,
          nacimiento: usuarios.nacimiento,
          sexo: usuarios.sexo,
          sucursal: sucursales.sucursal,
          sucursalId: usuarios.sucursalId,
          codificacion: usuarios.codificacion,
        })
        .from(usuarios)
        .where(and(...conditions))
        .leftJoin(sucursales, eq(usuarios.sucursalId, sucursales.sucursalId))
        .orderBy(desc(usuarios.casillero))
        .limit(100),
    ]);

    return {
      sucursales: sucursalesData,
      clientes,
      last: clientes[clientes.length - 1].casillero,
    };
  }

  const [sucursalesData, clientes] = await Promise.all([
    db
      .select({
        sucursalId: sucursales.sucursalId,
        sucursal: sucursales.sucursal,
      })
      .from(sucursales),
    db
      .select({
        id: usuarios.id,
        nombre: usuarios.nombre,
        apellido: usuarios.apellido,
        correo: usuarios.correo,
        casillero: usuarios.casillero,
        cedula: usuarios.cedula,
        telefono: usuarios.telefono,
        nacimiento: usuarios.nacimiento,
        sexo: usuarios.sexo,
        sucursal: sucursales.sucursal,
        sucursalId: usuarios.sucursalId,
        codificacion: usuarios.codificacion,
      })
      .from(usuarios)
      .where(and(...conditions))
      .leftJoin(sucursales, eq(usuarios.sucursalId, sucursales.sucursalId))
      .orderBy(desc(usuarios.casillero))
      .limit(100),
  ]);

  return {
    sucursales: sucursalesData,
    clientes,
    last: clientes[clientes.length - 1].casillero,
  };
}) satisfies PageServerLoad;

import type { Actions } from "./$types";

export const actions: Actions = {
  delete: async ({ request }) => {
    const data = await request.formData();
    const casillero = data.get("id") as string;

    await db
      .update(usuarios)
      .set({
        archivado: true,
        archivadoAt: new Date(),
      })
      .where(eq(usuarios.casillero, Number(casillero)));
  },
};
