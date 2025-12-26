import { error } from '@sveltejs/kit';
import { clientDataService } from '$lib/server/services/clientData.service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const client = locals.clientUser;

  if (!client) {
    throw error(401, 'No autorizado');
  }

  const invoiceId = parseInt(params.id);

  if (isNaN(invoiceId)) {
    throw error(400, 'ID de factura inválido');
  }

  try {
    const invoice = await clientDataService.getInvoiceDetail(invoiceId, client.id);

    if (!invoice) {
      throw error(404, 'Factura no encontrada');
    }

    return {
      invoice
    };
  } catch (err: any) {
    if (err.status) throw err;
    console.error('Error al cargar detalles de factura:', err);
    throw error(500, 'Error al cargar los detalles de la factura');
  }
};
