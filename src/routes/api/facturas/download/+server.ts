import { API_BASE_URL, API_KEY } from "$env/static/private";
import type { RequestEvent } from "../$types";
import { error } from "@sveltejs/kit";

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
      console.error("Remote API error:", msg);
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
    console.log(e);
    return new Response(JSON.stringify({ error: "error" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
};
