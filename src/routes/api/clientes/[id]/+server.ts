import type { RequestEvent } from "./$types";
import { db } from "$lib/server/db";
import { eq, getTableColumns } from "drizzle-orm";
import { usuarios, sucursales } from "$lib/server/db/schema";

export const POST = async ({ params, request }: RequestEvent) => {
  const casillero = params.id;

  const data = await request.json();

  let cliente;
  if (casillero.length > 0) {
    cliente = await db
      .select({
        ...getTableColumns(usuarios),
        sucursal: { ...getTableColumns(sucursales) },
      })
      .from(usuarios)
      .leftJoin(sucursales, eq(usuarios.sucursalId, sucursales.sucursalId))
      .where(eq(usuarios.casillero, Number(casillero)))
      .limit(1);
    cliente = cliente[0];
  }

  return new Response(
    JSON.stringify({
      cliente,
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }
  );
};
