<script lang="ts">
  import DataTable from "$lib/components/data-table.svelte";
  import type { Snippet } from "svelte";
  import type { FacturasWithCliente, Facturas } from "$lib/server/db/schema";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

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

  // Determine if we're in admin context
  let isAdmin = $derived($page.url.pathname.startsWith('/admin'));

  function handleRowClick(row: any) {
    if (row.facturaId) {
      const prefix = isAdmin ? '/admin' : '';
      goto(`${prefix}/facturas/${row.facturaId}`);
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
