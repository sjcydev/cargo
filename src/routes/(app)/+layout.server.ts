import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { companies, sucursales } from '$lib/server/db/schema';
import { getFriendlyUrl } from '$lib/server/s3';
import { eq } from 'drizzle-orm';

function formatWhatsAppNumber(phone: string | null): string {
  if (!phone) return '';

  // Remove all spaces, hyphens, and non-digit characters except the leading +
  return phone.replace(/(?!^\+)\D/g, '');
}

export const load: LayoutServerLoad = async ({ locals, url }) => {
  // Public routes that don't require auth
  const publicPaths = ['/login', '/auth/verify'];

  if (!publicPaths.includes(url.pathname)) {
    // Protected route - require client session
    if (!locals.clientUser) {
      throw redirect(303, '/login');
    }

    // Fetch company and sucursal data in parallel
    const [companyResult, sucursalResult] = await Promise.all([
      db
        .select({ logo: companies.logo, company: companies.company })
        .from(companies)
        .limit(1),
      db
        .select({ telefono: sucursales.telefono })
        .from(sucursales)
        .where(eq(sucursales.sucursalId, locals.clientUser.sucursalId))
        .limit(1)
    ]);

    const logo = companyResult[0]?.logo ? getFriendlyUrl(companyResult[0].logo) : null;
    const companyName = companyResult[0]?.company || 'Cargo Portal';
    const whatsappNumber = formatWhatsAppNumber(sucursalResult[0]?.telefono || '');

    // Return client data to all authenticated pages
    return {
      client: locals.clientUser,
      logo,
      companyName,
      whatsappNumber
    };
  }

  // Public route
  return {};
};
