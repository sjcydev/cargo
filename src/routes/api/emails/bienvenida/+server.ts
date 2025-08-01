import type { RequestHandler } from "./$types";
import { API_BASE_URL, API_KEY } from "$env/static/private";

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();

  try {
    if (body) {
      const res = await fetch(`${API_BASE_URL}/emails/bienvenida`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Error in the server");
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    console.error(e);
  }

  return new Response(JSON.stringify({ error: "Company not found" }), {
    status: 404,
  });
};
