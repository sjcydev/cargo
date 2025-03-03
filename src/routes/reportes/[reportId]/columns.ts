import type { ColumnDef } from "@tanstack/table-core";
import { createColumnHelper } from "@tanstack/table-core";
import type { Facturas } from "$lib/server/db/schema";
import { renderComponent } from "$lib/components/ui/data-table";
import DataSortableButton from "$lib/components/data-sortable-button.svelte";

const columnHelper = createColumnHelper<Facturas>();

export const columns: ColumnDef<Facturas>[] = [
  {
    accessorFn: (row) => row.facturaId,
    accessorKey: "facturaId",
    id: "facturaId",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        label: "Factura Nº",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),

    enableHiding: false,
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
    accessorFn: (row) => row.metodoDePago,
    accessorKey: "metodoDePago",
    id: "Metodo De Pago",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        label: "Método de Pago",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
    cell: ({ row }) => {
      const method = row.original.metodoDePago;
      return method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
    },
  },
  {
    accessorFn: (row) => row.pagado,
    accessorKey: "pagado",
    id: "estado",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        label: "Estado",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
    cell: ({ row }) => (row.original.pagado ? "Pagado" : "Pendiente"),
  },
  {
    accessorFn: (row) => row.pagadoAt,
    accessorKey: "pagadoAt",
    id: "fechaPago",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        label: "Fecha de Pago",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
    cell: ({ row }) => {
      const date = row.original.pagadoAt;
      return date
        ? new Date(date).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "";
    },
  },
];
