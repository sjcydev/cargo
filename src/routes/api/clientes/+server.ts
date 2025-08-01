import { API_BASE_URL, API_KEY } from "$env/static/private";
import type { RequestEvent } from "../../$types";

export const POST = async ({ request }: RequestEvent) => {
  const data: { last: number } = await request.json();

  try {

    const res = await fetch(`${API_BASE_URL}/clientes/all`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({ cursor: data.last }),
    }).then((res) => res.json());

    return new Response(
      JSON.stringify({
        clientes: res.clientes,
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
