import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { userSignUpSchema } from "./schema";
import type { PageServerLoad, Actions } from "./$types";
import { eq } from "drizzle-orm";

export const load = (async () => {
  const usersData = await db
    .select()
    .from(users)
    .where(eq(users.archivado, false));

  const form = await superValidate(zod(userSignUpSchema));
  return { users: usersData, form };
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
} satisfies Actions;
