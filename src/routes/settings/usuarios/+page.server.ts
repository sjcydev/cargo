import { db } from "$lib/server/db";
import { sucursales, users } from "$lib/server/db/schema";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { userSignUpSchema } from "./schema";
import type { PageServerLoad, Actions } from "./$types";
import { eq } from "drizzle-orm";
import { hash } from "@node-rs/argon2";
import { fail } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import { capitaliseWord, generateUserId } from "$lib/utils";

export const load = (async () => {
  const usersData = await db
    .select()
    .from(users)
    .where(eq(users.archivado, false));

  const sucursalesData = await db.select().from(sucursales);

  const form = await superValidate(zod(userSignUpSchema));
  return { users: usersData, form, sucursales: sucursalesData };
}) satisfies PageServerLoad;

export const actions = {
  delete: async ({ request }) => {
    const formData = await request.formData();
    const userId = String(formData.get("id"));

    await db
      .update(users)
      .set({
        archivado: true,
        archivadoAt: new Date(),
      })
      .where(eq(users.id, userId));
  },
  registrar: async (event) => {
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
      sucursalId: currSucursalId,
      rol,
    } = form.data;

    const sucursalId = parseInt(currSucursalId);

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
      rol,
      companyId: 1,
      sucursalId,
    });
  },
} satisfies Actions;
