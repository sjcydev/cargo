import { db } from "$lib/server/db";
import type { PageServerLoad, Actions } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { sucursalesSchema } from "../schema";
import { fail } from "@sveltejs/kit";
import { sucursales, addresses, sucursalToAddress } from "$lib/server/db/schema";
import { error } from "@sveltejs/kit";
import { eq, and } from "drizzle-orm";

export const load = (async ({ params }) => {
  const sucursalId = parseInt(params.sucursalId);
  if (isNaN(sucursalId)) {
    throw error(404, "Sucursal not found");
  }

  const sucursalResult = await db
    .select({
      sucursalId: sucursales.sucursalId,
      sucursal: sucursales.sucursal,
      direccion: sucursales.direccion,
      telefono: sucursales.telefono,
      codificacion: sucursales.codificacion,
      correo: sucursales.correo,
      maps: sucursales.maps,
      precio: sucursales.precio,
    })
    .from(sucursales)
    .where(eq(sucursales.sucursalId, sucursalId))
    .limit(1);

  if (sucursalResult.length === 0) {
    throw error(404, "Sucursal not found");
  }

  const sucursal = sucursalResult[0];
  const form = await superValidate(zod(sucursalesSchema));

  // Pre-fill the form with user data
  form.data = {
    sucursalId: sucursal.sucursalId,
    sucursal: sucursal.sucursal!,
    direccion: sucursal.direccion!,
    telefono: sucursal.telefono!,
    codificacion: sucursal.codificacion!,
    correoSucursal: sucursal.correo!,
    maps: sucursal.maps,
    precio: sucursal.precio,
  };

  // Fetch assigned addresses for this sucursal
  const assignedAddresses = await db
    .select({
      addressId: addresses.addressId,
      name: addresses.name,
      address1: addresses.address1,
      address2: addresses.address2,
      city: addresses.city,
      country: addresses.country,
      zipcode: addresses.zipcode,
      tel: addresses.tel,
    })
    .from(sucursalToAddress)
    .innerJoin(addresses, eq(sucursalToAddress.addressId, addresses.addressId))
    .where(eq(sucursalToAddress.sucursalId, sucursalId));

  // Fetch all available addresses
  const allAddresses = await db
    .select({
      addressId: addresses.addressId,
      name: addresses.name,
      address1: addresses.address1,
      city: addresses.city,
      country: addresses.country,
    })
    .from(addresses);

  return {
    form,
    sucursal,
    assignedAddresses,
    allAddresses,
  };
}) satisfies PageServerLoad;

export const actions = {
  updateSucursal: async ({ request }) => {
    const form = await superValidate(request, zod(sucursalesSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    let {
      sucursalId,
      sucursal,
      direccion,
      telefono,
      codificacion,
      correoSucursal,
      maps,
      precio,
    } = form.data;

    precio = precio ? Number(precio) : 2.75;

    try {
      await db
        .update(sucursales)
        .set({
          sucursal,
          direccion,
          telefono,
          codificacion,
          correo: correoSucursal,
          maps,
          precio,
        })
        .where(eq(sucursales.sucursalId, Number(sucursalId!)));

      const updatedForm = await superValidate(zod(sucursalesSchema));

      updatedForm.data = {
        sucursalId,
        sucursal,
        direccion,
        telefono,
        codificacion,
        correoSucursal,
        maps,
        precio,
      };

      return {
        form: updatedForm,
      };
    } catch (e) {
      console.log(e);
    }
  },

  assignAddress: async ({ request }) => {
    const formData = await request.formData();
    const sucursalId = Number(formData.get("sucursalId"));
    const addressId = Number(formData.get("addressId"));

    if (!sucursalId || !addressId) {
      return fail(400, { error: "Missing required fields" });
    }

    try {
      await db.insert(sucursalToAddress).values({
        sucursalId,
        addressId,
      });

      return { success: true };
    } catch (e) {
      console.error(e);
      return fail(500, { error: "Failed to assign address" });
    }
  },

  unassignAddress: async ({ request }) => {
    const formData = await request.formData();
    const sucursalId = Number(formData.get("sucursalId"));
    const addressId = Number(formData.get("addressId"));

    if (!sucursalId || !addressId) {
      return fail(400, { error: "Missing required fields" });
    }

    try {
      await db
        .delete(sucursalToAddress)
        .where(
          and(
            eq(sucursalToAddress.sucursalId, sucursalId),
            eq(sucursalToAddress.addressId, addressId)
          )
        );

      return { success: true };
    } catch (e) {
      console.error(e);
      return fail(500, { error: "Failed to unassign address" });
    }
  },
} satisfies Actions;
