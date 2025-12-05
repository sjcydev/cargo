import type { RequestHandler } from "./$types";
import { API_BASE_URL, API_KEY } from "$env/static/private";
import { json } from "@sveltejs/kit";
import { logger } from "$lib/server/logger";

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { facturaIds } = body;

  if (!Array.isArray(facturaIds) || facturaIds.length === 0) {
    return json({ error: "No factura IDs provided" }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_BASE_URL}/emails/send-bulk-facturas`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ facturaIds }),
    }).then((res) => res.json());

    return json(res);
  } catch (error) {
    logger.error("Failed to send bulk factura emails", {
      facturaIds,
      facturaCount: facturaIds.length,
      error,
      apiUrl: `${API_BASE_URL}/emails/send-bulk-facturas`,
      context: "Error occurred while calling external email service API",
    });
    return json({ error: "Failed to process facturas" }, { status: 500 });
  }
};
