import { db } from "$lib/server/db";
import {
  facturas,
  trackings,
  usuarios,
  sucursales,
} from "$lib/server/db/schema";
import { and, between, eq, sql } from "drizzle-orm";
import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { CalendarDate, today } from "@internationalized/date";

type DailyRevenue = {
  date: string;
  total: number;
};

type MonthlyStats = {
  total: number;
  count: number;
  pagados: number;
  pendientes: number;
  metodoPago: Record<string, number>;
  dailyRevenue: DailyRevenue[];
  growth: {
    current: number;
    previous: number;
    growthPercentage: number;
  };
};

type ShipmentStats = {
  total_peso: number;
  total_precio: number;
  count: number;
  retirados: number;
  pendientes: number;
};

type CustomerStats = {
  total: number;
  dailyGrowth: {
    date: string;
    new_customers: number;
    total_customers: number;
  }[];
};

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user || locals.user.rol !== "ADMIN") {
    throw redirect(302, "/admin/clientes");
  }

  const now = today("America/Panama");
  const startDate = new CalendarDate(now.year, now.month, 1).toDate(
    "America/Panama"
  );
  const endDate = new CalendarDate(now.year, now.month + 1, 0).toDate(
    "America/Panama"
  );

  const getSucursales = async (): Promise<any[]> => {
    return await db.select().from(sucursales);
  };

  const getMonthlyStats = async (): Promise<MonthlyStats> => {
    // First query for basic stats
    const baseStatsQuery = {
      total: sql<number>`SUM(CASE WHEN ${facturas.pagado} = true THEN ${facturas.total} ELSE 0 END)`,
      count: sql<number>`COUNT(*)`,
      pagados: sql<number>`SUM(CASE WHEN ${facturas.pagado} = true THEN 1 ELSE 0 END)`,
      pendientes: sql<number>`SUM(CASE WHEN ${facturas.pagado} = false THEN 1 ELSE 0 END)`,
    };

    // Query for daily revenue
    const dailyRevenueQuery = {
      date: sql<string>`DATE(${facturas.pagadoAt})`,
      total: sql<number>`SUM(CASE WHEN ${facturas.pagado} = true THEN ${facturas.total} ELSE 0 END)`,
    };

    const baseStats = await db
      .select(baseStatsQuery)
      .from(facturas)
      .where(between(facturas.createdAt, startDate, endDate));

    const dailyRevenue = await db
      .select(dailyRevenueQuery)
      .from(facturas)
      .where(between(facturas.pagadoAt, startDate, endDate))
      .groupBy(sql`DATE(${facturas.pagadoAt})`)
      .orderBy(sql`DATE(${facturas.pagadoAt})`);

    // Calculate growth comparing current month's paid invoices with previous month
    const previousStartDate = new CalendarDate(
      now.year,
      now.month - 1,
      1
    ).toDate("America/Panama");
    const previousEndDate = new CalendarDate(now.year, now.month, 0).toDate(
      "America/Panama"
    );

    const previousMonthStats = await db
      .select({
        total: sql<number>`SUM(CASE WHEN ${facturas.pagado} = true THEN ${facturas.total} ELSE 0 END)`,
      })
      .from(facturas)
      .where(between(facturas.pagadoAt, previousStartDate, previousEndDate));

    const currentTotal = baseStats[0].total || 0;
    const previousTotal = previousMonthStats[0].total || 0;
    const growthPercentage =
      previousTotal === 0
        ? 100
        : ((currentTotal - previousTotal) / previousTotal) * 100;

    // Second query for payment methods
    const paymentMethodsQuery = {
      metodoPago: sql<string>`${facturas.metodoDePago}`,
      count: sql<number>`COUNT(*)`,
    };

    const paymentStats = await db
      .select(paymentMethodsQuery)
      .from(facturas)
      .where(
        and(
          between(facturas.pagadoAt, startDate, endDate),
          eq(facturas.pagado, true)
        )
      )
      .groupBy(facturas.metodoDePago);

    // Convert payment stats to object
    const metodoPagoObj = paymentStats.reduce((acc, { metodoPago, count }) => {
      acc[metodoPago || "no_pagado"] = count;
      return acc;
    }, {} as Record<string, number>);

    return {
      ...baseStats[0],
      metodoPago: metodoPagoObj,
      dailyRevenue: dailyRevenue.map((day) => ({
        date: day.date,
        total: day.total || 0,
      })),
      growth: {
        current: currentTotal,
        previous: previousTotal,
        growthPercentage,
      },
    };
  };

  const getShipmentStats = async (): Promise<ShipmentStats> => {
    const baseQuery = {
      total_peso: sql<number>`SUM(${trackings.peso})`,
      total_precio: sql<number>`SUM(${trackings.precio})`,
      count: sql<number>`COUNT(*)`,
      retirados: sql<number>`SUM(CASE WHEN ${trackings.retirado} = true THEN 1 ELSE 0 END)`,
      pendientes: sql<number>`SUM(CASE WHEN ${trackings.retirado} = false THEN 1 ELSE 0 END)`,
    };

    const result = await db
      .select(baseQuery)
      .from(trackings)
      .where(between(trackings.createdAt, startDate, endDate));

    return result[0];
  };

  const getCustomerStats = async (): Promise<CustomerStats> => {
    // Query for daily customer growth
    const dailyCustomersQuery = {
      date: sql<string>`DATE(${usuarios.createdAt})`,
      new_customers: sql<number>`COUNT(*)`,
      cumulative_total: sql<number>`SUM(COUNT(*)) OVER (ORDER BY DATE(${usuarios.createdAt}))`,
    };

    const dailyCustomers = await db
      .select(dailyCustomersQuery)
      .from(usuarios)
      .where(between(usuarios.createdAt, startDate, endDate))
      .groupBy(sql`DATE(${usuarios.createdAt})`)
      .orderBy(sql`DATE(${usuarios.createdAt})`);

    // Get total customers
    const totalQuery = {
      total: sql<number>`COUNT(*)`,
    };

    const totalResult = await db.select(totalQuery).from(usuarios);

    return {
      total: totalResult[0].total,
      dailyGrowth: dailyCustomers.map((day) => ({
        date: day.date,
        new_customers: day.new_customers,
        total_customers: day.cumulative_total,
      })),
    };
  };

  return {
    sucursales: await getSucursales(),
    monthlyStats: await getMonthlyStats(),
    shipmentStats: await getShipmentStats(),
    customerStats: await getCustomerStats(),
  };
};
