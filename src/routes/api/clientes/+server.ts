import type { RequestEvent } from "../../$types";
import { db } from "$lib/server/db";
import { usuarios, sucursales } from "$lib/server/db/schema";
import { lt, eq, and, desc } from "drizzle-orm";

export const POST = async ({ request }: RequestEvent) => {
  const data: { last: number, sucursalId: number | null } = await request.json();

  const conditions = [eq(usuarios.archivado, false), lt(usuarios.casillero, data.last)];

  if (data.sucursalId) {
    conditions.push(eq(usuarios.sucursalId, data.sucursalId));
  }

  const clientes = await db
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
      sucursalId: sucursales.sucursalId,
    })
    .from(usuarios)
    .where(
      and(...conditions),
    )
    .leftJoin(sucursales, eq(usuarios.sucursalId, sucursales.sucursalId))
    .orderBy(desc(usuarios.casillero));

  return new Response(
    JSON.stringify({
      clientes,
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    },
  );
};
