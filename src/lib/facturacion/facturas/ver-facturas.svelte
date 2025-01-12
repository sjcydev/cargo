<script lang="ts">
  import DataTable from "$lib/components/data-table.svelte";
  import type { Snippet } from "svelte";
  import type { FacturasWithCliente } from "$lib/server/db/schema";

  let {
    columns,
    data,
    actions,
    selectionChange,
  }: {
    columns: any;
    data: FacturasWithCliente[];
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
