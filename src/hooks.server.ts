import type { Handle } from "@sveltejs/kit";
import * as auth from "$lib/server/auth.js";
import { redirect, error } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { db } from "$lib/server/db";
import { sucursales, companies} from "$lib/server/db/schema";

const BLOCKED_PATHS = [
  /\.php$/i,
  /^\/wp-/i,
  /^\/admin\.php$/i,
  /^\/class\d+\.php$/i
];

const suspendHandle: Handle = async ({ event, resolve }) => {
  const [companiesData] = await db.select({suspended: companies.suspended}).from(companies).limit(1);

  if (companiesData && companiesData.suspended) {
    throw error(403, "Suspendida");
  }

  return await resolve(event);

}

export const blockedHandle: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url;

  for (const pattern of BLOCKED_PATHS) {
    if (pattern.test(pathname)) {
      return new Response('Not Found', { status: 404 });
    }
  }

  return resolve(event);
};

const onboardingHandle: Handle = async ({ event, resolve }) => {
  // Only need to check if any sucursales exist
  const sucursalesData = await db
    .select({ sucursalId: sucursales.sucursalId })
    .from(sucursales)
    .limit(1);

  if (sucursalesData.length === 0 && event.url.pathname !== "/admin/onboarding") {
    throw redirect(302, "/admin/onboarding");
  }

  return await resolve(event);
};

const authHandle: Handle = async ({ event, resolve }) => {
  const protected_urls =
    event.route.id === "/(admin)/admin" ||
    event.url.pathname.startsWith("/admin/facturas") ||
    event.url.pathname.startsWith("/admin/tracking") ||
    event.url.pathname.startsWith("/admin/registrar_cliente") ||
    event.url.pathname.startsWith("/admin/clientes") ||
    event.url.pathname.startsWith("/admin/registrar");

  const user = event.locals.user;

  if (event.url.pathname.startsWith("/admin/reportes") && user) {
    if (user?.rol === "EMPLEADO") {
      throw redirect(303, "/admin");
    }
  }

  if (protected_urls && !user) {
    throw redirect(302, "/admin/login");
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
  blockedHandle,
  luciaHandle,
  suspendHandle,
  onboardingHandle,
  authHandle
);
