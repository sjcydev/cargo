import type { ColumnDef } from "@tanstack/table-core";
import { createColumnHelper } from "@tanstack/table-core";
import type { FacturasWithCliente } from "$lib/server/db/schema";
import { renderComponent } from "$lib/components/ui/data-table";
import DataTableActions from "./data-table-actions.svelte";
import DataSortableButton from "$lib/components/data-sortable-button.svelte";
import Estado from "$lib/facturacion/facturas/estado.svelte";
import Checkbox from "$lib/components/data-table-checkbox.svelte";

const columnHelper = createColumnHelper<FacturasWithCliente>();

export const columns: ColumnDef<FacturasWithCliente>[] = [
  {
    id: "select",
    header: ({ table }) =>
      renderComponent(Checkbox, {
        checked: table.getIsAllPageRowsSelected(),
        indeterminate:
          table.getIsSomePageRowsSelected() &&
          !table.getIsAllPageRowsSelected(),
        onCheckedChange: (value: boolean) => table.toggleAllPageRowsSelected(!!value),
        "aria-label": "Select all",
      }),
    cell: ({ row }) =>
      renderComponent(Checkbox, {
        checked: row.getIsSelected(),
        onCheckedChange: (value: boolean) => row.toggleSelected(!!value),
        "aria-label": "Select row",
      }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorFn: (row) => row.fecha,
    accessorKey: "fecha",
    id: "fecha",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        label: "Fecha",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
  },
  {
    accessorFn: (row) => row.facturaId,
    accessorKey: "facturaId",
    id: "facturaId",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        label: "Factura",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
    enableHiding: false,
  },
  {
    accessorFn: (row) => row.total,
    accessorKey: "total",
    id: "total",
    header: "Total",
    cell: ({ row }) => `$${row.original.total!.toFixed(2)}`,
    enableGlobalFilter: false,
  },
  columnHelper.display({
    id: "enviado",
    header: "Enviado",
    cell: ({ row }) => {
      return renderComponent(Estado, {
        variant: row.original.enviado ? "success" : "destructive",
      });
    },
    enableGlobalFilter: false,
  }),
  columnHelper.display({
    id: "pagado",
    header: "Pagado",
    cell: ({ row }) => {
      return renderComponent(Estado, {
        variant: row.original.pagado ? "success" : "destructive",
      });
    },
    enableGlobalFilter: false,
  }),
  columnHelper.display({
    id: "retirados",
    header: "Retirados",
    cell: ({ row }) => {
      return renderComponent(Estado, {
        variant: row.original.retirados ? "success" : "destructive",
      });
    },
    enableGlobalFilter: false,
  }),
  // {
  //   id: "actions",
  //   cell: ({ row }) => {
  //     return renderComponent(DataTableActions, {
  //       id: String(row.original.facturaId),
  //     });
  //   },
  //   enableHiding: false,
  // },
];
