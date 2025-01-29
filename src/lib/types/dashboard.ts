import type { DateRange } from "bits-ui";

export type GrowthStats = {
  current: number;
  previous: number;
  growthPercentage: number;
};

export type DailyRevenue = {
  date: string;
  total: number;
};

export type MonthlyStats = {
  total: number;
  count: number;
  pagados: number;
  pendientes: number;
  metodoPago: Record<string, number>;
  dailyRevenue: DailyRevenue[];
  growth: GrowthStats;
};

export type CustomerStats = {
  total: number;
  dailyGrowth: {
    date: string;
    new_customers: number;
    total_customers: number;
  }[];
  growth: GrowthStats;
};

export type ShipmentStats = {
  count: number;
  not_enviado: number;
  pending_payment_or_pickup: number;
  completed: number;
  growth: GrowthStats;
};

export type DashboardStats = {
  monthlyStats: MonthlyStats;
  shipmentStats: ShipmentStats;
  customerStats: CustomerStats;
};

export type DashboardFilters = {
  sucursalId: string;
  dateRange: DateRange;
};
