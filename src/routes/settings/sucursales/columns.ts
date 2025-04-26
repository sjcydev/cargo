import type { ColumnDef } from "@tanstack/table-core";
import { createColumnHelper } from "@tanstack/table-core";
import type { Reportes, Sucursales } from "$lib/server/db/schema";
import { renderComponent } from "$lib/components/ui/data-table";
import DataSortableButton from "$lib/components/data-sortable-button.svelte";
import DataTableActions from "./data-table-actions.svelte";

const columnHelper = createColumnHelper<Sucursales>();

export const columns: ColumnDef<Sucursales>[] = [
  {
    accessorFn: (row) => row.sucursalId,
    accessorKey: "sucursalId",
    id: "sucursalId",
    header: () => "Sucursal N°",
    cell: ({ row }) => row.getValue("sucursalId"),
  },
  {
    accessorFn: (row) => row.sucursal,
    accessorKey: "sucursal",
    id: "sucursal",
    header: () => "Nombre de Sucursal",
    cell: ({ row }) => row.getValue("sucursal"),
  },
  {
    accessorFn: (row) => row.codificacion,
    accessorKey: "codificacion",
    id: "codificacion",
    header: () => "Codificación",
    cell: ({ row }) => row.getValue("codificacion"),
  },
  {
    id: "actions",
    cell: ({ row }) =>
      renderComponent(DataTableActions, {
        id: String(row.original.sucursalId),
      }),
    enableHiding: false,
  },
];
