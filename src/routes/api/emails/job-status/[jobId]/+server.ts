import type { RequestHandler } from "./$types";
import { API_BASE_URL, API_KEY } from "$env/static/private";
import { json } from "@sveltejs/kit";
import { logger } from "$lib/server/logger";

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
    logger.error("Failed to fetch email job status", {
      jobId,
      error,
      apiUrl: `${API_BASE_URL}/emails/status/${jobId}`,
      context: "Error occurred while checking email job status from external API",
    });
    return json({ error: "Failed to fetch job status" }, { status: 500 });
  }
};
