import { db } from "$lib/server/db";
import type { PageServerLoad, Actions } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { addressesSchema } from "./schema";
import { fail } from "@sveltejs/kit";
import { addresses } from "$lib/server/db/schema";

export const load = (async () => {
  const addressesData = await db
    .select({
      name: addresses.name,
      addressId: addresses.addressId,
      address1: addresses.address1,
      address2: addresses.address2,
      zipcode: addresses.zipcode,
      city: addresses.city,
      country: addresses.country,
      tel: addresses.tel,
    })
    .from(addresses);

  const form = await superValidate(zod(addressesSchema));
  return { addresses: addressesData, form };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod(addressesSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const { name, address1, address2, zipcode, city, country, tel } = form.data;

    try {
      await db.insert(addresses).values({
        name,
        address1,
        address2: address2 || null,
        zipcode,
        city,
        country,
        tel,
      });

      return { success: true, form };
    } catch (e) {
      console.log(e);
      return fail(500, { form });
    }
  },
} satisfies Actions;
