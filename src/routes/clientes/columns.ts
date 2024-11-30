import type { ColumnDef } from "@tanstack/table-core";
import type { Usuarios } from "$lib/server/db/schema";
import { createRawSnippet } from "svelte";
import { renderComponent, renderSnippet } from "$lib/components/ui/data-table";
import DataTableActions from "./data-table-actions.svelte";


export const columns: ColumnDef<Usuarios>[] = [
  {
    accessorKey: "casillero",
    header: "Casillero",
  },
  {
    accessorKey: "nombre",
    header: "Nombre"
  },
  {
    accessorKey: "apellido",
    header: "Apellido",
  },
  {
    accessorKey: "correo",
    header: "Correo",
  },
  {
    accessorKey: "cedula",
    header: "Cedula",
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
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { id: String(row.original.id) });
    },
  },
];