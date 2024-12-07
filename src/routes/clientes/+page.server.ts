import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { sucursales, usuarios } from '$lib/server/db/schema';
import { desc, eq, sql } from 'drizzle-orm';

export const load = (async ({ locals }) => {
    // select usuarios and include only the sucursal nombre
    // const clientes = await db.select({
    //     id: usuarios.id,
    //     nombre: usuarios.nombre,
    //     apellido: usuarios.apellido,
    //     cedula: usuarios.cedula,
    //     correo: usuarios.correo,
    //     telefono: usuarios.telefono,
    //     casillero: usuarios.casillero,
    //     nacimiento: usuarios.nacimiento,
    //     sexo: usuarios.sexo,
    //     precio: usuarios.precio,
    //     createdAt: usuarios.createdAt,
    //     updatedAt: usuarios.updatedAt,
    //     sucursalId: usuarios.sucursalId,
    //     sucursal: sucursales.nombre
    // })
    //     .from(usuarios)
    //     .innerJoin(sucursales, eq(usuarios.sucursalId, sucursales.sucursalId));

    const sucursalesUsuarios = await db.query.sucursales.findMany({ with: { usuarios: { orderBy: [desc(usuarios.casillero)], with: { sucursal: true } } } })

    const todos = await db.query.usuarios.findMany({
        with: { sucursal: true },
        orderBy: [desc(usuarios.id)],
    });


    const user = locals.user

    return { todos, bySucursal: sucursalesUsuarios, user };
}) satisfies PageServerLoad;