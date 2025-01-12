<script lang="ts">
  import DataTable from "$lib/components/data-table.svelte";
  import type { Snippet } from "svelte";
  import type { FacturasWithCliente, Facturas } from "$lib/server/db/schema";

  let {
    columns,
    data,
    actions,
    selectionChange,
  }: {
    columns: any;
    data: FacturasWithCliente[] | Facturas[];
    actions?: Snippet;
    selectionChange?: (selected: number[]) => void;
  } = $props();
</script>

<DataTable
  {columns}
  {data}
  {actions}
  enableSelection={true}
  {selectionChange}
  showTotal={true}
/>
