import type { User } from "$lib/server/db/schema";

export async function fetchClienteData(
  endpoint: string,
  casillero: string,
  user: User
) {
  try {
    const response = await fetch(`/api/${endpoint}/${casillero}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ user }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching client data:", error);
    return { cliente: null };
  }
}
