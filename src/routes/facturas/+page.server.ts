import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import {
  facturas,
  sucursales,
  trackings,
  usuarios,
} from "$lib/server/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { redirect, type Actions } from "@sveltejs/kit";

export const load = (async ({ locals }) => {
  const { user } = locals;

  if (!user) {
    throw redirect(302, "/login");
  }

  const sucursalesReq = db
    .select({
      sucursalId: sucursales.sucursalId,
      sucursal: sucursales.sucursal,
    })
    .from(sucursales);

  const conditions = [
    eq(facturas.enviado, true),
    eq(facturas.cancelada, false),
  ];

  if (user.rol !== "ADMIN") {
    conditions.push(eq(facturas.sucursalId, user.sucursalId!));
  }

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
        sucursalId: facturas.sucursalId,
        cliente: {
          nombre: usuarios.nombre,
          apellido: usuarios.apellido,
          cedula: usuarios.cedula,
          telefono: usuarios.telefono,
          sucursal: sucursales.sucursal,
        },
      })
      .from(facturas)
      .where(and(...conditions))
      .leftJoin(usuarios, eq(facturas.clienteId, usuarios.id))
      .leftJoin(sucursales, eq(facturas.sucursalId, sucursales.sucursalId))
      .orderBy(desc(facturas.facturaId))
      .limit(100),
  ]);

  return {
    facturas: facturasData,
    sucursales: sucursalesData,
    last: facturasData[facturasData.length - 1].facturaId,
  };
}) satisfies PageServerLoad;

export const actions = {
  cancelFactura: async ({ request }) => {
    const formData = await request.formData();
    const facturaId = Number(formData.get("id"));

    const factura = (
      await db
        .select()
        .from(facturas)
        .where(eq(facturas.facturaId, facturaId))
        .limit(1)
    )[0];

    if (!factura.enviado) {
      await db.transaction(async (tx) => {
        await tx.delete(trackings).where(eq(trackings.facturaId, facturaId));

        await tx.delete(facturas).where(eq(facturas.facturaId, facturaId));
      });
    } else {
      await db.transaction(async (tx) => {
        await tx
          .update(facturas)
          .set({
            cancelada: true,
            canceladaAt: new Date(),
          })
          .where(eq(facturas.facturaId, facturaId));

        await tx
          .update(trackings)
          .set({
            cancelada: true,
            canceladaAt: new Date(),
          })
          .where(eq(trackings.facturaId, facturaId));
      });
    }

    return { type: "success" };
  },
} satisfies Actions;
