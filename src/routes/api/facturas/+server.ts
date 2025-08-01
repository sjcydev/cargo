import { API_BASE_URL, API_KEY } from "$env/static/private";
import type { RequestEvent } from "../../$types";
import { error } from "@sveltejs/kit";

export const POST = async ({ request }: RequestEvent) => {
  const data: { last: number } = await request.json();

  try {
    const res = await fetch(`${API_BASE_URL}/facturas`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({ cursor: data.last }),
    });
    
    if (!res.ok) {
      const msg = await res.text();
      console.error("Remote API error:", msg);
      throw error(res.status, msg);
    }

    const facturasData = await res.json();

    return new Response(
      JSON.stringify({
        facturas: facturasData.facturas,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (e) {
    console.log(e);
    return new Response(
      JSON.stringify({error: "error"}),
      {
        headers: { "Content-Type": "application/json"},
        status: 500
      }
    )
  }
};
