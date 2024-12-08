import * as auth from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import { hash } from "@node-rs/argon2";
import { db } from "$lib/server/db";

import type { Actions } from "./$types";
import { users, sucursales } from "$lib/server/db/schema";
import { capitaliseWord, generateUserId } from "$lib/utils";

import type { PageServerLoad } from "./$types.js";
import { superValidate, fail, setError } from "sveltekit-superforms";
import { userSignUpSchema } from "./schema";
import { zod } from "sveltekit-superforms/adapters";

export const load: PageServerLoad = async ({ locals }) => {
  const sucursales = await db.query.sucursales.findMany();

  if (sucursales.length !== 0) {
    if (!locals.user) {
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
      sucursal,
      direccion,
      telefono,
      precio,
      username,
      password,
      correo,
      nombre: currNombre,
      apellido: currApellido,
    } = form.data;

    const newSucursal = await db
      .insert(sucursales)
      .values({
        sucursal: capitaliseWord(sucursal),
        direccion: capitaliseWord(direccion),
        telefono,
        precio,
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
    });

    const sessionToken = auth.generateSessionToken();
    const session = await auth.createSession(sessionToken, userId);

    auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

    redirect(302, "/");
  },
};
