import { error } from '@sveltejs/kit';
import { clientDataService } from '$lib/server/services/clientData.service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const client = locals.clientUser;

  if (!client) {
    throw error(401, 'No autorizado');
  }

  try {
    const invoices = await clientDataService.getClientInvoices(client.id);

    // Calculate total outstanding
    const totalOutstanding = invoices
      .filter(inv => !inv.paid)
      .reduce((sum, inv) => sum + inv.total, 0);

    return {
      invoices,
      totalOutstanding
    };
  } catch (err) {
    console.error('Error al cargar facturas:', err);
    throw error(500, 'Error al cargar las facturas');
  }
};
