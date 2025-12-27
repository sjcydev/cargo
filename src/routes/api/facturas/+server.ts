import { json } from "@sveltejs/kit";
import { z } from "zod";
import { apiHandler, requireAuth } from "$lib/server/api/handler";
import { facturasService } from "$lib/server/services";
import { logger } from "$lib/server/logger";

const requestSchema = z.object({
  cursor: z.number().int().positive().optional(),
  last: z.number().int().optional(), // Alias for cursor for backward compatibility
  sucursalId: z.number().int().positive().optional().nullable(),
});

export const POST = apiHandler(async (event) => {
  const user = requireAuth(event);

  const body = await event.request.json();
  const validatedData = requestSchema.parse(body);

  // Support both 'cursor' and 'last' for backward compatibility
  const cursor = validatedData.cursor || validatedData.last;

  // If user is not ADMIN, force filtering by their sucursal
  const sucursalId =
    user.rol === "ADMIN" && validatedData.sucursalId
      ? validatedData.sucursalId
      : undefined;

  logger.info("Fetching facturas list", {
    userId: user.id,
    cursor,
    sucursalId,
  });

  const facturas = await facturasService.list({
    cursor,
    sucursalId,
    enviado: true,
  });

  return json({ facturas });
});
