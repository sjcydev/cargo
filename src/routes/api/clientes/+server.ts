import { json } from "@sveltejs/kit";
import { z } from "zod";
import { apiHandler, requireAuth } from "$lib/server/api/handler";
import { usuariosService } from "$lib/server/services";
import { logger } from "$lib/server/logger";

const requestSchema = z.object({
  last: z.number().int().positive(),
  sucursalId: z.number().int().positive().optional().nullable(),
});

export const POST = apiHandler(async (event) => {
  const user = requireAuth(event);

  const body = await event.request.json();
  const validatedData = requestSchema.parse(body);

  // If user is not ADMIN, force filtering by their sucursal
  const sucursalId =
    user.rol === "ADMIN" && validatedData.sucursalId
      ? validatedData.sucursalId
      : user.sucursalId!;

  logger.info("Fetching clientes list", {
    userId: user.id,
    cursor: validatedData.last,
    sucursalId,
  });

  const clientes = await usuariosService.list({
    cursor: validatedData.last,
    sucursalId: sucursalId,
  });

  return json({ clientes });
});
