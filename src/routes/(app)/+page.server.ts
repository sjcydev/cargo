import { error } from '@sveltejs/kit';
import { clientDataService } from '$lib/server/services/clientData.service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const client = locals.clientUser;

  if (!client) {
    throw error(401, 'No autorizado');
  }

  try {
    // Fetch dashboard data in parallel
    const [summary, recentActivity] = await Promise.all([
      clientDataService.getClientSummary(client.id),
      clientDataService.getRecentActivity(client.id, 5)
    ]);

    return {
      client,
      summary,
      recentActivity
    };
  } catch (err) {
    console.error('Error al cargar el dashboard:', err);
    throw error(500, 'Error al cargar los datos del dashboard');
  }
};
