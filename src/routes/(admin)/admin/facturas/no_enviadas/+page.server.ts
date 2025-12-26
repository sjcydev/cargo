import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db";
import {
  facturas,
  usuarios,
  sucursales,
  trackings,
} from "$lib/server/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { redirect } from "@sveltejs/kit";

export const load = (async ({ locals }) => {
  const { user } = locals;

  if (!user) {
    throw redirect(302, "/admin/login");
  }

  const conditions = [eq(facturas.enviado, false), eq(facturas.cancelada, false)];

  if (user.rol !== "ADMIN") {
    conditions.push(eq(facturas.sucursalId, user.sucursalId!));
  }

  const sucursalesReq = db
    .select({
      sucursalId: sucursales.sucursalId,
      sucursal: sucursales.sucursal,
    })
    .from(sucursales);

  const [sucursalesData, facturasData] = await Promise.all([
    user.rol === "ADMIN"
      ? sucursalesReq
      : sucursalesReq.where(eq(sucursales.sucursalId, user.sucursalId!)),
    db
      .select({
        fecha: facturas.fecha,
        facturaId: facturas.facturaId,
        casillero: facturas.casillero,
        total: facturas.total,
        pagado: facturas.pagado,
        retirados: facturas.retirados,
        cliente: {
          nombre: usuarios.nombre,
          apellido: usuarios.apellido,
          cedula: usuarios.cedula,
          telefono: usuarios.telefono,
          sucursal: sucursales.sucursal,
          sucursalId: usuarios.sucursalId,
        },
      })
      .from(facturas)
      .where(and(...conditions))
      .leftJoin(usuarios, eq(facturas.clienteId, usuarios.id))
      .leftJoin(sucursales, eq(facturas.sucursalId, sucursales.sucursalId))
      .orderBy(desc(facturas.facturaId)),
  ]);

  return { facturas: facturasData, sucursales: sucursalesData };
}) satisfies PageServerLoad;

export const actions = {
  cancelFactura: async ({ request }) => {
    const formData = await request.formData();
    const facturaId = Number(formData.get("id"));

    await db.transaction(async (tx) => {
      await tx.delete(trackings).where(eq(trackings.facturaId, facturaId));
      await tx.delete(facturas).where(eq(facturas.facturaId, facturaId));
    });

    return { type: "success" };
  },
} satisfies Actions;
