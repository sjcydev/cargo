import type { PageServerLoad, Actions } from "./$types";
import { accountSchema } from "./schema";
import { superValidate, setError } from "sveltekit-superforms/client";
import { zod } from "sveltekit-superforms/adapters";
import { eq } from "drizzle-orm";
import { users } from "$lib/server/db/schema";
import { db } from "$lib/server/db";
import { fail } from "@sveltejs/kit";
import { verify, hash } from "@node-rs/argon2";

export const load = (async ({ locals }) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, locals.user!.id),
  });

  const form = await superValidate(zod(accountSchema));

  // Pre-fill the form with user data
  form.data = {
    id: user!.id,
    nombre: user!.nombre!,
    apellido: user!.apellido!,
    correo: user!.correo!,
    username: user!.username!,
  };

  return {
    form,
    user,
  };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request, locals }) => {
    const form = await superValidate(request, zod(accountSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const {
      id,
      username,
      password,
      correo,
      nombre,
      apellido,
      oldPassword,
      confirm,
    } = form.data;

    if (password && !oldPassword) {
      return setError(form, "oldPassword", "Contraseña actual es requerida");
    }

    try {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, id),
      });

      if (!existingUser) {
        return fail(400, { form });
      }

      // Check if username is taken by another user
      const userWithUsername = await db.query.users.findFirst({
        where: eq(users.username, username),
      });

      if (userWithUsername && userWithUsername.id !== id) {
        return setError(form, "username", "Nombre de usuario ya existe");
      }

      const updateData: Record<string, any> = {
        username,
        correo,
        nombre,
        apellido,
      };

      if (oldPassword && password) {
        if (!confirm || password !== confirm) {
          return setError(form, "confirm", "Las contraseñas no coinciden");
        }

        const validPassword = await verify(
          existingUser.passwordHash,
          oldPassword,
          {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1,
          }
        );

        if (!validPassword) {
          return setError(
            form,
            "oldPassword",
            "Contraseña actual es incorrecta"
          );
        }

        const passwordHash = await hash(password, {
          memoryCost: 19456,
          timeCost: 2,
          outputLen: 32,
          parallelism: 1,
        });

        updateData.passwordHash = passwordHash;
      }

      await db.update(users).set(updateData).where(eq(users.id, id));

      // Get the updated user data
      const updatedUser = await db.query.users.findFirst({
        where: eq(users.id, id),
      });

      if (!updatedUser) {
        return fail(500, { form });
      }

      // Update the session user data
      locals.user = updatedUser;

      const updatedForm = await superValidate(zod(accountSchema));

      updatedForm.data = {
        id: updatedUser!.id,
        nombre: updatedUser!.nombre!,
        apellido: updatedUser!.apellido!,
        correo: updatedUser!.correo!,
        username: updatedUser!.username!,
      };

      return {
        form: updatedForm,
        user: updatedUser,
      };
    } catch (error) {
      console.error("Error updating user:", error);
    }
  },
} satisfies Actions;
