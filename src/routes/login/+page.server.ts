import * as auth from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import type { Actions, PageServerLoad } from "./$types";
import { users } from "$lib/server/db/schema";
import { superValidate, fail, message } from "sveltekit-superforms";
import { userLoginSchema } from "./schema";
import { zod } from "sveltekit-superforms/adapters";
import { eq } from "drizzle-orm";
import { verify } from "@node-rs/argon2";

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    throw redirect(302, "/");
  }

  return {
    form: await superValidate(zod(userLoginSchema)),
  };
};

export const actions: Actions = {
  default: async (event) => {
    const { request } = event;
    const form = await superValidate(request, zod(userLoginSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const { username, password } = form.data;

    const results = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    const existingUser = results.at(0);

    if (!existingUser) {
      return message(form, "Username o contraseña son incorrectas", {
        status: 400,
      });
    }

    const validPassword = await verify(
      existingUser.passwordHash,
      password,
      {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      },
    );

    if (!validPassword) {
      return message(form, "Username o contraseña son incorrectas", {
        status: 400,
      });
    }

    const sessionToken = auth.generateSessionToken();
    const session = await auth.createSession(sessionToken, existingUser.id);

    auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

    redirect(302, "/");
  },
};
