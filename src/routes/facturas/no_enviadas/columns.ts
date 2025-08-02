import type { ColumnDef } from "@tanstack/table-core";
import { createColumnHelper } from "@tanstack/table-core";
import type { FacturasWithCliente } from "$lib/server/db/schema";
import { renderComponent } from "$lib/components/ui/data-table";
import DataTableActions from "$lib/facturacion/data-table-actions.svelte";
import Estado from "$lib/facturacion/facturas/estado.svelte";
import Checkbox from "$lib/components/data-table-checkbox.svelte";

const columnHelper = createColumnHelper<FacturasWithCliente>();

export const columns = (
  rol: "ADMIN" | "EMPLEADO" | "SECRETARIA" | undefined
): ColumnDef<FacturasWithCliente>[] => [
    {
      id: "select",
      header: ({ table }) =>
        renderComponent(Checkbox, {
          checked: table.getIsAllPageRowsSelected(),
          indeterminate:
            table.getIsSomePageRowsSelected() &&
            !table.getIsAllPageRowsSelected(),
          onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
          "aria-label": "Select all",
        }),
      cell: ({ row }) =>
        renderComponent(Checkbox, {
          checked: row.getIsSelected(),
          onCheckedChange: (value) => row.toggleSelected(!!value),
          "aria-label": "Select row",
        }),
      enableSorting: false,
      enableHiding: false,
      enableGlobalFilter: false,
    },
    {
      accessorFn: (row) => row.fecha,
      accessorKey: "fecha",
      id: "fecha",
      header: "Fecha",
      enableGlobalFilter: false,
    },
    {
      accessorFn: (row) => row.facturaId,
      accessorKey: "facturaId",
      id: "facturaId",
      header: "ID",
      enableHiding: false,
    },
    {
      accessorFn: (row) => row.casillero,
      accessorKey: "casillero",
      id: "casillero",
      header: "Casillero",
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
      accessorFn: (row) => row.cliente!.cedula,
      accessorKey: "cedula",
      id: "cedula",
      header: "Cedula",
      enableGlobalFilter: false,
    },
    {
      accessorFn: (row) => row.cliente!.telefono,
      accessorKey: "telefono",
      id: "telefono",
      header: "Telefono",
      enableGlobalFilter: false,
    },
    {
      accessorFn: (row) => row.cliente!.sucursal,
      accessorKey: "sucursal",
      id: "sucursal",
      header: "Sucursal",
      enableGlobalFilter: false,
    },
    {
      accessorFn: (row) => row.total,
      accessorKey: "total",
      id: "total",
      header: "Total",
      cell: ({ row }) => row.original.total!.toFixed(2),
      enableGlobalFilter: false,
    },
    columnHelper.display({
      id: "estado",
      header: "Estado",
      cell: ({ row }) => {
        return renderComponent(Estado, {
          variant: row.original.enviado ? "success" : "destructive",
        });
      },
      enableGlobalFilter: false,
    }),
    {
      id: "actions",
      cell: ({ row }) => {
        return renderComponent(DataTableActions, {
          id: String(row.original.facturaId),
          rol,
        });
      },
      enableHiding: false,
      enableGlobalFilter: false,
    },
  ];
