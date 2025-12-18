import * as auth from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import { hash } from "@node-rs/argon2";
import { db } from "$lib/server/db";

import type { Actions } from "./$types";
import { users, sucursales, companies, addresses, sucursalToAddress } from "$lib/server/db/schema";
import { capitaliseWord, generateUserId } from "$lib/utils";

import type { PageServerLoad } from "./$types.js";
import { superValidate, fail, setError } from "sveltekit-superforms";
import { userSignUpSchema } from "./schema";
import { zod } from "sveltekit-superforms/adapters";
import { uploadFile } from "$lib/server/s3";
import { randomUUID as uuid } from "crypto";

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

export const load: PageServerLoad = async ({ locals }) => {
  // Only need to check if any records exist
  const sucursalesData = await db
    .select({ sucursalId: sucursales.sucursalId })
    .from(sucursales)
    .limit(1);

  const usersData = await db
    .select({ id: users.id })
    .from(users)
    .limit(1);

  if (sucursalesData.length !== 0) {
    if (usersData.length !== 0 && !locals.user) {
      throw redirect(302, "/login");
    }

    throw redirect(302, "/registrar");
  }

  return {
    form: await superValidate(zod(userSignUpSchema)),
  };
};

export const actions: Actions = {
  default: async (event) => {
    const { request } = event;

    const form = await superValidate(request, zod(userSignUpSchema));
    if (!form.valid) {
      return fail(400, { form });
    }

    const {
      company: currCompany,
      sucursal,
      direccion,
      maps,
      telefono,
      precio,
      codificacion,
      username,
      password,
      correo,
      correoSucursal,
      nombre: currNombre,
      apellido: currApellido,
      logo: logoArchivo,
      dominio,
      addressName,
      address1,
      address2,
      zipcode,
      state,
      city,
      country,
      tel,
    } = form.data;

    const company = capitaliseWord(currCompany);

    let newCompany;

    if (logoArchivo) {
      const fileExt = logoArchivo.type.split("/")[1] || "png";
      const keyName = `${company}/logo-${uuid()}.${fileExt}`;

      const friendlyUrl = await uploadFile({
        file: logoArchivo,
        keyName,
      });

      newCompany = await db
        .insert(companies)
        .values({
          company,
          logo: keyName,
          dominio,
        })
        .$returningId();
    } else {
      newCompany = await db
        .insert(companies)
        .values({
          company,
          dominio,
        })
        .$returningId();
    }

    const newSucursal = await db
      .insert(sucursales)
      .values({
        sucursal: capitaliseWord(sucursal),
        direccion: capitaliseWord(direccion),
        telefono,
        precio: Number(precio),
        codificacion,
        correo: correoSucursal,
        companyId: newCompany[0].companyId,
        maps,
      })
      .$returningId();

    // Create shipping address
    const newAddress = await db
      .insert(addresses)
      .values({
        name: capitalizeWords(addressName),
        address1: address1.toUpperCase(),
        address2: address2 ? address2.toUpperCase() : null,
        zipcode: zipcode.toUpperCase(),
        city: city.toUpperCase(),
        country: country.toUpperCase(),
        state: state.toUpperCase(),
        tel,
      })
      .$returningId();

    // Link address to sucursal
    await db.insert(sucursalToAddress).values({
      sucursalId: newSucursal[0].sucursalId,
      addressId: newAddress[0].addressId,
    });

    const userId = generateUserId();
    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const nombre = capitaliseWord(currNombre);
    const apellido = capitaliseWord(currApellido);

    await db.insert(users).values({
      id: userId,
      username,
      passwordHash,
      correo,
      nombre,
      apellido,
      rol: "ADMIN",
      sucursalId: newSucursal[0].sucursalId,
      companyId: newCompany[0].companyId,
    });

    const sessionToken = auth.generateSessionToken();
    const session = await auth.createSession(sessionToken, userId);

    auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

    redirect(302, "/");
  },
};
