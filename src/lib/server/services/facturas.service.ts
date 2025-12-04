/**
 * Facturas Service
 * Centralizes all database operations related to facturas (invoices)
 * Ensures consistent sucursalId filtering and transaction handling
 */

import { db } from "$lib/server/db";
import { facturas, trackings, usuarios, sucursales } from "$lib/server/db/schema";
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

    return await db.query.facturas.findFirst({
      where: and(...conditions),
      with: {
        cliente: {
          with: {
            sucursal: true,
          },
        },
        trackings: true,
        sucursal: true,
        empleado: true,
      },
    });
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
    const { limit = 100, cursor, sucursalId, enviado, pagado } = options;

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

    const results = await db
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
        },
      })
      .from(facturas)
      .where(and(...conditions))
      .leftJoin(usuarios, eq(facturas.clienteId, usuarios.id))
      .leftJoin(sucursales, eq(facturas.sucursalId, sucursales.sucursalId))
      .orderBy(desc(facturas.facturaId))
      .limit(limit);

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

    return await db.query.facturas.findMany({
      where: and(...conditions),
      with: {
        cliente: {
          with: {
            sucursal: true,
          },
        },
        trackings: true,
      },
      orderBy: desc(facturas.facturaId),
    });
  }

  /**
   * Get multiple facturas by IDs
   */
  async getByIds(facturaIds: number[], sucursalId?: number) {
    const conditions = [
      sql`${facturas.facturaId} IN (${sql.join(facturaIds.map((id) => sql`${id}`), sql`, `)})`,
      eq(facturas.cancelada, false),
    ];

    if (sucursalId) {
      conditions.push(eq(facturas.sucursalId, sucursalId));
    }

    return await db.query.facturas.findMany({
      where: and(...conditions),
      with: {
        cliente: {
          with: {
            sucursal: true,
          },
        },
        trackings: true,
        sucursal: true,
      },
    });
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
