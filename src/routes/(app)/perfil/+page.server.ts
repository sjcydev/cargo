import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sucursales } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
  const client = locals.clientUser;

  if (!client) {
    throw redirect(303, '/login');
  }

  // Fetch sucursal codificacion
  const sucursal = await db
    .select({ codificacion: sucursales.codificacion })
    .from(sucursales)
    .where(eq(sucursales.sucursalId, client.sucursalId))
    .limit(1);

  const sucursalCode = sucursal[0]?.codificacion || '';

  return {
    client,
    sucursalCode
  };
};
