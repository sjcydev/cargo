import { error } from '@sveltejs/kit';
import { clientDataService } from '$lib/server/services/clientData.service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const client = locals.clientUser;

  if (!client) {
    throw error(401, 'No autorizado');
  }

  const packageId = parseInt(params.id);

  if (isNaN(packageId)) {
    throw error(400, 'ID de paquete inválido');
  }

  try {
    const packageDetail = await clientDataService.getPackageDetail(packageId, client.id);

    if (!packageDetail) {
      throw error(404, 'Paquete no encontrado');
    }

    return {
      package: packageDetail
    };
  } catch (err: any) {
    if (err.status) throw err;
    console.error('Error al cargar detalles del paquete:', err);
    throw error(500, 'Error al cargar los detalles del paquete');
  }
};
