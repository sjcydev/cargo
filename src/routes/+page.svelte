<!-- Dashboard using Svelte 5 runes and shadcn-svelte components -->
<script lang="ts">
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
  } from "$lib/components/ui/select";
  import DateRangePicker from "$lib/components/ui/date-range-picker.svelte";
  import {
    CalendarDate,
    endOfMonth,
    getLocalTimeZone,
    startOfMonth,
    today,
  } from "@internationalized/date";
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import type { DateRange } from "bits-ui";
  import type { ApexOptions } from "apexcharts";
  import type { DashboardStats } from "$lib/types/dashboard";
  import {
    revenueChartConfig,
    customerChartConfig,
    shipmentChartConfig,
  } from "$lib/config/charts";
  import InnerLayout from "$lib/components/inner-layout.svelte";

  // Props from server
  let { data } = $props();

  // State management with runes
  let selectedSucursal = $state("all");
  let dateRange = $state<DateRange>({
    start: startOfMonth(today(getLocalTimeZone())),
    end: endOfMonth(today(getLocalTimeZone())),
  });

  let stats: DashboardStats = $state({
    monthlyStats: {
      total: 0,
      count: 0,
      pagados: 0,
      pendientes: 0,
      metodoPago: {},
      dailyRevenue: [],
      growth: {
        current: 0,
        previous: 0,
        growthPercentage: "0",
      },
    },
    shipmentStats: {
      count: 0,
      not_enviado: 0,
      pending_payment_or_pickup: 0,
      completed: 0,
      growth: {
        current: 0,
        previous: 0,
        growthPercentage: "0",
      },
    },
    customerStats: {
      total: 0,
      dailyGrowth: [],
      growth: {
        current: 0,
        previous: 0,
        growthPercentage: "0",
      },
    },
  });

  // Chart instances
  let ApexCharts: any;
  let revenueChart: any = null;
  let shipmentChart: any = null;
  let customerChart: any = null;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PA", {
      style: "currency",
      currency: "USD",
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Update charts with new data
  function updateCharts() {
    if (!browser || !ApexCharts) return;

    // Update Revenue Chart
    const revenueData = stats.monthlyStats.dailyRevenue || [];
    if (revenueChart) {
      revenueChart.updateOptions(
        {
          series: [
            {
              name: "Revenue",
              data: revenueData.map((d) => d.total),
            },
          ],
          xaxis: {
            categories: revenueData.map((d) => d.date),
          },
        },
        true
      );
    }

    // Update Shipment Chart
    if (shipmentChart) {
      shipmentChart.updateSeries([
        {
          name: "",
          data: [
            stats.shipmentStats.not_enviado || 0,
            stats.shipmentStats.pending_payment_or_pickup || 0,
            stats.shipmentStats.completed || 0,
          ],
        },
      ]);
    }

    // Update Customer Chart
    const customerData = stats.customerStats.dailyGrowth || [];
    if (customerChart) {
      customerChart.updateOptions(
        {
          series: [
            {
              name: "New Customers",
              data: customerData.map((d) => d.new_customers),
            },
          ],
          xaxis: {
            categories: customerData.map((d) => d.date),
          },
        },
        true
      );
    }
  }

  // Fetch updated stats
  async function fetchStats() {
    try {
      const response = await fetch("/api/dashboard/stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sucursalId: selectedSucursal,
          dateRange,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      const newStats: DashboardStats = await response.json();
      stats = newStats;
      updateCharts();
    } catch (error) {
      console.error("Error fetching stats:", error);
      // TODO: Add proper error handling UI
    }
  }

  // Watch for changes in filters
  $effect(() => {
    if (browser && (selectedSucursal || dateRange)) {
      fetchStats();
    }
  });

  // Initialize charts
  onMount(async () => {
    if (!browser) return;

    try {
      const ApexChartsModule = await import("apexcharts");
      ApexCharts = ApexChartsModule.default || ApexChartsModule;

      // Revenue Chart
      const revenueData = stats.monthlyStats.dailyRevenue || [];
      revenueChart = new ApexCharts(document.querySelector("#revenue-chart"), {
        ...revenueChartConfig,
        series: [
          {
            name: "Revenue",
            data: revenueData.map((d) => d.total),
          },
        ],
        xaxis: {
          ...revenueChartConfig.xaxis,
          categories: revenueData.map((d) => d.date),
        },
      });
      revenueChart.render();

      // Customer Chart
      const customerData = stats.customerStats.dailyGrowth || [];
      customerChart = new ApexCharts(
        document.querySelector("#customer-chart"),
        {
          ...customerChartConfig,
          series: [
            {
              name: "New Customers",
              data: customerData.map((d) => d.new_customers),
            },
          ],
          xaxis: {
            ...customerChartConfig.xaxis,
            categories: customerData.map((d) => d.date),
          },
        }
      );
      customerChart.render();

      // Shipment Chart
      shipmentChart = new ApexCharts(
        document.querySelector("#shipment-chart"),
        {
          ...shipmentChartConfig,
          series: [
            {
              name: "",
              data: [
                stats.shipmentStats.not_enviado || 0,
                stats.shipmentStats.pending_payment_or_pickup || 0,
                stats.shipmentStats.completed || 0,
              ],
            },
          ],
        }
      );
      shipmentChart.render();
    } catch (error) {
      console.error("Error initializing charts:", error);
      // TODO: Add proper error handling UI
    }
  });

  // Cleanup on component destroy
  onDestroy(() => {
    if (!browser) return;

    revenueChart?.destroy();
    shipmentChart?.destroy();
    customerChart?.destroy();
  });
</script>

<svelte:head>
  <title>Dashboard</title>
</svelte:head>

{#snippet actions()}
  <div class="flex gap-4">
    <Select type="single" bind:value={selectedSucursal}>
      <SelectTrigger class="w-[180px]">
        <div class="flex items-center justify-between">
          {#if selectedSucursal === "all"}
            <span>Todas las sucursales</span>
          {:else if selectedSucursal && data.sucursales}
            <span>
              {data.sucursales.find(
                (s) => s?.sucursalId?.toString() === selectedSucursal
              )?.sucursal ?? "Elige una sucursal"}
            </span>
          {:else}
            <span>Elige una sucursal</span>
          {/if}
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas las sucursales</SelectItem>
        {#if data.sucursales}
          {#each data.sucursales as sucursal}
            {#if sucursal}
              <SelectItem value={sucursal.sucursalId.toString()}>
                {sucursal.sucursal}
              </SelectItem>
            {/if}
          {/each}
        {/if}
      </SelectContent>
    </Select>

    <DateRangePicker bind:value={dateRange} />
  </div>
{/snippet}

<InnerLayout title={"Dashboard"} {actions}>
  <div class="container mx-auto p-4 space-y-4">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Revenue Card -->
      <Card>
        <CardHeader>
          <CardTitle>Ingresos Totales</CardTitle>
          <CardDescription
            class={parseInt(stats.monthlyStats.growth.growthPercentage) >= 0
              ? "text-green-600"
              : "text-red-600"}
          >
            <span class="inline-block">
              {parseInt(stats.monthlyStats.growth.growthPercentage) >= 0
                ? "+"
                : ""}
              {stats.monthlyStats.growth.growthPercentage} del periodo anterior
            </span>
            <span class="ml-1">
              {parseInt(stats.monthlyStats.growth.growthPercentage) >= 0
                ? "↑"
                : "↓"}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {formatCurrency(stats.monthlyStats.total)}
          </div>
        </CardContent>
      </Card>

      <!-- Invoices Card -->
      <Card>
        <CardHeader>
          <CardTitle>Facturas Totales</CardTitle>
          <CardDescription>
            <span class="text-green-600"
              >{stats.monthlyStats.pagados} pagadas</span
            >,
            <span class="text-amber-600"
              >{stats.monthlyStats.pendientes} pendientes</span
            >
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{stats.monthlyStats.count}</div>
        </CardContent>
      </Card>

      <!-- Trackings Card -->
      <Card>
        <CardHeader>
          <CardTitle>Paquetes Registrados</CardTitle>
          <CardDescription
            class={parseInt(stats.shipmentStats.growth.growthPercentage) >= 0
              ? "text-green-600"
              : "text-red-600"}
          >
            <span class="inline-block">
              {parseInt(stats.shipmentStats.growth.growthPercentage) >= 0
                ? "+"
                : ""}
              {stats.shipmentStats.growth.growthPercentage} del periodo anterior
            </span>
            <span class="ml-1">
              {parseInt(stats.shipmentStats.growth.growthPercentage) >= 0
                ? "↑"
                : "↓"}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{stats.shipmentStats.count}</div>
        </CardContent>
      </Card>

      <!-- Customers Card -->
      <Card>
        <CardHeader>
          <CardTitle>Clientes Registrados</CardTitle>
          <CardDescription
            class={parseInt(stats.customerStats.growth.growthPercentage) >= 0
              ? "text-green-600"
              : "text-red-600"}
          >
            <span class="inline-block">
              {parseInt(stats.customerStats.growth.growthPercentage) >= 0
                ? "+"
                : ""}
              {stats.customerStats.growth.growthPercentage} del periodo anterior
            </span>
            <span class="ml-1">
              {parseInt(stats.customerStats.growth.growthPercentage) >= 0
                ? "↑"
                : "↓"}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{stats.customerStats.total}</div>
        </CardContent>
      </Card>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Revenue Analytics -->
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Ingresos</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="revenue-chart"></div>
        </CardContent>
      </Card>

      <!-- Shipment Status -->
      <Card>
        <CardHeader>
          <CardTitle>Estado de Facturas</CardTitle>
        </CardHeader>
        <CardContent class="h-[300px]">
          <div id="shipment-chart" class="w-full h-full"></div>
        </CardContent>
      </Card>
    </div>

    <!-- Customer Growth -->
    <Card>
      <CardHeader>
        <CardTitle>Crecimiento de Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div id="customer-chart"></div>
      </CardContent>
    </Card>
  </div>
</InnerLayout>
