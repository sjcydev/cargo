import type { RequestEvent } from "../../$types";
import {
  facturas as facturasTable,
  usuarios,
  sucursales,
} from "$lib/server/db/schema";
import { lt, eq, and, desc } from "drizzle-orm";
import { db } from "$lib/server/db";

export const POST = async ({ request }: RequestEvent) => {
  const { cursor, sucursalId }: { cursor: number; sucursalId?: number } =
    await request.json();

  const conditions = [
    eq(facturasTable.enviado, true),
    lt(facturasTable.facturaId, Number(cursor)),
  ];

  if (sucursalId) {
    conditions.push(eq(facturasTable.sucursalId, Number(sucursalId)));
  }

  const facturasData = await db
    .select({
      fecha: facturasTable.fecha,
      facturaId: facturasTable.facturaId,
      casillero: facturasTable.casillero,
      total: facturasTable.total,
      pagado: facturasTable.pagado,
      retirados: facturasTable.retirados,
      sucursalId: facturasTable.sucursalId,
      cliente: {
        nombre: usuarios.nombre,
        apellido: usuarios.apellido,
        cedula: usuarios.cedula,
        telefono: usuarios.telefono,
        sucursal: sucursales.sucursal,
      },
    })
    .from(facturasTable)
    .where(and(...conditions))
    .leftJoin(usuarios, eq(facturasTable.clienteId, usuarios.id))
    .leftJoin(sucursales, eq(facturasTable.sucursalId, sucursales.sucursalId))
    .orderBy(desc(facturasTable.facturaId));

  return new Response(
    JSON.stringify({
      facturas: facturasData,
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    },
  );
};
