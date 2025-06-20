<script lang="ts">
  import DataTable from "$lib/components/data-table-main.svelte";
  import DataTableRegular from "$lib/components/data-table.svelte";
  import type { Snippet } from "svelte";
  import type { FacturasWithCliente, Facturas } from "$lib/server/db/schema";
  import { goto } from "$app/navigation";

  let {
    columns,
    data,
    actions,
    selectionChange,
    paginationData,
    regular,
    showPagination = true,
  }: {
    columns: any;
    data: FacturasWithCliente[] | Facturas[];
    actions?: Snippet;
    selectionChange?: (selected: number[]) => void;
    paginationData?: any;
    regular?: boolean;
    showPagination?: boolean;
  } = $props();

  function handleRowClick(row: any) {
    if (row.facturaId) {
      goto(`/facturas/${row.facturaId}`);
    }
  }
</script>

{#if regular}
  <DataTableRegular
    {columns}
    {data}
    {actions}
    enableSelection={true}
    {selectionChange}
    showTotal={true}
    onRowClick={handleRowClick}
    showPagination={false}
  />
{:else}
  <DataTable
    {columns}
    {data}
    {actions}
    enableSelection={true}
    {selectionChange}
    showTotal={true}
    onRowClick={handleRowClick}
    {paginationData}
  />
{/if}
