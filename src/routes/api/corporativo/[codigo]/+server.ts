import type { RequestEvent } from "./$types";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import { usuarios } from "$lib/server/db/schema";

export const POST = async ({ params }: RequestEvent) => {
  const codigo = params.codigo;

  let cliente;
  if (codigo.length > 0) {
    cliente = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, 19),
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
