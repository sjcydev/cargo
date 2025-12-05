import type { Users } from "$lib/server/db/schema";

export async function fetchClienteData(
  endpoint: string,
  casillero: string,
  user: Users
) {
  console.log(`[fetchClienteData] Searching for: ${casillero} via /${endpoint}`)
  try {
    const response = await fetch(`/api/${endpoint}/${casillero}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ user }),
    });

    if (!response.ok) {
      console.error(`[fetchClienteData] API error: ${response.status} ${response.statusText}`);
      // Still return null cliente instead of throwing
      return { cliente: null };
    }

    const data = await response.json();
    console.log(`[fetchClienteData] Found:`, data.cliente ? 'Cliente found' : 'Not found');
    return data;
  } catch (error) {
    console.error("[fetchClienteData] Error fetching client data:", error);
    return { cliente: null };
  }
}
