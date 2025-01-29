import { db } from "$lib/server/db";
import { facturas, trackings, usuarios } from "$lib/server/db/schema";
import { and, between, eq, sql } from "drizzle-orm";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import type { DateRange } from "bits-ui";

// Types
interface DailyRevenue {
  date: string;
  total: number;
}

interface GrowthStats {
  current: number;
  previous: number;
  growthPercentage: number;
}

interface MonthlyStats {
  total: number;
  count: number;
  pagados: number;
  pendientes: number;
  metodoPago: Record<string, number>;
  dailyRevenue: DailyRevenue[];
  growth: GrowthStats;
}

interface ShipmentStats {
  count: number;
  not_enviado: number;
  pending_payment_or_pickup: number;
  completed: number;
  growth: GrowthStats;
}

interface CustomerStats {
  total: number;
  dailyGrowth: {
    date: string;
    new_customers: number;
    total_customers: number;
  }[];
  growth: GrowthStats;
}

// Utility functions
const calculateGrowthPercentage = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const createDateRange = (dateRange?: DateRange) => {
  const now = today(getLocalTimeZone());
  const defaultStart = new CalendarDate(now.year, now.month, 1);
  const defaultEnd = new CalendarDate(now.year, now.month + 1, 0);

  const start = dateRange?.start || defaultStart;
  const end = dateRange?.end || defaultEnd;

  const currentStart = new CalendarDate(
    start.year,
    start.month,
    start.day
  ).toDate(getLocalTimeZone());
  const currentEnd = new CalendarDate(end.year, end.month, end.day).toDate(
    getLocalTimeZone()
  );

  // Set time boundaries
  currentStart.setHours(0, 0, 0, 0);
  currentEnd.setHours(23, 59, 59, 999);

  // Calculate previous period
  const durationMs = currentEnd.getTime() - currentStart.getTime();
  const previousEnd = new Date(currentStart);
  previousEnd.setHours(23, 59, 59, 999);
  previousEnd.setMilliseconds(previousEnd.getMilliseconds() - 1);
  const previousStart = new Date(previousEnd.getTime() - durationMs);
  previousStart.setHours(0, 0, 0, 0);

  return { currentStart, currentEnd, previousStart, previousEnd };
};

const createWhereClause = (
  table: typeof facturas | typeof trackings | typeof usuarios,
  dateStart: Date,
  dateEnd: Date,
  sucursalId: string
) => {
  return sucursalId !== "all"
    ? and(
        between(table.createdAt, dateStart, dateEnd),
        eq(table.sucursalId, Number(sucursalId))
      )
    : between(table.createdAt, dateStart, dateEnd);
};

// Stats calculation functions
const getMonthlyStats = async (
  sucursalId: string,
  { currentStart, currentEnd, previousStart, previousEnd }: ReturnType<typeof createDateRange>
): Promise<MonthlyStats> => {
  const whereClause = createWhereClause(facturas, currentStart, currentEnd, sucursalId);
  const previousWhereClause = createWhereClause(facturas, previousStart, previousEnd, sucursalId);

  const baseStatsQuery = {
    total: sql<number>`SUM(${facturas.total})`,
    count: sql<number>`COUNT(*)`,
    pagados: sql<number>`SUM(CASE WHEN ${facturas.pagado} = true THEN 1 ELSE 0 END)`,
    pendientes: sql<number>`SUM(CASE WHEN ${facturas.pagado} = false THEN 1 ELSE 0 END)`,
  };

  const [currentStats, previousStats, dailyRevenue, paymentStats] = await Promise.all([
    db.select(baseStatsQuery).from(facturas).where(whereClause),
    db.select({ total: sql<number>`SUM(${facturas.total})` })
      .from(facturas)
      .where(previousWhereClause),
    db.select({
      date: sql<string>`DATE(${facturas.createdAt})`,
      total: sql<number>`SUM(${facturas.total})`,
    })
      .from(facturas)
      .where(whereClause)
      .groupBy(sql`DATE(${facturas.createdAt})`)
      .orderBy(sql`DATE(${facturas.createdAt})`),
    db.select({
      metodoPago: sql<string>`${facturas.metodoDePago}`,
      count: sql<number>`COUNT(*)`,
    })
      .from(facturas)
      .where(whereClause)
      .groupBy(facturas.metodoDePago),
  ]);

  const metodoPago = paymentStats.reduce((acc, { metodoPago, count }) => {
    acc[metodoPago || "no_pagado"] = count;
    return acc;
  }, {} as Record<string, number>);

  const currentTotal = currentStats[0].total || 0;
  const previousTotal = previousStats[0].total || 0;

  return {
    ...currentStats[0],
    metodoPago,
    dailyRevenue: dailyRevenue.map(day => ({
      date: day.date,
      total: day.total || 0,
    })),
    growth: {
      current: currentTotal,
      previous: previousTotal,
      growthPercentage: calculateGrowthPercentage(currentTotal, previousTotal),
    },
  };
};

const getShipmentStats = async (
  sucursalId: string,
  { currentStart, currentEnd, previousStart, previousEnd }: ReturnType<typeof createDateRange>
): Promise<ShipmentStats> => {
  const trackingWhereClause = createWhereClause(trackings, currentStart, currentEnd, sucursalId);
  const previousTrackingWhereClause = createWhereClause(trackings, previousStart, previousEnd, sucursalId);
  const invoiceWhereClause = createWhereClause(facturas, currentStart, currentEnd, sucursalId);

  const [currentTrackings, previousTrackings, invoiceStats] = await Promise.all([
    db.select({ count: sql<number>`COUNT(*)` })
      .from(trackings)
      .where(trackingWhereClause),
    db.select({ count: sql<number>`COUNT(*)` })
      .from(trackings)
      .where(previousTrackingWhereClause),
    db.select({
      not_enviado: sql<number>`SUM(CASE 
        WHEN ${facturas.enviado} = false OR ${facturas.enviado} IS NULL THEN 1 
        ELSE 0 
      END)`,
      pending_payment_or_pickup: sql<number>`SUM(CASE 
        WHEN ${facturas.enviado} = true 
        AND (${facturas.pagado} = false OR ${facturas.pagado} IS NULL OR NOT EXISTS (
          SELECT 1 FROM ${trackings} 
          WHERE ${trackings.facturaId} = ${facturas.facturaId} 
          AND ${trackings.retirado} = true
        )) THEN 1 
        ELSE 0 
      END)`,
      completed: sql<number>`SUM(CASE 
        WHEN ${facturas.enviado} = true 
        AND ${facturas.pagado} = true 
        AND EXISTS (
          SELECT 1 FROM ${trackings} 
          WHERE ${trackings.facturaId} = ${facturas.facturaId} 
          AND ${trackings.retirado} = true
        ) THEN 1 
        ELSE 0 
      END)`
    })
      .from(facturas)
      .where(invoiceWhereClause),
  ]);

  const currentCount = currentTrackings[0].count || 0;
  const previousCount = previousTrackings[0].count || 0;

  return {
    count: currentCount,
    not_enviado: invoiceStats[0].not_enviado || 0,
    pending_payment_or_pickup: invoiceStats[0].pending_payment_or_pickup || 0,
    completed: invoiceStats[0].completed || 0,
    growth: {
      current: currentCount,
      previous: previousCount,
      growthPercentage: calculateGrowthPercentage(currentCount, previousCount),
    },
  };
};

const getCustomerStats = async (
  sucursalId: string,
  { currentStart, currentEnd, previousStart, previousEnd }: ReturnType<typeof createDateRange>
): Promise<CustomerStats> => {
  const whereClause = createWhereClause(usuarios, currentStart, currentEnd, sucursalId);
  const previousWhereClause = createWhereClause(usuarios, previousStart, previousEnd, sucursalId);

  const [dailyCustomers, currentStats, previousStats] = await Promise.all([
    db.select({
      date: sql<string>`DATE(${usuarios.createdAt})`,
      new_customers: sql<number>`COUNT(*)`,
    })
      .from(usuarios)
      .where(whereClause)
      .groupBy(sql`DATE(${usuarios.createdAt})`)
      .orderBy(sql`DATE(${usuarios.createdAt})`),
    db.select({ total: sql<number>`COUNT(*)` })
      .from(usuarios)
      .where(whereClause),
    db.select({ total: sql<number>`COUNT(*)` })
      .from(usuarios)
      .where(previousWhereClause),
  ]);

  let runningTotal = 0;
  const dailyGrowth = dailyCustomers.map(day => {
    runningTotal += day.new_customers;
    return {
      date: day.date,
      new_customers: day.new_customers,
      total_customers: runningTotal,
    };
  });

  const currentTotal = currentStats[0].total || 0;
  const previousTotal = previousStats[0].total || 0;

  return {
    total: currentTotal,
    dailyGrowth,
    growth: {
      current: currentTotal,
      previous: previousTotal,
      growthPercentage: calculateGrowthPercentage(currentTotal, previousTotal),
    },
  };
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user || locals.user.rol !== "ADMIN") {
    return new Response("Unauthorized", { status: 403 });
  }

  const { sucursalId, dateRange } = await request.json();
  const dateRangeObj = createDateRange(dateRange);

  const [monthlyStats, shipmentStats, customerStats] = await Promise.all([
    getMonthlyStats(sucursalId, dateRangeObj),
    getShipmentStats(sucursalId, dateRangeObj),
    getCustomerStats(sucursalId, dateRangeObj),
  ]);

  return json({
    monthlyStats,
    shipmentStats,
    customerStats,
  });
};
