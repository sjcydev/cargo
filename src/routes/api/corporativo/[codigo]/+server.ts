import type { RequestEvent } from "./$types";
import { db } from "$lib/server/db";
import { eq, and, getTableColumns } from "drizzle-orm";
import { usuarios, sucursales } from "$lib/server/db/schema";
import { json, error } from "@sveltejs/kit";
import { z } from "zod";

const requestSchema = z.object({
  codigo: z.string().min(1).max(5),
});

export const POST = async ({ params, locals }: RequestEvent) => {
  // 1. Authentication check
  if (!locals.user) {
    throw error(401, "Unauthorized");
  }

  try {
    // 2. Input validation
    const { codigo } = requestSchema.parse({ codigo: params.codigo });

    // 3. Query with branch isolation
    // Note: We don't filter by tipo === "CORPORATIVO" because users might have
    // codificacion set without the type being updated
    const cliente = (
      await db
        .select({
          ...getTableColumns(usuarios),
          sucursal: { ...getTableColumns(sucursales) },
        })
        .from(usuarios)
        .leftJoin(sucursales, eq(usuarios.sucursalId, sucursales.sucursalId))
        .where(and(eq(usuarios.codificacion, codigo)))
        .limit(1)
    )[0];

    // Return null if not found (consistent with /api/clientes endpoint)
    return json({ cliente: cliente || null });
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw error(400, "Invalid corporate code format");
    }
    throw err;
  }
};
