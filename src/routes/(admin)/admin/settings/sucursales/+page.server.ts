import { db } from "$lib/server/db";
import type { PageServerLoad, Actions } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { sucursalesSchema } from "./schema";
import { fail } from "@sveltejs/kit";
import { sucursales, companies } from "$lib/server/db/schema";

function formatPhoneNumber(phone: string): string {
  // Split by first space to separate country code from phone number
  const parts = phone.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0].startsWith("+")) {
    // Keep country code, remove all spaces/hyphens from phone number part
    const countryCode = parts[0];
    const phoneNum = parts.slice(1).join("").replace(/[-\s]/g, "");
    return `${countryCode} ${phoneNum}`;
  }
  // Fallback: just remove hyphens but keep spaces
  return phone.replace(/-/g, "");
}

export const load = (async () => {
  const sucursalesData = await db
    .select({
      sucursalId: sucursales.sucursalId,
      sucursal: sucursales.sucursal,
      direccion: sucursales.direccion,
      telefono: sucursales.telefono,
      correo: sucursales.correo,
      precio: sucursales.precio,
      codificacion: sucursales.codificacion,
      maps: sucursales.maps,
    })
    .from(sucursales);

  const companyData = await db
    .select({ sucursalesLimit: companies.sucursalesLimit })
    .from(companies)
    .limit(1);

  const form = await superValidate(zod(sucursalesSchema));
  return { sucursales: sucursalesData, form, limite: companyData[0]?.sucursalesLimit };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod(sucursalesSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    let {
      codificacion,
      correoSucursal,
      direccion,
      sucursal,
      telefono,
      maps,
      precio,
    } = form.data;

    precio = precio ? Number(precio) : 2.75;

    try {
      await db.insert(sucursales).values({
        codificacion,
        correo: correoSucursal,
        direccion,
        sucursal,
        telefono: formatPhoneNumber(telefono),
        maps,
        precio,
        companyId: 1,
      });

      return { success: true, form };
    } catch (e) {
      console.log(e);
    }
  },
} satisfies Actions;
