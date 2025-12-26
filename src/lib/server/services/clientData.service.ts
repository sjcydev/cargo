/**
 * Client Data Service
 * Provides data for client portal including packages, invoices, and dashboard stats
 * All queries are scoped to the authenticated client for security
 */

import { db } from '$lib/server/db';
import { trackings, facturas, usuarios } from '$lib/server/db/schema';
import { eq, and, desc, inArray, count, sum } from 'drizzle-orm';
import { logger } from '$lib/server/logger';

class ClientDataService {
  /**
   * Get dashboard summary for a client
   * Returns package counts and outstanding balance
   */
  async getClientSummary(clientId: number) {
    // Get all facturas for this client
    const clientFacturas = await db.query.facturas.findMany({
      where: and(
        eq(facturas.clienteId, clientId),
        eq(facturas.cancelada, false)
      ),
      columns: { facturaId: true, metodoDePago: true }
    });

    const facturaIds = clientFacturas.map(f => f.facturaId);

    if (facturaIds.length === 0) {
      return {
        totalPackages: 0,
        availablePackages: 0,
        pickedUpPackages: 0,
        totalDue: 0
      };
    }

    // Get all trackings for these facturas
    const [allTrackings, unpaidFacturas, unpaidTrackings] = await Promise.all([
      // Get all trackings
      db.query.trackings.findMany({
        where: and(
          inArray(trackings.facturaId, facturaIds),
          eq(trackings.cancelada, false)
        ),
        columns: { retirado: true }
      }),

      // Get unpaid facturas
      db.query.facturas.findMany({
        where: and(
          eq(facturas.clienteId, clientId),
          eq(facturas.cancelada, false),
          eq(facturas.metodoDePago, 'no_pagado')
        ),
        columns: { facturaId: true }
      }),

      // Get trackings for unpaid facturas
      db
        .select({
          facturaId: trackings.facturaId,
          precio: trackings.precio
        })
        .from(trackings)
        .innerJoin(facturas, eq(trackings.facturaId, facturas.facturaId))
        .where(
          and(
            eq(facturas.clienteId, clientId),
            eq(facturas.cancelada, false),
            eq(facturas.metodoDePago, 'no_pagado'),
            eq(trackings.cancelada, false)
          )
        )
    ]);

    // Count packages
    const totalPackages = allTrackings.length;
    const pickedUpPackages = allTrackings.filter(t => t.retirado).length;
    const availablePackages = totalPackages - pickedUpPackages;

    // Calculate outstanding balance from unpaid trackings
    const totalDue = unpaidTrackings.reduce((sum, t) => sum + Number(t.precio || 0), 0);

    return {
      totalPackages,
      availablePackages,
      pickedUpPackages,
      totalDue: Number(totalDue.toFixed(2))
    };
  }

  /**
   * Get recent activity for a client
   * Returns the most recent tracking updates
   */
  async getRecentActivity(clientId: number, limit = 5) {
    // Get client's facturas
    const clientFacturas = await db.query.facturas.findMany({
      where: and(
        eq(facturas.clienteId, clientId),
        eq(facturas.cancelada, false)
      ),
      columns: { facturaId: true }
    });

    const facturaIds = clientFacturas.map(f => f.facturaId);

    if (facturaIds.length === 0) {
      return [];
    }

    // Get recent trackings ordered by update time
    const recentTrackings = await db.query.trackings.findMany({
      where: and(
        inArray(trackings.facturaId, facturaIds),
        eq(trackings.cancelada, false)
      ),
      orderBy: [desc(trackings.updatedAt)],
      limit,
      columns: {
        trackingId: true,
        numeroTracking: true,
        peso: true,
        precio: true,
        retirado: true,
        updatedAt: true
      }
    });

    return recentTrackings.map(t => ({
      id: t.trackingId,
      tracking: t.numeroTracking || 'N/A',
      weight: t.peso,
      price: t.precio,
      updatedAt: t.updatedAt,
      pickedUp: t.retirado
    }));
  }

  /**
   * Get all packages for a client
   * @param clientId - Usuario ID
   * @param filter - 'active' | 'history' | 'all'
   */
  async getClientPackages(clientId: number, filter: 'active' | 'history' | 'all' = 'active') {
    // Get client's facturas
    const clientFacturas = await db.query.facturas.findMany({
      where: and(
        eq(facturas.clienteId, clientId),
        eq(facturas.cancelada, false)
      ),
      columns: { facturaId: true }
    });

    const facturaIds = clientFacturas.map(f => f.facturaId);

    if (facturaIds.length === 0) {
      return [];
    }

    // Build where clause based on filter
    const conditions = [
      inArray(trackings.facturaId, facturaIds),
      eq(trackings.cancelada, false)
    ];

    if (filter === 'active') {
      conditions.push(eq(trackings.retirado, false));
    } else if (filter === 'history') {
      conditions.push(eq(trackings.retirado, true));
    }

    // Get trackings
    const packages = await db.query.trackings.findMany({
      where: and(...conditions),
      orderBy: [desc(trackings.createdAt)],
      columns: {
        trackingId: true,
        numeroTracking: true,
        peso: true,
        base: true,
        precio: true,
        retirado: true,
        retiradoAt: true,
        createdAt: true,
        updatedAt: true,
        facturaId: true
      }
    });

    return packages.map(p => ({
      id: p.trackingId,
      tracking: p.numeroTracking || 'N/A',
      weight: p.peso,
      basePrice: p.base,
      price: p.precio,
      pickedUp: p.retirado,
      pickedUpAt: p.retiradoAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      facturaId: p.facturaId
    }));
  }

  /**
   * Get package detail by ID (with authorization check)
   */
  async getPackageDetail(packageId: number, clientId: number) {
    // Get tracking with factura to verify ownership - use manual join for MariaDB compatibility
    const result = await db
      .select({
        trackingId: trackings.trackingId,
        numeroTracking: trackings.numeroTracking,
        peso: trackings.peso,
        base: trackings.base,
        precio: trackings.precio,
        retirado: trackings.retirado,
        retiradoAt: trackings.retiradoAt,
        createdAt: trackings.createdAt,
        updatedAt: trackings.updatedAt,
        facturaData: {
          clienteId: facturas.clienteId,
          facturaId: facturas.facturaId,
          fecha: facturas.fecha
        }
      })
      .from(trackings)
      .innerJoin(facturas, eq(trackings.facturaId, facturas.facturaId))
      .where(eq(trackings.trackingId, packageId))
      .limit(1);

    if (!result.length || !result[0]) {
      logger.warn('Package not found', { packageId });
      return null;
    }

    const tracking = result[0];

    // Authorization check
    if (tracking.facturaData.clienteId !== clientId) {
      logger.warn('Unauthorized package access attempt', { packageId, clientId });
      return null;
    }

    return {
      id: tracking.trackingId,
      tracking: tracking.numeroTracking || 'N/A',
      weight: tracking.peso,
      basePrice: tracking.base,
      price: tracking.precio,
      pickedUp: tracking.retirado,
      pickedUpAt: tracking.retiradoAt,
      createdAt: tracking.createdAt,
      updatedAt: tracking.updatedAt,
      facturaId: tracking.facturaData.facturaId,
      invoiceDate: tracking.facturaData.fecha
    };
  }

  /**
   * Get all invoices for a client
   */
  async getClientInvoices(clientId: number) {
    // Get invoices and trackings separately for MariaDB compatibility
    const [invoices, allTrackings] = await Promise.all([
      db.query.facturas.findMany({
        where: and(
          eq(facturas.clienteId, clientId),
          eq(facturas.cancelada, false)
        ),
        orderBy: [desc(facturas.createdAt)]
      }),

      db
        .select({
          facturaId: trackings.facturaId,
          precio: trackings.precio,
          retirado: trackings.retirado
        })
        .from(trackings)
        .innerJoin(facturas, eq(trackings.facturaId, facturas.facturaId))
        .where(
          and(
            eq(facturas.clienteId, clientId),
            eq(facturas.cancelada, false),
            eq(trackings.cancelada, false)
          )
        )
    ]);

    // Group trackings by facturaId
    const trackingsByFactura = allTrackings.reduce((acc, t) => {
      if (!acc[t.facturaId]) acc[t.facturaId] = [];
      acc[t.facturaId].push(t);
      return acc;
    }, {} as Record<number, typeof allTrackings>);

    return invoices.map(factura => {
      const facturaTrackings = trackingsByFactura[factura.facturaId] || [];
      const total = facturaTrackings.reduce((sum, t) => sum + Number(t.precio || 0), 0);
      const allPickedUp = facturaTrackings.length > 0 && facturaTrackings.every(t => t.retirado);

      return {
        id: factura.facturaId,
        date: factura.createdAt!,
        total: Number(total.toFixed(2)),
        paid: factura.pagado!,
        paymentMethod: factura.metodoDePago,
        pickedUp: allPickedUp,
        packageCount: facturaTrackings.length,
        createdAt: factura.createdAt
      };
    });
  }

  /**
   * Get invoice detail by factura ID (with authorization check)
   */
  async getInvoiceDetail(facturaId: number, clientId: number) {
    // Get factura and trackings separately for MariaDB compatibility
    const [facturaResult, facturaTrackings] = await Promise.all([
      db.query.facturas.findFirst({
        where: and(
          eq(facturas.facturaId, facturaId),
          eq(facturas.cancelada, false)
        )
      }),

      db.query.trackings.findMany({
        where: and(
          eq(trackings.facturaId, facturaId),
          eq(trackings.cancelada, false)
        )
      })
    ]);

    if (!facturaResult) {
      return null;
    }

    // Authorization check
    if (facturaResult.clienteId !== clientId) {
      logger.warn('Unauthorized invoice access attempt', { facturaId, clientId });
      return null;
    }

    const total = facturaTrackings.reduce((sum, t) => sum + Number(t.precio || 0), 0);

    return {
      id: facturaResult.facturaId,
      date: facturaResult.createdAt!,
      paid: facturaResult.pagado!,
      paymentMethod: facturaResult.metodoDePago,
      paidAt: facturaResult.pagadoAt,
      total: Number(total.toFixed(2)),
      allPickedUp: facturaResult.retirados,
      packages: facturaTrackings.map(t => ({
        id: t.trackingId,
        tracking: t.numeroTracking || 'N/A',
        weight: t.peso,
        basePrice: t.base,
        price: Number(t.precio || 0),
        pickedUp: t.retirado,
        pickedUpAt: t.retiradoAt
      }))
    };
  }
}

export const clientDataService = new ClientDataService();
