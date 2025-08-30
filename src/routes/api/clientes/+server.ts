import type { RequestEvent } from "../../$types";
import { db } from "$lib/server/db";
import { usuarios, sucursales } from "$lib/server/db/schema";
import { lt, eq, and, desc } from "drizzle-orm";

export const POST = async ({ request }: RequestEvent) => {
  const data: { last: number } = await request.json();

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
      and(eq(usuarios.archivado, false), lt(usuarios.casillero, data.last)),
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
