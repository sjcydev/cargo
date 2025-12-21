import type { ColumnDef } from "@tanstack/table-core";
import { createColumnHelper } from "@tanstack/table-core";
import type { FacturasWithCliente, Sucursales } from "$lib/server/db/schema";
import { createRawSnippet } from "svelte";
import { renderComponent, renderSnippet } from "$lib/components/ui/data-table";
import DataTableActions from "$lib/facturacion/data-table-actions.svelte";
import Estado from "$lib/facturacion/facturas/estado.svelte";
import Checkbox from "$lib/components/data-table-checkbox.svelte";
import { accentInsensitiveFilter } from "$lib/components/ui/data-table/filters";

const columnHelper = createColumnHelper<FacturasWithCliente>();

export const columns = (
  rol: "ADMIN" | "EMPLEADO" | "SECRETARIA" | undefined,
): ColumnDef<FacturasWithCliente>[] => [
  {
    id: "select",
    cell: ({ row, table }) => {
      const selectedRows = table.getSelectedRowModel().rows;
      const currentClienteId = row.original.clienteId;
      const isDisabled =
        selectedRows.length > 0 &&
        !selectedRows.every(
          (selectedRow) => selectedRow.original.clienteId === currentClienteId,
        );

      return renderComponent(Checkbox, {
        checked: row.getIsSelected(),
        disabled: isDisabled,
        onCheckedChange: (value: boolean) => {
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
    header: "Fecha",
    enableGlobalFilter: false,
  },
  {
    accessorFn: (row) => row.facturaId,
    accessorKey: "facturaId",
    id: "facturaId",
    header: "ID",
    enableHiding: false,
    enableGlobalFilter: false,
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
    id: "sucursal",
    accessorKey: "sucursal",
    header: "Sucursal",
    cell: ({ row }) => {
      const sucursal = createRawSnippet<[Sucursales]>((getSucursal) => {
        const sucursal = getSucursal();
        return {
          render: () => `<div>${sucursal}</div>`,
        };
      });

      return renderSnippet(sucursal, row.original.cliente!.sucursal);
    },
    enableGlobalFilter: false,
  },
  {
    accessorFn: (row) => row.total,
    accessorKey: "total",
    id: "total",
    header: "Total",
    cell: ({ row }) => `$${row.original.total!.toFixed(2)}`,
    enableGlobalFilter: false,
  },
  {
    accessorFn: (row) => row.pagado ? "pagado" : "pendiente",
    accessorKey: "pagado",
    id: "pagado",
    header: "Pagado",
    cell: ({ row }) => {
      return renderComponent(Estado, {
        variant: row.original.pagado ? "success" : "destructive",
      });
    },
    enableGlobalFilter: true,
    filterFn: (row, columnId, filterValue) => {
      const searchTerm = filterValue.toLowerCase();
      const isPagado = row.original.pagado;

      if (searchTerm.includes("pagado") || searchTerm.includes("pagada")) {
        return isPagado === true;
      }
      if (searchTerm.includes("pendiente") || searchTerm.includes("no pagado")) {
        return isPagado === false;
      }

      // Default behavior: match the accessor value
      const cellValue = isPagado ? "pagado" : "pendiente";
      return cellValue.toLowerCase().includes(searchTerm);
    },
  },
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
  {
    accessorFn: (row) => `${row.cliente?.codificacion}`,
    id: "codificacion",
    header: () => null,
    cell: () => null,
    meta: {
      globalFilterFn: accentInsensitiveFilter,
    },
    enableGlobalFilter: true,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return renderComponent(DataTableActions, {
        id: String(row.original.facturaId),
        rol,
      });
    },
    enableHiding: false,
  },
];
