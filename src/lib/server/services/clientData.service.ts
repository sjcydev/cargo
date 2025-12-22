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
    const [allTrackings, unpaidFacturas] = await Promise.all([
      // Get all trackings
      db.query.trackings.findMany({
        where: and(
          inArray(trackings.facturaId, facturaIds),
          eq(trackings.cancelada, false)
        ),
        columns: { retirado: true }
      }),

      // Get unpaid facturas with their trackings for balance calculation
      db.query.facturas.findMany({
        where: and(
          eq(facturas.clienteId, clientId),
          eq(facturas.cancelada, false),
          eq(facturas.metodoDePago, 'no_pagado')
        ),
        with: {
          trackings: {
            where: eq(trackings.cancelada, false),
            columns: { precio: true }
          }
        }
      })
    ]);

    // Count packages
    const totalPackages = allTrackings.length;
    const pickedUpPackages = allTrackings.filter(t => t.retirado).length;
    const availablePackages = totalPackages - pickedUpPackages;

    // Calculate outstanding balance from unpaid facturas
    const totalDue = unpaidFacturas.reduce((sum, factura) => {
      const facturaTotal = factura.trackings.reduce((s, t) => s + Number(t.precio || 0), 0);
      return sum + facturaTotal;
    }, 0);

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
    // Get tracking with factura to verify ownership
    const tracking = await db.query.trackings.findFirst({
      where: eq(trackings.trackingId, packageId),
      with: {
        factura: {
          columns: { clienteId: true, facturaId: true, fecha: true }
        }
      }
    });

    if (!tracking) {
      logger.warn('Package not found', { packageId });
      return null;
    }

    // Authorization check
    if (tracking.factura.clienteId !== clientId) {
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
      facturaId: tracking.factura.facturaId,
      invoiceDate: tracking.factura.fecha
    };
  }

  /**
   * Get all invoices for a client
   */
  async getClientInvoices(clientId: number) {
    const invoices = await db.query.facturas.findMany({
      where: and(
        eq(facturas.clienteId, clientId),
        eq(facturas.cancelada, false)
      ),
      orderBy: [desc(facturas.createdAt)],
      with: {
        trackings: {
          where: eq(trackings.cancelada, false),
          columns: {
            precio: true,
            retirado: true
          }
        }
      }
    });

    return invoices.map(factura => {
      const total = factura.trackings.reduce((sum, t) => sum + Number(t.precio || 0), 0);
      const allPickedUp = factura.trackings.length > 0 && factura.trackings.every(t => t.retirado);

      return {
        id: factura.facturaId,
        date: factura.fecha,
        total: Number(total.toFixed(2)),
        paid: factura.metodoDePago !== 'no_pagado',
        paymentMethod: factura.metodoDePago,
        pickedUp: allPickedUp,
        packageCount: factura.trackings.length,
        createdAt: factura.createdAt
      };
    });
  }

  /**
   * Get invoice detail by factura ID (with authorization check)
   */
  async getInvoiceDetail(facturaId: number, clientId: number) {
    const factura = await db.query.facturas.findFirst({
      where: and(
        eq(facturas.facturaId, facturaId),
        eq(facturas.cancelada, false)
      ),
      with: {
        trackings: {
          where: eq(trackings.cancelada, false)
        }
      }
    });

    if (!factura) {
      return null;
    }

    // Authorization check
    if (factura.clienteId !== clientId) {
      logger.warn('Unauthorized invoice access attempt', { facturaId, clientId });
      return null;
    }

    const total = factura.trackings.reduce((sum, t) => sum + Number(t.precio || 0), 0);

    return {
      id: factura.facturaId,
      date: factura.createdAt!,
      paid: factura.pagado!,
      paymentMethod: factura.metodoDePago,
      paidAt: factura.pagadoAt,
      total: Number(total.toFixed(2)),
      allPickedUp: factura.retirados,
      packages: factura.trackings.map(t => ({
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
