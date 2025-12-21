import type { ColumnDef } from "@tanstack/table-core";
import type { Trackings } from "$lib/server/db/schema";
import { renderComponent } from "$lib/components/ui/data-table";
import DataTableActions from "./data-table-actions.svelte";
import Estado from "$lib/facturacion/facturas/estado.svelte";

export const columns: ColumnDef<Trackings>[] = [
  {
    accessorFn: (row) => row.facturaId,
    accessorKey: "facturaId",
    id: "facturaId",
    header: "Factura",
    enableHiding: false,
    enableGlobalFilter: false,
  },
  {
    accessorFn: (row) => row.numeroTracking,
    accessorKey: "numeroTracking",
    id: "numeroTracking",
    header: "Numero Tracking",
    enableHiding: false,
    enableGlobalFilter: true,
    meta: {
      globalFilterFn: (row: any, columnId: string, filterValue: any) => {
        return String(row.getValue(columnId)).includes(String(filterValue));
      }
    }
  },
  {
    accessorFn: (row) => row.peso,
    accessorKey: "peso",
    id: "peso",
    header: "Peso",
    enableGlobalFilter: false,
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
    enableGlobalFilter: false,
  },
  {
    accessorFn: (row) => row.retiradoAt,
    accessorKey: "retiradoAt",
    id: "retiradoAt",
    header: "Fecha de Retiro",
    cell: ({ row }) =>
      row.original.retiradoAt?.toLocaleDateString() ?? "No ha sido retirado",
    enableGlobalFilter: false,
  },
  {
    id: "actions",
    cell: ({ row }) =>
      renderComponent(DataTableActions, {
        facturaId: row.original.facturaId!,
        id: row.original.trackingId,
      }),
    enableHiding: false,
    enableGlobalFilter: false,
  },
];
