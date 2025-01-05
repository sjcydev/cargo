import type { RequestEvent } from "./$types";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import { usuarios } from "$lib/server/db/schema";

export const POST = async ({ params, request }: RequestEvent) => {
  const casillero = params.id;

  const data = await request.json();
  const { user } = data;

  let cliente;
  if (casillero.length > 0) {
    cliente = await db.query.usuarios.findFirst({
      where: eq(usuarios.casillero, Number(casillero)),
    });
  }

  if (user.rol !== "ADMIN" && user.sucursalId !== cliente?.sucursalId) {
    return new Response(JSON.stringify({ cliente: null }), {
      headers: { "Content-Type": "application/json" },
      status: 404,
    });
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
