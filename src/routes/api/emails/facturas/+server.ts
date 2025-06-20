import type { RequestHandler } from "./$types";
import { API_BASE_URL, API_KEY } from "$env/static/private";
import { json } from "@sveltejs/kit";

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
    console.error("Error processing request:", error);
    return json({ error: "Failed to process facturas" }, { status: 500 });
  }
};
