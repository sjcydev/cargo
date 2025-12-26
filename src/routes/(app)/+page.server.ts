import { error } from '@sveltejs/kit';
import { clientDataService } from '$lib/server/services/clientData.service';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sucursales } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
  const client = locals.clientUser;

  if (!client) {
    throw error(401, 'No autorizado');
  }

  try {
    // Fetch dashboard data in parallel
    const [summary, recentActivity, sucursal] = await Promise.all([
      clientDataService.getClientSummary(client.id),
      clientDataService.getRecentActivity(client.id, 5),
      db.select({ codificacion: sucursales.codificacion })
        .from(sucursales)
        .where(eq(sucursales.sucursalId, client.sucursalId))
        .limit(1)
    ]);

    const sucursalCode = sucursal[0]?.codificacion || '';

    return {
      client,
      summary,
      recentActivity,
      sucursalCode
    };
  } catch (err) {
    console.error('Error al cargar el dashboard:', err);
    throw error(500, 'Error al cargar los datos del dashboard');
  }
};
