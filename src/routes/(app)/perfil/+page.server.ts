import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sucursales, addresses, sucursalToAddress } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
  const client = locals.clientUser;

  if (!client) {
    throw redirect(303, '/login');
  }

  // Fetch sucursal data and addresses in parallel
  const [sucursalData, addressesData] = await Promise.all([
    db
      .select({ codificacion: sucursales.codificacion })
      .from(sucursales)
      .where(eq(sucursales.sucursalId, client.sucursalId))
      .limit(1),
    db
      .select({
        addressId: addresses.addressId,
        name: addresses.name,
        address1: addresses.address1,
        address2: addresses.address2,
        city: addresses.city,
        state: addresses.state,
        zipcode: addresses.zipcode,
        country: addresses.country,
        tel: addresses.tel,
        suffix: addresses.suffix,
      })
      .from(sucursalToAddress)
      .innerJoin(addresses, eq(sucursalToAddress.addressId, addresses.addressId))
      .where(eq(sucursalToAddress.sucursalId, client.sucursalId))
  ]);

  const sucursalCode = sucursalData[0]?.codificacion || '';

  return {
    client,
    sucursalCode,
    addresses: addressesData
  };
};
