import type { ColumnDef } from "@tanstack/table-core";
import type { Usuarios, Sucursales } from "$lib/server/db/schema";
import { createRawSnippet } from "svelte";
import { renderComponent, renderSnippet } from "$lib/components/ui/data-table";
import DataTableActions from "./data-table-actions.svelte";
import DataSortableButton from "./data-sortable-button.svelte";

export const columns: ColumnDef<Usuarios & { sucursal: Sucursales }>[] = [
  {
    accessorFn: (row) => row.casillero,
    accessorKey: "casillero",
    id: "casillero",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        title: "Casillero",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
    enableHiding: false
  },
  {
    accessorFn: (row) => row.nombre,
    accessorKey: "nombre",
    id: "nombre",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        title: "Nombre",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
  },
  {
    accessorFn: (row) => row.apellido,
    accessorKey: "apellido",
    id: "apellido",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        title: "Apellido",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
  },
  {
    accessorFn: (row) => row.correo,
    accessorKey: "correo",
    id: "correo",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        title: "Correo",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
  },
  {
    accessorFn: (row) => row.cedula,
    accessorKey: "cedula",
    id: "cedula",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        title: "Cedula",
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
          render: () => (`<div>${sucursal.nombre}</div>`)
        }
      });

      return renderSnippet(sucursal, row.original.sucursal);
    }
  },
  {
    accessorFn: (row) => row.nacimiento,
    accessorKey: "nacimiento",
    id: "nacimiento",
    header: "Nacimiento",
    cell: ({ row }) => {
      const formatter = new Intl.DateTimeFormat('es-PA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      const nac = createRawSnippet<[Date | null]>((getNacimiento) => {
        const nacimiento = getNacimiento();
        return {
          render: () => (`<div>${formatter.format(nacimiento ?? new Date())}</div>`)
        }
      });

      return renderSnippet(nac, row.original.nacimiento);
    }
  },
  {
    accessorFn: (row) => row.sexo,
    accessorKey: "sexo",
    id: "sexo",
    header: "Sexo",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return renderComponent(DataTableActions, { id: String(row.original.id) });
    },
  },
];