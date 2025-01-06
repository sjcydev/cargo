import type { ColumnDef } from "@tanstack/table-core";
import { createColumnHelper } from "@tanstack/table-core";
import type { FacturasWithCliente, Sucursales } from "$lib/server/db/schema";
import { createRawSnippet } from "svelte";
import { renderComponent, renderSnippet } from "$lib/components/ui/data-table";
import DataTableActions from "./data-table-actions.svelte";
import DataSortableButton from "$lib/components/data-sortable-button.svelte";
import Estado from "$lib/facturacion/facturas/estado.svelte";
import Checkbox from "$lib/components/data-table-checkbox.svelte";

const columnHelper = createColumnHelper<FacturasWithCliente>();

export const columns: ColumnDef<FacturasWithCliente>[] = [
  {
    id: "select",
    cell: ({ row, table }) => {
      const selectedRows = table.getSelectedRowModel().rows;
      const currentClienteId = row.original.clienteId;
      const isDisabled =
        selectedRows.length > 0 &&
        !selectedRows.every(
          (selectedRow) => selectedRow.original.clienteId === currentClienteId
        );

      return renderComponent(Checkbox, {
        checked: row.getIsSelected(),
        disabled: isDisabled,
        onCheckedChange: (value) => {
          if (!isDisabled) {
            row.toggleSelected(!!value);
          }
        },
        "aria-label": "Select row",
      });
    },
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
        label: "ID",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
    enableHiding: false,
  },
  {
    accessorFn: (row) => row.casillero,
    accessorKey: "casillero",
    id: "casillero",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        label: "Casillero",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
    enableHiding: false,
  },
  columnHelper.display({
    id: "cliente",
    header: "Cliente",
    cell: ({ row }) => {
      const nombre = row.original.cliente!.nombre;
      const apellido = row.original.cliente!.apellido;
      return `${nombre} ${apellido}`;
    },
  }),
  {
    accessorFn: (row) => row.cliente!.correo,
    accessorKey: "correo",
    id: "correo",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        label: "Correo",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
  },
  {
    accessorFn: (row) => row.cliente!.cedula,
    accessorKey: "cedula",
    id: "cedula",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        label: "Identificación",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
  },
  {
    accessorFn: (row) => row.cliente!.telefono,
    accessorKey: "telefono",
    id: "telefono",
    header: "Telefono",
  },
  {
    accessorFn: (row) => row.total,
    accessorKey: "total",
    id: "total",
    header: "Total",
    cell: ({ row }) => row.original.total!.toFixed(2),
  },
  columnHelper.display({
    id: "pagado",
    header: "Pagado",
    cell: ({ row }) => {
      return renderComponent(Estado, {
        variant: row.original.pagado ? "success" : "destructive",
      });
    },
  }),
  columnHelper.display({
    id: "retirados",
    header: "Retirados",
    cell: ({ row }) => {
      return renderComponent(Estado, {
        variant: row.original.retirados ? "success" : "destructive",
      });
    },
  }),
  {
    id: "actions",
    cell: ({ row }) => {
      return renderComponent(DataTableActions, {
        id: String(row.original.facturaId),
      });
    },
    enableHiding: false,
  },
];
