import type { ColumnDef } from "@tanstack/table-core";
import type { UsuariosWithSucursal, Sucursales } from "$lib/server/db/schema";
import { createRawSnippet } from "svelte";
import { renderComponent, renderSnippet } from "$lib/components/ui/data-table";
import DataTableActions from "./data-table-actions.svelte";
import { accentInsensitiveFilter } from "$lib/components/ui/data-table/filters";

export const columns: ColumnDef<UsuariosWithSucursal>[] = [
  {
    accessorFn: (row) => row.casillero,
    accessorKey: "casillero",
    id: "casillero",
    header: "ID",
    enableHiding: false,
  },
  {
    accessorFn: (row) => `${row.nombre} ${row.apellido}`,
    id: "nombreCompleto",
    header: "Nombre",
    enableGlobalFilter: true,
    meta: {
      globalFilterFn: accentInsensitiveFilter,
    },
  },
  {
    accessorFn: (row) => row.correo,
    accessorKey: "correo",
    id: "correo",
    header: "Correo",
    enableGlobalFilter: false,
  },
  {
    accessorFn: (row) => row.cedula,
    accessorKey: "cedula",
    id: "cedula",
    header: "Cedula",
    enableGlobalFilter: false,
  },
  {
    accessorFn: (row) => row.telefono,
    accessorKey: "telefono",
    id: "telefono",
    header: "Telefono",
    enableGlobalFilter: false,
  },
  {
    accessorFn: (row) => row.sucursal,
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

      return renderSnippet(sucursal, row.original.sucursal);
    },
    enableGlobalFilter: false,
  },
  {
    accessorFn: (row) => row.nacimiento,
    accessorKey: "nacimiento",
    id: "nacimiento",
    header: "Nacimiento",
    cell: ({ row }) => {
      const formatter = new Intl.DateTimeFormat("es-PA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const nac = createRawSnippet<[string | null]>((getNacimiento) => {
        const nacimiento = getNacimiento();
        return {
          render: () => `<div>${formatter.format(new Date(nacimiento!))}</div>`,
        };
      });

      //@ts-ignore
      return renderSnippet(nac, row.original.nacimiento);
    },
    enableGlobalFilter: false,
  },
  {
    accessorFn: (row) => row.sexo,
    accessorKey: "sexo",
    id: "sexo",
    header: "Sexo",
    enableGlobalFilter: false,
  },
  {
    accessorFn: (row) => `${row.codificacion}`,
    id: "codificacion",
    header: () => null,
    cell: () => null,
    enableGlobalFilter: true,
    meta: {
      globalFilterFn: accentInsensitiveFilter,
    },
  },
  {
    id: "actions",
    cell: ({ row }) =>
      renderComponent(DataTableActions, {
        id: String(row.original.casillero),
        nombre: `${row.original.nombre} ${row.original.apellido}`,
      }),
    enableHiding: false,
  },
];
