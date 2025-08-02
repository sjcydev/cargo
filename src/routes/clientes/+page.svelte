<script lang="ts">
  import type { PageData } from "./$types";
  import Button from "$lib/components/ui/button/button.svelte";
  import DataTable from "../../lib/components/data-table.svelte";
  import { columns } from "./columns";
  import * as Tabs from "$lib/components/ui/tabs/index";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { onMount, getContext } from "svelte";

  import InnerLayout from "$lib/components/inner-layout.svelte";
  import type { Sucursales } from "$lib/server/db/schema";

  let { data }: { data: PageData } = $props();
  let clientes = $state(data.clientes);

  let loading = $state(false);

  onMount(async () => {
    loading = true;

      const newData = await fetch('/api/clientes', {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({last: data.last})}).then(res => {loading = false; return res.json()});

      clientes = [...clientes, ...newData.clientes];
  });

 function handleRowClick(row: any) {
    if (row.casillero) {
      goto(`/clientes/${row.casillero}`);
    }
  }

  let currentSucursal = $state(
    data.user.rol === "ADMIN" ? "todos" : data.sucursales[0].sucursal
  );
</script>

<svelte:head>
  <title>Clientes</title>
</svelte:head>

{#snippet actions()}
  <Button href="/clientes/registrar">Crear cliente</Button>
{/snippet}

<InnerLayout title={"Clientes"} {actions}>
  <Tabs.Root
    bind:value={currentSucursal}
    class="space-y-5"
  >
    {#if data.sucursales.length > 1}
      <Tabs.List class="border-b border-gray-200">
        <Tabs.Trigger value="todos">Todos</Tabs.Trigger>
        {#each data.sucursales as sucursal}
          <Tabs.Trigger value={`${sucursal.sucursal}`}
            >{sucursal.sucursal}</Tabs.Trigger
          >
        {/each}
      </Tabs.List>
    {/if}
    {#if data.user.rol === "ADMIN"}
      <Tabs.Content value="todos">
        <DataTable
          {columns}
          data={clientes}
          onRowClick={handleRowClick}
          {loading}
        />
      </Tabs.Content>
    {/if}
    {#each data.sucursales as sucursal}
      <Tabs.Content value={`${sucursal.sucursal}`}>
        <DataTable
          {columns}
          data={clientes.filter((c) => c.sucursalId == sucursal.sucursalId)}
          onRowClick={handleRowClick}
          {loading}
        />
      </Tabs.Content>
    {/each}
  </Tabs.Root>
</InnerLayout>
