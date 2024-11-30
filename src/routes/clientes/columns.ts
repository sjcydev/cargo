import type { ColumnDef } from "@tanstack/table-core";
import type { Usuarios } from "$lib/server/db/schema";
import { createRawSnippet } from "svelte";
import { renderComponent, renderSnippet } from "$lib/components/ui/data-table";
import DataTableActions from "./data-table-actions.svelte";
import DataSortableButton from "./data-sortable-button.svelte";

export const columns: ColumnDef<Usuarios>[] = [
  {
    accessorKey: "casillero",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        title: "Casillero",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
    enableHiding: false
  },
  {
    accessorKey: "nombre",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        title: "Nombre",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
  },
  {
    accessorKey: "apellido",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        title: "Apellido",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
  },
  {
    accessorKey: "correo",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        title: "Correo",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
  },
  {
    accessorKey: "cedula",
    header: ({ column }) =>
      renderComponent(DataSortableButton, {
        title: "Cedula",
        onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }),
  },
  {
    accessorKey: "telefono",
    header: "Telefono",
  },
  {
    accessorKey: "nacimiento",
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
    accessorKey: "sexo",
    header: "Sexo",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return renderComponent(DataTableActions, { id: String(row.original.id) });
    },
  },
];