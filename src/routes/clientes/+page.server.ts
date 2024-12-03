import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sucursales, usuarios } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export const load = (async () => {
    // select usuarios and include only the sucursal nombre
    const clientes = await db.select({
        id: usuarios.id,
        nombre: usuarios.nombre,
        apellido: usuarios.apellido,
        cedula: usuarios.cedula,
        correo: usuarios.correo,
        telefono: usuarios.telefono,
        casillero: usuarios.casillero,
        nacimiento: usuarios.nacimiento,
        sexo: usuarios.sexo,
        precio: usuarios.precio,
        createdAt: usuarios.createdAt,
        updatedAt: usuarios.updatedAt,
        sucursalId: usuarios.sucursalId,
        sucursal: sucursales.nombre
    })
        .from(usuarios)
        .innerJoin(sucursales, eq(usuarios.sucursalId, sucursales.sucursalId));
    const sucursalesLista = await db.select().from(sucursales);

    return { clientes, sucursales: sucursalesLista };
}) satisfies PageServerLoad;