import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { usuarios } from '$lib/server/db/schema';

export const load = (async () => {
    const clientes = await db.select().from(usuarios);
    console.log(clientes)
    return { clientes };
}) satisfies PageServerLoad;