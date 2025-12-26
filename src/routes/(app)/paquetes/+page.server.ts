import { error } from '@sveltejs/kit';
import { clientDataService } from '$lib/server/services/clientData.service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  const client = locals.clientUser;

  if (!client) {
    throw error(401, 'No autorizado');
  }

  // Get filter from query params (default: active)
  const filter = (url.searchParams.get('filter') || 'active') as 'active' | 'history' | 'all';

  try {
    const packages = await clientDataService.getClientPackages(client.id, filter);

    return {
      packages,
      currentFilter: filter
    };
  } catch (err) {
    console.error('Error al cargar paquetes:', err);
    throw error(500, 'Error al cargar los paquetes');
  }
};
