import type { RequestHandler } from "./$types";
import { API_BASE_URL, API_KEY } from "$env/static/private";
import { logger } from "$lib/server/logger";

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
    logger.error("Failed to send welcome email to new client", {
      error: e,
      clientData: body,
      apiUrl: `${API_BASE_URL}/emails/bienvenida`,
      context: "Error occurred while sending welcome email via external API",
    });
    return new Response(
      JSON.stringify({ error: "Failed to send welcome email" }),
      { status: 500 }
    );
  }
};
