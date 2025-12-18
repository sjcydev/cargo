import type { ColumnDef } from "@tanstack/table-core";
import { createColumnHelper } from "@tanstack/table-core";
import type { Addresses } from "$lib/server/db/schema";
import { renderComponent } from "$lib/components/ui/data-table";
import DataTableActions from "./data-table-actions.svelte";

const columnHelper = createColumnHelper<Addresses>();

export const columns: ColumnDef<Addresses>[] = [
  {
    accessorFn: (row) => row.addressId,
    accessorKey: "addressId",
    id: "addressId",
    header: () => "ID",
    cell: ({ row }) => row.getValue("addressId"),
  },
  {
    accessorFn: (row) => row.name,
    accessorKey: "name",
    id: "name",
    header: () => "Nombre",
    cell: ({ row }) => row.getValue("name"),
  },
  {
    accessorFn: (row) => row.address1,
    accessorKey: "address1",
    id: "address1",
    header: () => "Dirección",
    cell: ({ row }) => row.getValue("address1"),
  },
  {
    accessorFn: (row) => row.city,
    accessorKey: "city",
    id: "city",
    header: () => "Ciudad",
    cell: ({ row }) => row.getValue("city"),
  },
  {
    accessorFn: (row) => row.country,
    accessorKey: "country",
    id: "country",
    header: () => "País",
    cell: ({ row }) => row.getValue("country"),
  },
  {
    id: "actions",
    cell: ({ row }) =>
      renderComponent(DataTableActions, {
        id: String(row.original.addressId),
      }),
    enableHiding: false,
  },
];
