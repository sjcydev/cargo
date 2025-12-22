<script lang="ts">
  import type { PageData } from "./$types";
  import InnerLayout from "$lib/components/inner-layout.svelte";
  import DataTable from "$lib/components/data-table.svelte";
  import * as Tabs from "$lib/components/ui/tabs";
  import { columns } from "./columns";
  import { goto } from "$app/navigation";

  let { data }: { data: PageData } = $props();

  function handleRowClick(row: any) {
    if (row.facturaId) {
      goto(`/admin/facturas/${row.facturaId}`);
    }
  }
</script>

<svelte:head>
  <title>Trackings</title>
</svelte:head>

<InnerLayout title="Trackings">
  <Tabs.Root
    value={data.user!.rol === "ADMIN" ? "todos" : data.bySucursal[0].sucursal}
    class="space-y-5"
  >
    {#if data.bySucursal.length > 1}
      <Tabs.List class="border-b border-gray-200">
        <Tabs.Trigger value="todos">Todos</Tabs.Trigger>
        {#each data.bySucursal as sucursal}
          <Tabs.Trigger value={`${sucursal.sucursal}`}
            >{sucursal.sucursal}</Tabs.Trigger
          >
        {/each}
      </Tabs.List>
    {/if}
    {#if data.user!.rol === "ADMIN"}
      <Tabs.Content value="todos">
        <DataTable {columns} data={data.todos} onRowClick={handleRowClick} />
      </Tabs.Content>
    {/if}
    {#each data.bySucursal as sucursal}
      <Tabs.Content value={`${sucursal.sucursal}`}>
        <DataTable
          {columns}
          data={sucursal.trackings}
          onRowClick={handleRowClick}
        />
      </Tabs.Content>
    {/each}
  </Tabs.Root>
</InnerLayout>
