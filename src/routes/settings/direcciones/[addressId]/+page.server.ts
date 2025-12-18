import { db } from "$lib/server/db";
import type { PageServerLoad, Actions } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { addressesSchema } from "../schema";
import { fail } from "@sveltejs/kit";
import { addresses } from "$lib/server/db/schema";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

function capitalizeWords(text: string): string {
  return text
    .split(/(\s+|\(|\))/) // Split by spaces and parentheses while keeping them
    .map((part) => {
      // Only capitalize parts that are actual words (not spaces or parentheses)
      if (part.trim().length === 0 || part === '(' || part === ')') {
        return part;
      }
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join('');
}

export const load = (async ({ params }) => {
  const addressId = parseInt(params.addressId);
  if (isNaN(addressId)) {
    throw error(404, "Address not found");
  }

  const addressResult = await db
    .select({
      name: addresses.name,
      addressId: addresses.addressId,
      address1: addresses.address1,
      address2: addresses.address2,
      zipcode: addresses.zipcode,
      city: addresses.city,
      country: addresses.country,
      tel: addresses.tel,
      state: addresses.state,
      suffix: addresses.suffix,
    })
    .from(addresses)
    .where(eq(addresses.addressId, addressId))
    .limit(1);

  if (addressResult.length === 0) {
    throw error(404, "Address not found");
  }

  const address = addressResult[0];
  const form = await superValidate(zod(addressesSchema));

  // Pre-fill the form with address data
  form.data = {
    name: address.name,
    addressId: address.addressId,
    address1: address.address1!,
    address2: address.address2,
    zipcode: address.zipcode!,
    city: address.city!,
    country: address.country!,
    tel: address.tel!,
    state: address.state!,
    suffix: address.suffix,
  };

  return {
    form,
    address,
  };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod(addressesSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const { name, addressId, address1, address2, zipcode, city, country, tel, state, suffix } =
      form.data;

    const capName = capitalizeWords(name);

    try {
      await db
        .update(addresses)
        .set({
          name: capName,
          address1: address1.toUpperCase(),
          address2: address2 ? address2.toUpperCase() : null,
          zipcode: zipcode.toUpperCase(),
          city: city.toUpperCase(),
          country: country.toUpperCase(),
          tel,
          state: state.toUpperCase(),
          suffix: suffix?.toUpperCase(),
        })
        .where(eq(addresses.addressId, Number(addressId!)));

      const updatedForm = await superValidate(zod(addressesSchema));

      updatedForm.data = {
        name: capName,
        addressId,
        address1: address1.toUpperCase(),
        address2: address2 ? address2.toUpperCase() : null,
        zipcode: zipcode.toUpperCase(),
        city: city.toUpperCase(),
        country: country.toUpperCase(),
        tel,
        state: state.toUpperCase(),
        suffix: suffix?.toUpperCase()
      };

      return {
        form: updatedForm,
      };
    } catch (e) {
      console.log(e);
      return fail(500, { form });
    }
  },
} satisfies Actions;
