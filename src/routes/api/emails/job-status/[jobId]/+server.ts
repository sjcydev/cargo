import type { RequestHandler } from "./$types";
import { API_BASE_URL, API_KEY } from "$env/static/private";
import { json } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params }) => {
  const jobId = params.jobId;

  if (!jobId) {
    return json({ error: "No job ID provided" }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_BASE_URL}/emails/status/${jobId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    }).then((res) => res.json());

    return json(res);
  } catch (error) {
    console.error("Error processing request:", error);
    return json({ error: "Failed to process facturas" }, { status: 500 });
  }
};
