import type { ColumnDef } from "@tanstack/table-core";
import { createColumnHelper } from "@tanstack/table-core";
import type { Trackings } from "$lib/server/db/schema";
import { renderComponent } from "$lib/components/ui/data-table";
import DataSortableButton from "$lib/components/data-sortable-button.svelte";
import DataTableActions from "./data-table-actions.svelte";
import Estado from "$lib/facturacion/facturas/estado.svelte";

const columnHelper = createColumnHelper<Trackings>();

export const columns: ColumnDef<Trackings>[] = [
  {
    accessorFn: (row) => row.facturaId,
    accessorKey: "facturaId",
    id: "facturaId",
    header: "Factura",
    enableHiding: false,
  },
  {
    accessorFn: (row) => row.numeroTracking,
    accessorKey: "numeroTracking",
    id: "numeroTracking",
    header: "Numero Tracking",
    enableHiding: false,
  },
  {
    accessorFn: (row) => row.peso,
    accessorKey: "peso",
    id: "peso",
    header: "Peso",
  },
  {
    accessorFn: (row) => row.retirado,
    accessorKey: "retirado",
    id: "retirado",
    header: "Estado",
    cell: ({ row }) =>
      renderComponent(Estado, {
        variant: row.original.retirado ? "success" : "destructive",
      }),
  },
  {
    accessorFn: (row) => row.retiradoAt,
    accessorKey: "retiradoAt",
    id: "retiradoAt",
    header: "Fecha de Retiro",
    cell: ({ row }) =>
      row.original.retiradoAt?.toLocaleDateString() ?? "No ha sido retirado",
  },
  {
    id: "actions",
    cell: ({ row }) =>
      renderComponent(DataTableActions, {
        facturaId: row.original.facturaId!,
        id: row.original.trackingId,
      }),
    enableHiding: false,
  },
];
