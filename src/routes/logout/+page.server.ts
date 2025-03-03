import * as auth from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";

import type { Actions } from "./$types";

export const actions: Actions = {
  default: async (event) => {
    const { locals } = event;
    if (!locals.session) {
      return fail(401);
    }
    await auth.invalidateSession(locals.session.id);
    auth.deleteSessionTokenCookie(event);
    locals.user = null;

    return redirect(302, "/login");
  },
};
