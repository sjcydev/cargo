<script lang="ts">
  import type { PageData } from "./$types";
  import Button from "$lib/components/ui/button/button.svelte";
  import DataTable from "../../lib/components/data-table.svelte";
  import { columns } from "./columns";
  import * as Tabs from "$lib/components/ui/tabs/index";
  import { goto } from "$app/navigation";

  import InnerLayout from "$lib/components/inner-layout.svelte";

  let { data }: { data: PageData } = $props();

  function handleRowClick(row: any) {
    if (row.id) {
      goto(`/clientes/${row.id}`);
    }
  }
</script>

<svelte:head>
  <title>Clientes</title>
</svelte:head>

{#snippet actions()}
  <Button href="/clientes/registrar">Crear cliente</Button>
{/snippet}

<InnerLayout title={"Clientes"} {actions}>
  <Tabs.Root
    value={data.user.rol === "ADMIN" ? "todos" : data.bySucursal[0].sucursal}
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
    {#if data.user.rol === "ADMIN"}
      <Tabs.Content value="todos">
        <DataTable {columns} data={data.todos} onRowClick={handleRowClick} />
      </Tabs.Content>
    {/if}
    {#each data.bySucursal as bySucursal}
      <Tabs.Content value={`${bySucursal.sucursal}`}>
        <DataTable
          {columns}
          data={bySucursal.usuarios}
          onRowClick={handleRowClick}
        />
      </Tabs.Content>
    {/each}
  </Tabs.Root>
</InnerLayout>
