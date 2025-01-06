<script lang="ts">
  import DataTable from "$lib/components/data-table.svelte";
  let { columns, data } = $props();
</script>

<DataTable {columns} {data} />
