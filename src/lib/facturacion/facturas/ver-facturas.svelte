<script lang="ts">
  import DataTable from "$lib/components/data-table.svelte";
  import type { Snippet } from "svelte";
  import type { FacturasWithCliente, Facturas } from "$lib/server/db/schema";
  import { goto } from "$app/navigation";

  let {
    columns,
    data,
    actions,
    selectionChange,
    showPagination = true,
    loading = false,
  }: {
    columns: any;
    data: Partial<FacturasWithCliente>[] | Partial<Facturas>[];
    actions?: Snippet;
    selectionChange?: (selected: number[]) => void;
    showPagination?: boolean;
    loading?: boolean;
  } = $props();

  function handleRowClick(row: any) {
    if (row.facturaId) {
      goto(`/facturas/${row.facturaId}`);
    }
  }
</script>

<DataTable
  {columns}
  {data}
  {actions}
  enableSelection={true}
  {selectionChange}
  showTotal={true}
  onRowClick={handleRowClick}
  showPagination={showPagination}
  {loading}
/>
