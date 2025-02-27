import * as auth from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import { hash } from "@node-rs/argon2";
import { db } from "$lib/server/db";

import type { Actions } from "./$types";
import { users, sucursales, companies } from "$lib/server/db/schema";
import { capitaliseWord, generateUserId } from "$lib/utils";

import type { PageServerLoad } from "./$types.js";
import { superValidate, fail, setError } from "sveltekit-superforms";
import { userSignUpSchema } from "./schema";
import { zod } from "sveltekit-superforms/adapters";
import { uploadFile } from "$lib/server/s3";
import { randomUUID as uuid } from "crypto";

export const load: PageServerLoad = async ({ locals }) => {
  const sucursales = await db.query.sucursales.findMany();
  const users = await db.query.users.findMany();

  if (sucursales.length !== 0) {
    if (users.length !== 0 && !locals.user) {
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
        precio,
        codificacion,
        correo: correoSucursal,
        companyId: newCompany[0].companyId,
      })
      .$returningId();

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
