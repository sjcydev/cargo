import type { Handle } from "@sveltejs/kit";
import * as auth from "$lib/server/auth.js";
import { redirect, error } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { db } from "$lib/server/db";
import { sucursales, companies} from "$lib/server/db/schema";

const suspendHandle: Handle = async ({ event, resolve }) => {
  const [companiesData] = await db.select({suspended: companies.suspended}).from(companies).limit(1);

  if (companiesData && companiesData.suspended) {
    throw error(403, "Suspendida");
  }

  return await resolve(event);

}

const onboardingHandle: Handle = async ({ event, resolve }) => {
  // Only need to check if any sucursales exist
  const sucursalesData = await db
    .select({ sucursalId: sucursales.sucursalId })
    .from(sucursales)
    .limit(1);

  if (sucursalesData.length === 0 && event.url.pathname !== "/onboarding") {
    throw redirect(302, "/onboarding");
  }

  return await resolve(event);
};

const authHandle: Handle = async ({ event, resolve }) => {
  const protected_urls =
    event.route.id === "/" ||
    event.url.pathname.startsWith("/facturas") ||
    event.url.pathname.startsWith("/tracking") ||
    event.url.pathname.startsWith("/registrar_cliente") ||
    event.url.pathname.startsWith("/clientes") ||
    event.url.pathname.startsWith("/registrar");

  const user = event.locals.user;

  if (event.url.pathname.startsWith("/reportes") && user) {
    if (user?.rol === "EMPLEADO") {
      throw redirect(303, "/");
    }
  }

  if (protected_urls && !user) {
    throw redirect(302, "/login");
  }

  return await resolve(event);
};

const luciaHandle: Handle = async ({ event, resolve }) => {
  const sessionToken = event.cookies.get(auth.sessionCookieName);
  if (!sessionToken) {
    event.locals.user = null;
    event.locals.session = null;
    return resolve(event);
  }

  const { session, user } = await auth.validateSessionToken(sessionToken);

  if (session) {
    auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
  } else {
    auth.deleteSessionTokenCookie(event);
  }

  event.locals.user = user;
  event.locals.session = session;

  return await resolve(event);
};

export const handle: Handle = sequence(
  luciaHandle,
  suspendHandle,
  onboardingHandle,
  authHandle
);
