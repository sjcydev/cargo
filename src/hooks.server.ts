import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth.js';
import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const authHandle: Handle = async ({ event, resolve }) => {
	const protected_urls =
		event.route.id === "/" ||
		event.url.pathname.startsWith("/facturar") ||
		event.url.pathname.startsWith("/facturas") ||
		event.url.pathname.startsWith("/tracking") ||
		event.url.pathname.startsWith("/registrar_cliente") ||
		event.url.pathname.startsWith("/clientes");

	const user = event.locals.user;

	if ((event.url.pathname === "/registrar" || event.url.pathname.startsWith("/reportes")) && user) {
		if (user?.rol !== "ADMIN") {
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

export const handle: Handle = sequence(luciaHandle, authHandle);

