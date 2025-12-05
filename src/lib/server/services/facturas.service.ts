/**
 * Facturas Service
 * Centralizes all database operations related to facturas (invoices)
 * Ensures consistent sucursalId filtering and transaction handling
 */

import { db } from "$lib/server/db";
import { facturas, trackings, usuarios, sucursales, users } from "$lib/server/db/schema";
import { eq, and, desc, lt, between, sql } from "drizzle-orm";
import type {
  NewFacturas,
  NewTrackings,
  FacturasWithCliente,
  FacturasWithTrackings,
} from "$lib/server/db/schema";

export class FacturasService {
  /**
   * Find factura by ID with related data
   */
  async findById(facturaId: number, sucursalId?: number) {
    const conditions = [
      eq(facturas.facturaId, facturaId),
      eq(facturas.cancelada, false),
    ];

    if (sucursalId) {
      conditions.push(eq(facturas.sucursalId, sucursalId));
    }

    // Get factura with minimal columns
    const factura = await db
      .select({
        facturaId: facturas.facturaId,
        casillero: facturas.casillero,
        fecha: facturas.fecha,
        pagado: facturas.pagado,
        clienteId: facturas.clienteId,
        total: facturas.total,
        metodoDePago: facturas.metodoDePago,
        pagadoAt: facturas.pagadoAt,
        sucursalId: facturas.sucursalId,
        empleadoId: facturas.empleadoId,
        retirados: facturas.retirados,
        enviado: facturas.enviado,
        cancelada: facturas.cancelada,
        canceladaAt: facturas.canceladaAt,
      })
      .from(facturas)
      .where(and(...conditions))
      .limit(1);

    if (factura.length === 0) {
      return undefined;
    }

    const result = factura[0];

    // Fetch relations in parallel
    const [cliente, facturaTrackings, sucursal, empleado] = await Promise.all([
      // Get cliente with sucursal
      db
        .select({
          id: usuarios.id,
          nombre: usuarios.nombre,
          apellido: usuarios.apellido,
          cedula: usuarios.cedula,
          telefono: usuarios.telefono,
          casillero: usuarios.casillero,
          correo: usuarios.correo,
          tipo: usuarios.tipo,
          precio: usuarios.precio,
          sucursalId: usuarios.sucursalId,
        })
        .from(usuarios)
        .where(eq(usuarios.id, result.clienteId))
        .limit(1)
        .then(async (clienteRows) => {
          if (clienteRows.length === 0) return null;
          const c = clienteRows[0];
          // Get cliente's sucursal
          const clienteSucursal = await db
            .select({
              sucursalId: sucursales.sucursalId,
              sucursal: sucursales.sucursal,
              direccion: sucursales.direccion,
              telefono: sucursales.telefono,
              correo: sucursales.correo,
            })
            .from(sucursales)
            .where(eq(sucursales.sucursalId, c.sucursalId))
            .limit(1);
          return {
            ...c,
            sucursal: clienteSucursal[0] || null,
          };
        }),
      // Get trackings
      db
        .select({
          trackingId: trackings.trackingId,
          facturaId: trackings.facturaId,
          numeroTracking: trackings.numeroTracking,
          peso: trackings.peso,
          base: trackings.base,
          precio: trackings.precio,
          sucursalId: trackings.sucursalId,
          retirado: trackings.retirado,
          retiradoAt: trackings.retiradoAt,
          cancelada: trackings.cancelada,
          canceladaAt: trackings.canceladaAt,
        })
        .from(trackings)
        .where(eq(trackings.facturaId, result.facturaId)),
      // Get sucursal
      db
        .select({
          sucursalId: sucursales.sucursalId,
          sucursal: sucursales.sucursal,
          direccion: sucursales.direccion,
          telefono: sucursales.telefono,
          correo: sucursales.correo,
          precio: sucursales.precio,
        })
        .from(sucursales)
        .where(eq(sucursales.sucursalId, result.sucursalId))
        .limit(1),
      // Get empleado
      db
        .select({
          id: users.id,
          nombre: users.nombre,
          apellido: users.apellido,
          username: users.username,
          correo: users.correo,
          rol: users.rol,
        })
        .from(users)
        .where(eq(users.id, result.empleadoId))
        .limit(1),
    ]);

    return {
      ...result,
      cliente: cliente,
      trackings: facturaTrackings,
      sucursal: sucursal[0] || null,
      empleado: empleado[0] || null,
    };
  }

  /**
   * Get paginated list of facturas
   */
  async list(options: {
    limit?: number;
    cursor?: number;
    sucursalId?: number;
    enviado?: boolean;
    pagado?: boolean;
  }) {
    const { limit, cursor, sucursalId, enviado, pagado } = options;

    const conditions = [eq(facturas.cancelada, false)];

    if (cursor) {
      conditions.push(lt(facturas.facturaId, cursor));
    }

    if (sucursalId) {
      conditions.push(eq(facturas.sucursalId, sucursalId));
    }

    if (enviado !== undefined) {
      conditions.push(eq(facturas.enviado, enviado));
    }

    if (pagado !== undefined) {
      conditions.push(eq(facturas.pagado, pagado));
    }

    const query = db
      .select({
        fecha: facturas.fecha,
        facturaId: facturas.facturaId,
        casillero: facturas.casillero,
        total: facturas.total,
        pagado: facturas.pagado,
        retirados: facturas.retirados,
        enviado: facturas.enviado,
        sucursalId: facturas.sucursalId,
        cliente: {
          nombre: usuarios.nombre,
          apellido: usuarios.apellido,
          cedula: usuarios.cedula,
          telefono: usuarios.telefono,
          sucursal: sucursales.sucursal,
          codificacion: usuarios.codificacion
        },
      })
      .from(facturas)
      .where(and(...conditions))
      .leftJoin(usuarios, eq(facturas.clienteId, usuarios.id))
      .leftJoin(sucursales, eq(facturas.sucursalId, sucursales.sucursalId))
      .orderBy(desc(facturas.facturaId))

    let results;

    if (limit) {
      results = await query.limit(limit);
    } else {
      results = await query;
    }

    return results;
  }

  /**
   * Create factura with trackings in a transaction
   * This ensures data consistency - if any step fails, everything is rolled back
   */
  async createWithTrackings(
    facturaData: Omit<NewFacturas, "facturaId">,
    trackingsData: Omit<NewTrackings, "trackingId" | "facturaId">[]
  ) {
    return await db.transaction(async (tx) => {
      // Insert factura
      const [facturaResult] = await tx.insert(facturas).values(facturaData);
      const facturaId = facturaResult.insertId;

      // Insert all trackings with the factura ID and sucursalId
      if (trackingsData.length > 0) {
        const trackingsWithFacturaId = trackingsData.map((tracking) => ({
          ...tracking,
          facturaId,
          sucursalId: facturaData.sucursalId, // Ensure sucursalId consistency
        }));

        await tx.insert(trackings).values(trackingsWithFacturaId);
      }

      return facturaId;
    });
  }

  /**
   * Update factura payment status
   */
  async updatePaymentStatus(
    facturaId: number,
    sucursalId: number,
    data: {
      pagado: boolean;
      metodoDePago: "transferencia" | "efectivo" | "yappy" | "tarjeta" | "otros" | "no_pagado";
      pagadoAt?: Date;
    }
  ) {
    await db
      .update(facturas)
      .set(data)
      .where(
        and(eq(facturas.facturaId, facturaId), eq(facturas.sucursalId, sucursalId))
      );
  }

  /**
   * Update factura envio status
   */
  async updateEnvioStatus(facturaId: number, sucursalId: number, enviado: boolean) {
    await db
      .update(facturas)
      .set({ enviado })
      .where(
        and(eq(facturas.facturaId, facturaId), eq(facturas.sucursalId, sucursalId))
      );
  }

  /**
   * Update factura retirado status
   */
  async updateRetiradoStatus(
    facturaId: number,
    sucursalId: number,
    retirados: boolean
  ) {
    await db
      .update(facturas)
      .set({ retirados })
      .where(
        and(eq(facturas.facturaId, facturaId), eq(facturas.sucursalId, sucursalId))
      );
  }

  /**
   * Cancel factura and its trackings in a transaction
   */
  async cancel(facturaId: number, sucursalId: number) {
    return await db.transaction(async (tx) => {
      const now = new Date();

      // Cancel factura
      await tx
        .update(facturas)
        .set({
          cancelada: true,
          canceladaAt: now,
        })
        .where(
          and(eq(facturas.facturaId, facturaId), eq(facturas.sucursalId, sucursalId))
        );

      // Cancel all related trackings
      await tx
        .update(trackings)
        .set({
          cancelada: true,
          canceladaAt: now,
        })
        .where(
          and(eq(trackings.facturaId, facturaId), eq(trackings.sucursalId, sucursalId))
        );
    });
  }

  /**
   * Get facturas by cliente ID
   */
  async getByClienteId(clienteId: number, sucursalId?: number) {
    const conditions = [
      eq(facturas.clienteId, clienteId),
      eq(facturas.cancelada, false),
    ];

    if (sucursalId) {
      conditions.push(eq(facturas.sucursalId, sucursalId));
    }

    return await db
      .select({
        fecha: facturas.fecha,
        facturaId: facturas.facturaId,
        total: facturas.total,
        enviado: facturas.enviado,
        pagado: facturas.pagado,
        retirados: facturas.retirados,
      })
      .from(facturas)
      .where(and(...conditions))
      .orderBy(desc(facturas.facturaId));
  }

  /**
   * Get facturas not sent (enviado = false)
   */
  async getNotEnviadas(sucursalId?: number) {
    const conditions = [
      eq(facturas.enviado, false),
      eq(facturas.cancelada, false),
    ];

    if (sucursalId) {
      conditions.push(eq(facturas.sucursalId, sucursalId));
    }

    // Get facturas with cliente info in a single query
    const results = await db
      .select({
        facturaId: facturas.facturaId,
        casillero: facturas.casillero,
        fecha: facturas.fecha,
        pagado: facturas.pagado,
        clienteId: facturas.clienteId,
        total: facturas.total,
        retirados: facturas.retirados,
        enviado: facturas.enviado,
        sucursalId: facturas.sucursalId,
        cliente: {
          id: usuarios.id,
          nombre: usuarios.nombre,
          apellido: usuarios.apellido,
          cedula: usuarios.cedula,
          telefono: usuarios.telefono,
          casillero: usuarios.casillero,
          correo: usuarios.correo,
          sucursalId: usuarios.sucursalId,
        },
      })
      .from(facturas)
      .leftJoin(usuarios, eq(facturas.clienteId, usuarios.id))
      .where(and(...conditions))
      .orderBy(desc(facturas.facturaId));

    // Get trackings and cliente sucursales for all facturas
    const facturaIds = results.map((f) => f.facturaId);
    const [allTrackings, clienteSucursales] = await Promise.all([
      facturaIds.length > 0
        ? db
            .select({
              trackingId: trackings.trackingId,
              facturaId: trackings.facturaId,
              numeroTracking: trackings.numeroTracking,
              peso: trackings.peso,
              base: trackings.base,
              precio: trackings.precio,
              retirado: trackings.retirado,
            })
            .from(trackings)
            .where(
              sql`${trackings.facturaId} IN (${sql.join(facturaIds.map((id) => sql`${id}`), sql`, `)})`
            )
        : Promise.resolve([]),
      db
        .select({
          sucursalId: sucursales.sucursalId,
          sucursal: sucursales.sucursal,
          direccion: sucursales.direccion,
          telefono: sucursales.telefono,
          correo: sucursales.correo,
        })
        .from(sucursales),
    ]);

    // Map trackings to facturas and add cliente sucursal
    return results.map((factura) => ({
      ...factura,
      cliente: factura.cliente
        ? {
            ...factura.cliente,
            sucursal:
              clienteSucursales.find(
                (s) => s.sucursalId === factura.cliente!.sucursalId
              ) || null,
          }
        : null,
      trackings: allTrackings.filter((t) => t.facturaId === factura.facturaId),
    }));
  }

  /**
   * Get multiple facturas by IDs
   */
  async getByIds(facturaIds: number[], sucursalId?: number) {
    if (facturaIds.length === 0) {
      return [];
    }

    const conditions = [
      sql`${facturas.facturaId} IN (${sql.join(facturaIds.map((id) => sql`${id}`), sql`, `)})`,
      eq(facturas.cancelada, false),
    ];

    if (sucursalId) {
      conditions.push(eq(facturas.sucursalId, sucursalId));
    }

    // Get facturas with cliente in a single query
    const results = await db
      .select({
        facturaId: facturas.facturaId,
        casillero: facturas.casillero,
        fecha: facturas.fecha,
        pagado: facturas.pagado,
        clienteId: facturas.clienteId,
        total: facturas.total,
        metodoDePago: facturas.metodoDePago,
        retirados: facturas.retirados,
        enviado: facturas.enviado,
        sucursalId: facturas.sucursalId,
        cliente: {
          id: usuarios.id,
          nombre: usuarios.nombre,
          apellido: usuarios.apellido,
          cedula: usuarios.cedula,
          telefono: usuarios.telefono,
          casillero: usuarios.casillero,
          correo: usuarios.correo,
          sucursalId: usuarios.sucursalId,
        },
      })
      .from(facturas)
      .leftJoin(usuarios, eq(facturas.clienteId, usuarios.id))
      .where(and(...conditions));

    // Get related data in parallel
    const [allTrackings, allSucursales, clienteSucursales] = await Promise.all([
      db
        .select({
          trackingId: trackings.trackingId,
          facturaId: trackings.facturaId,
          numeroTracking: trackings.numeroTracking,
          peso: trackings.peso,
          base: trackings.base,
          precio: trackings.precio,
          retirado: trackings.retirado,
        })
        .from(trackings)
        .where(
          sql`${trackings.facturaId} IN (${sql.join(facturaIds.map((id) => sql`${id}`), sql`, `)})`
        ),
      db
        .select({
          sucursalId: sucursales.sucursalId,
          sucursal: sucursales.sucursal,
          direccion: sucursales.direccion,
          telefono: sucursales.telefono,
          correo: sucursales.correo,
          precio: sucursales.precio,
        })
        .from(sucursales),
      db
        .select({
          sucursalId: sucursales.sucursalId,
          sucursal: sucursales.sucursal,
          direccion: sucursales.direccion,
          telefono: sucursales.telefono,
          correo: sucursales.correo,
        })
        .from(sucursales),
    ]);

    // Map relations to facturas
    return results.map((factura) => ({
      ...factura,
      cliente: factura.cliente
        ? {
            ...factura.cliente,
            sucursal:
              clienteSucursales.find(
                (s) => s.sucursalId === factura.cliente!.sucursalId
              ) || null,
          }
        : null,
      trackings: allTrackings.filter((t) => t.facturaId === factura.facturaId),
      sucursal:
        allSucursales.find((s) => s.sucursalId === factura.sucursalId) || null,
    }));
  }

  /**
   * Get statistics for a date range
   */
  async getStats(options: {
    startDate: Date;
    endDate: Date;
    sucursalId?: number;
  }) {
    const { startDate, endDate, sucursalId } = options;

    const conditions = [between(facturas.createdAt, startDate, endDate)];

    if (sucursalId) {
      conditions.push(eq(facturas.sucursalId, sucursalId));
    }

    const baseStatsQuery = {
      total: sql<number>`SUM(CASE WHEN ${facturas.pagado} = true THEN ${facturas.total} ELSE 0 END)`,
      count: sql<number>`COUNT(*)`,
      pagados: sql<number>`SUM(CASE WHEN ${facturas.pagado} = true THEN 1 ELSE 0 END)`,
      pendientes: sql<number>`SUM(CASE WHEN ${facturas.pagado} = false THEN 1 ELSE 0 END)`,
    };

    const results = await db
      .select(baseStatsQuery)
      .from(facturas)
      .where(and(...conditions));

    return results[0];
  }
}

// Export singleton instance
export const facturasService = new FacturasService();
