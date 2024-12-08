import * as auth from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import { hash } from "@node-rs/argon2";
import { SECRET_CODE } from "$env/static/private";
import { db } from "$lib/server/db";

import type { Actions } from "./$types";
import { users } from "$lib/server/db/schema";
import { capitaliseWord, generateUserId } from "$lib/utils";

import type { PageServerLoad } from "./$types.js";
import { superValidate, fail, setError } from "sveltekit-superforms";
import { userSignUpSchema } from "./schema";
import { zod } from "sveltekit-superforms/adapters";

export const load: PageServerLoad = async () => {
  const sucursales = await db.query.sucursales.findMany();

  if (sucursales.length === 0) {
    throw redirect(302, "/onboarding");
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
      username,
      password,
      correo,
      nombre: currNombre,
      apellido: currApellido,
      secret,
    } = form.data;

    if (secret !== SECRET_CODE) {
      return setError(form, "secret", "Codigo secreto invalido");
    }

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
    });

    if (!event.locals.user) {
      const sessionToken = auth.generateSessionToken();
      const session = await auth.createSession(sessionToken, userId);

      auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
    }

    redirect(302, "/");
  },
};
