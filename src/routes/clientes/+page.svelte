<script lang="ts">
  import type { PageData } from "./$types";
  import Button from "$lib/components/ui/button/button.svelte";
  import DataTable from "../../lib/components/data-table-main.svelte";
  import { columns } from "./columns";
  import * as Tabs from "$lib/components/ui/tabs/index";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";

  import InnerLayout from "$lib/components/inner-layout.svelte";
  import type { Sucursales } from "$lib/server/db/schema";

  let { data }: { data: PageData } = $props();

  function handleRowClick(row: any) {
    if (row.casillero) {
      goto(`/clientes/${row.casillero}`);
    }
  }

  let currentSucursal = $state(
    data.user.rol === "ADMIN" ? "todos" : data.sucursales[0].sucursal
  );

  $effect(() => {
    const currentPage = Number(page.url.searchParams.get("page") ?? "1");
    const actualPage = data.pagination.page;

    if (currentPage !== actualPage) {
      const url = new URL(window.location.href);
      url.searchParams.set("page", actualPage.toString());

      // Update the URL without full reload
      goto(`${url.pathname}?${url.searchParams.toString()}`, {
        replaceState: true,
        keepFocus: true,
        noScroll: true,
      });
    }
  });

  $effect(() => {
    const currentSucursalValue = page.url.searchParams.get("sucursalId");
    if (currentSucursalValue) {
      currentSucursal =
        data.sucursales.find(
          (s: Sucursales) => s.sucursalId?.toString() === currentSucursalValue
        )?.sucursal ?? "todos";
    }
  });

  function handleTabChange(value: string) {
    const url = new URL(window.location.href);
    if (value === "todos") {
      url.searchParams.delete("sucursalId");
      goto(`${url.pathname}?${url.searchParams.toString()}`, {
        replaceState: true,
        keepFocus: true,
        noScroll: true,
      });
      return;
    }

    const sucursal = data.sucursales.find(
      (s: Sucursales) => s.sucursal === value
    );
    currentSucursal = value;
    url.searchParams.set("sucursalId", sucursal!.sucursalId.toString());
    goto(`${url.pathname}?${url.searchParams.toString()}`, {
      replaceState: true,
      keepFocus: true,
      noScroll: true,
    });
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
    bind:value={currentSucursal}
    class="space-y-5"
    onValueChange={handleTabChange}
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
          data={data.todos}
          onRowClick={handleRowClick}
          paginationData={data.pagination}
        />
      </Tabs.Content>
    {/if}
    {#each data.sucursales as sucursal}
      <Tabs.Content value={`${sucursal.sucursal}`}>
        <DataTable
          {columns}
          data={data.todos}
          onRowClick={handleRowClick}
          paginationData={data.pagination}
        />
      </Tabs.Content>
    {/each}
  </Tabs.Root>
</InnerLayout>
