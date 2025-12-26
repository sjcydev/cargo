import type { Handle } from "@sveltejs/kit";
import * as auth from "$lib/server/auth.js";
import { redirect, error } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { db } from "$lib/server/db";
import { sucursales, companies, clientDeviceSessions } from "$lib/server/db/schema";
import { clientAuthService } from "$lib/server/services/clientAuth.service";
import { eq } from "drizzle-orm";

const BLOCKED_PATHS = [
  /\.php$/i,
  /^\/wp-/i,
  /^\/admin\.php$/i,
  /^\/class\d+\.php$/i,
];

const suspendHandle: Handle = async ({ event, resolve }) => {
  const [companiesData] = await db
    .select({ suspended: companies.suspended })
    .from(companies)
    .limit(1);

  if (companiesData && companiesData.suspended) {
    throw error(403, "Suspendida");
  }

  return await resolve(event);
};

export const blockedHandle: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url;

  for (const pattern of BLOCKED_PATHS) {
    if (pattern.test(pathname)) {
      return new Response("Not Found", { status: 404 });
    }
  }

  return resolve(event);
};

/**
 * Client portal access control
 * Redirects to admin if clientsPortal is disabled
 */
const clientsPortalHandle: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname;

  // Only check for non-admin routes (client portal routes)
  const isAdminRoute = path.startsWith("/admin");
  const isApiRoute = path.startsWith("/api");

  if (isAdminRoute || isApiRoute) {
    return resolve(event);
  }

  // Check if clients portal is enabled
  const [companiesData] = await db
    .select({ clientsPortal: companies.clientsPortal })
    .from(companies)
    .limit(1);

  // If clients portal is disabled, redirect all client routes to admin
  if (companiesData && companiesData.clientsPortal === false) {
    throw redirect(302, "/admin");
  }

  return await resolve(event);
};

const onboardingHandle: Handle = async ({ event, resolve }) => {
  // Only need to check if any sucursales exist
  const sucursalesData = await db
    .select({ sucursalId: sucursales.sucursalId })
    .from(sucursales)
    .limit(1);

  if (
    sucursalesData.length === 0 &&
    event.url.pathname !== "/admin/onboarding"
  ) {
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

// Admin session validation - runs for /admin/* and /api/* routes
const adminAuthHandle: Handle = async ({ event, resolve }) => {
  const isAdminRoute = event.url.pathname.startsWith("/admin");
  const isApiRoute = event.url.pathname.startsWith("/api");

  if (!isAdminRoute && !isApiRoute) {
    // Skip admin auth for non-admin, non-API routes
    return resolve(event);
  }

  const sessionToken = event.cookies.get(auth.sessionCookieName);
  if (!sessionToken) {
    event.locals.adminUser = null;
    event.locals.adminSession = null;
    // Maintain backward compatibility
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

  event.locals.adminUser = user;
  event.locals.adminSession = session;
  // Maintain backward compatibility
  event.locals.user = user;
  event.locals.session = session;

  return await resolve(event);
};

/**
 * Client authentication middleware
 * Validates client sessions for non-admin routes
 */
const clientAuthHandle: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname;

  // Only process non-admin routes
  const isAdminRoute = path.startsWith("/admin");
  const isApiRoute = path.startsWith("/api");

  if (isAdminRoute || isApiRoute) {
    return resolve(event);
  }

  // Public routes that don't require auth
  const publicRoutes = ["/login", "/auth/verify"];
  const isPublicRoute = publicRoutes.includes(path);

  // Get session cookie
  const sessionId = event.cookies.get("client-session");

  if (sessionId) {
    // Validate session and attach client data
    const sessionData = await clientAuthService.validateClientSession(sessionId);

    if (sessionData) {
      event.locals.clientUser = sessionData.client;
      event.locals.clientSession = {
        id: sessionData.session.id,
        clientId: sessionData.session.clientId,
        userAgent: sessionData.session.userAgent,
        lastActive: sessionData.session.lastActive,
        expiresAt: sessionData.session.expiresAt,
        createdAt: sessionData.session.createdAt
      };

      // Check if session needs renewal (< 15 days remaining)
      const fifteenDaysFromNow = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
      if (sessionData.session.expiresAt < fifteenDaysFromNow) {
        // Renew session
        const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await db.update(clientDeviceSessions)
          .set({ expiresAt: newExpiresAt })
          .where(eq(clientDeviceSessions.id, sessionId));

        // Update cookie
        event.cookies.set("client-session", sessionId, {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 30 // 30 days
        });
      }
    } else {
      // Invalid or expired session - clear cookie
      event.cookies.delete("client-session", { path: "/" });
    }
  }

  // Protect non-public routes
  if (!isPublicRoute && !event.locals.clientUser) {
    throw redirect(303, "/login");
  }

  return resolve(event);
};

export const handle: Handle = sequence(
  blockedHandle,
  suspendHandle, // Company suspension check
  adminAuthHandle, // Admin session validation (/admin/* and /api/*) - MUST run early to populate locals.user
  onboardingHandle, // Onboarding check (admin only)
  clientsPortalHandle, // Client portal access control
  clientAuthHandle, // Client session validation (only non-admin/non-api)
  authHandle, // Route-level authorization
);
