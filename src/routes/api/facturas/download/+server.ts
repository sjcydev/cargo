import { API_BASE_URL, API_KEY } from "$env/static/private";
import type { RequestEvent } from "../$types";
import { error } from "@sveltejs/kit";
import { logger } from "$lib/server/logger";

export const GET = async ({ url }: RequestEvent) => {
  const facturaId = String(url.searchParams.get("facturaId"));

  try {
    const res = await fetch(`${API_BASE_URL}/facturas/descargar/${facturaId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    if (!res.ok) {
      const msg = await res.text();
      logger.error("Remote API failed to generate PDF", {
        facturaId,
        statusCode: res.status,
        apiResponse: msg,
        apiUrl: `${API_BASE_URL}/facturas/descargar/${facturaId}`,
        context: "External PDF generation service returned an error",
      });
      throw error(res.status, msg);
    }

    return new Response(res.body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Factura-${facturaId}.pdf"`,
      },
      status: 200,
    });
  } catch (e) {
    logger.error("Failed to download factura PDF", {
      facturaId,
      error: e,
      context: "Critical error during PDF download request",
    });
    return new Response(JSON.stringify({ error: "Failed to download PDF" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
};
