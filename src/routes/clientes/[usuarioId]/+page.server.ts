import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";
import { usuarios } from "$lib/server/db/schema";
import { error } from "@sveltejs/kit";

export const load = (async ({ params }) => {
  const cliente = await db.query.usuarios.findFirst({
    where: eq(usuarios.casillero, Number(params.usuarioId)),
  });

  if (!cliente) {
    throw error(404, "Cliente no encontrado");
  }

  return { cliente };
}) satisfies PageServerLoad;
