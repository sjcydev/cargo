import type { ColumnDef } from "@tanstack/table-core";
import type { UsuariosWithSucursal, Sucursales } from "$lib/server/db/schema";
import { createRawSnippet } from "svelte";
import { renderComponent, renderSnippet } from "$lib/components/ui/data-table";
import DataTableActions from "./data-table-actions.svelte";
import DataSortableButton from "../../lib/components/data-sortable-button.svelte";

function normalizeString(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function accentInsensitiveFilter(row: any, columnId: any , filterValue: any) {
  const rowValue = row.getValue(columnId);
  if (typeof rowValue !== "string") return false;
  return normalizeString(rowValue).includes(normalizeString(filterValue));
}

export const columns: ColumnDef<UsuariosWithSucursal>[] = [
  {
    accessorFn: (row) => row.casillero,
    accessorKey: "casillero",
    id: "casillero",
    header: "ID",
    enableHiding: false,
    filterFn: "equalsString"
  },
  {
    accessorFn: (row) => row.nombre,
    accessorKey: "nombre",
    id: "nombre",
    header: "Nombre",
    filterFn: accentInsensitiveFilter,
  },
  {
    accessorFn: (row) => row.apellido,
    accessorKey: "apellido",
    id: "apellido",
    header: "Apellido",
    filterFn: accentInsensitiveFilter,
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
    id: "actions",
    cell: ({ row }) =>
      renderComponent(DataTableActions, {
        id: String(row.original.casillero),
        nombre: `${row.original.nombre} ${row.original.apellido}`,
      }),
    enableHiding: false,
  },
];
