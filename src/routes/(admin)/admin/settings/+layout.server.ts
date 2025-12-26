import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, url }) => {
  if (!locals.user) {
    throw redirect(303, "/admin/login");
  }

  if (
    locals.user.rol !== "ADMIN" &&
    !url.pathname.endsWith("/settings/perfil")
  ) {
    throw redirect(303, "/admin/settings/perfil");
  }

  return {};
};
