import type { RequestEvent } from "./$types";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import { usuarios } from "$lib/server/db/schema";

export const POST = async ({ params, request }: RequestEvent) => {
  const casillero = params.id;

  const data = await request.json();

  let cliente;
  if (casillero.length > 0) {
    cliente = await db.query.usuarios.findFirst({
      where: eq(usuarios.casillero, Number(casillero)),
      with: { sucursal: true },
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
