import type { ColumnDef } from "@tanstack/table-core";
import { createColumnHelper } from "@tanstack/table-core";
import type { Reportes } from "$lib/server/db/schema";
import { renderComponent } from "$lib/components/ui/data-table";
import DataSortableButton from "$lib/components/data-sortable-button.svelte";
import DataTableActions from "./data-table-actions.svelte";

const columnHelper = createColumnHelper<Reportes>();

export const columns = (user: { rol: string }): ColumnDef<Reportes>[] => [
  {
    accessorFn: (row) => row.reporteId,
    accessorKey: "reporteId",
    id: "reporteId",
    header: () => "Reporte N°",
    cell: ({ row }) => row.getValue("reporteId"),
  },
  {
    accessorFn: (row) => row.fechaInicial,
    accessorKey: "fechaInicial",
    id: "fechaInicial",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        label: "Fecha Inicial",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
    cell: ({ row }) => {
      const date = new Date(row.getValue("fechaInicial"));
      return date.toLocaleDateString();
    },
  },
  {
    accessorFn: (row) => row.fechaFinal,
    accessorKey: "fechaFinal",
    id: "fechaFinal",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        label: "Fecha Final",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
    cell: ({ row }) => {
      const date = new Date(row.getValue("fechaFinal"));
      return date.toLocaleDateString();
    },
  },
  {
    accessorFn: (row) => row.facturas,
    accessorKey: "facturas",
    id: "facturas",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        label: "Facturas",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
  },
  {
    accessorFn: (row) => row.total,
    accessorKey: "total",
    id: "total",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        label: "Total",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
    cell: ({ row }) => {
      const total = row.original.total!;
      return new Intl.NumberFormat("es-PA", {
        style: "currency",
        currency: "USD",
        currencyDisplay: "narrowSymbol",
        currencySign: "standard",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(total);
    },
  },
  {
    id: "actions",
    cell: ({ row }) =>
      renderComponent(DataTableActions, {
        reporte: row.original,
        user,
      }),
    enableHiding: false,
  },
];
