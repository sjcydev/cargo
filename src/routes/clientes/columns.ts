import type { ColumnDef } from "@tanstack/table-core";
import type { UsuariosWithSucursal, Sucursales } from "$lib/server/db/schema";
import { createRawSnippet } from "svelte";
import { renderComponent, renderSnippet } from "$lib/components/ui/data-table";
import DataTableActions from "./data-table-actions.svelte";
import DataSortableButton from "../../lib/components/data-sortable-button.svelte";

export const columns: ColumnDef<UsuariosWithSucursal>[] = [
  {
    accessorFn: (row) => row.casillero,
    accessorKey: "casillero",
    id: "casillero",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        label: "ID",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
    enableHiding: false,
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
    accessorFn: (row) => row.correo,
    accessorKey: "correo",
    id: "correo",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        label: "Correo",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
  },
  {
    accessorFn: (row) => row.cedula,
    accessorKey: "cedula",
    id: "cedula",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        label: "Cedula",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
  },
  {
    accessorFn: (row) => row.telefono,
    accessorKey: "telefono",
    id: "telefono",
    header: "Telefono",
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

      const nac = createRawSnippet<[Date | null]>((getNacimiento) => {
        const nacimiento = getNacimiento();
        return {
          render: () => `<div>${formatter.format(nacimiento!)}</div>`,
        };
      });

      return renderSnippet(nac, row.original.nacimiento);
    },
  },
  {
    accessorFn: (row) => row.sexo,
    accessorKey: "sexo",
    id: "sexo",
    header: "Sexo",
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
