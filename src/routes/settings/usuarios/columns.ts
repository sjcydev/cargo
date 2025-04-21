import type { ColumnDef } from "@tanstack/table-core";
import { createColumnHelper } from "@tanstack/table-core";
import type { Users } from "$lib/server/db/schema";
import { renderComponent } from "$lib/components/ui/data-table";
import DataSortableButton from "$lib/components/data-sortable-button.svelte";
import DataTableActions from "./data-table-actions.svelte";
import type { Sucursales } from "$lib/server/db/schema";

const columnHelper = createColumnHelper<Users>();

export const createColumns = (
  currentUserId: string,
  sucursales: Sucursales[]
): ColumnDef<Users>[] => [
  {
    accessorFn: (row) => row.username,
    accessorKey: "username",
    id: "username",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        label: "Usuario",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
  },
  {
    accessorFn: (row) => row.nombre,
    accessorKey: "nombre",
    id: "nombre",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        label: "Nombre",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
  },
  {
    accessorFn: (row) => row.apellido,
    accessorKey: "apellido",
    id: "apellido",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        label: "Apellido",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
  },
  {
    accessorFn: (row) => row.rol,
    accessorKey: "rol",
    id: "rol",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        label: "Rol",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
  },
  {
    accessorFn: (row) =>
      sucursales.find((s) => s.sucursalId === row.sucursalId)?.sucursal,
    accessorKey: "sucursalId",
    id: "sucursalId",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        label: "Sucursal",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return renderComponent(DataTableActions, {
        id: String(row.original.id),
        current: String(row.original.id) === currentUserId,
      });
    },
    enableHiding: false,
  },
];
