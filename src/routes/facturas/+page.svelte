<script lang="ts">
  import type { PageData } from "./$types";
  import InnerLayout from "$lib/components/inner-layout.svelte";
  import VerFacturas from "$lib/facturacion/facturas/ver-facturas.svelte";
  import { Button } from "$lib/components/ui/button";
  import { columns as createColumns } from "./columns";
  import { goto } from "$app/navigation";
  import * as Tabs from "$lib/components/ui/tabs/index";
  import { page } from "$app/state";
  import type { Sucursales } from "$lib/server/db/schema";

  let { data: pageData }: { data: PageData } = $props();
  let { facturas: data } = pageData;
  let selectedFacturas = $state<number[]>([]);

  const columns = createColumns(pageData.rol);

  function handleSelectionChange(selected: number[]) {
    selectedFacturas = selected;
  }

  function procesarMultiples() {
    if (selectedFacturas.length === 1) {
      // If only one factura is selected, go to its individual page
      goto(`/facturas/${selectedFacturas[0]}`);
    } else if (selectedFacturas.length > 1) {
      // If multiple facturas are selected, go to the multiples route
      goto(`/facturas/multiples?facturas=${selectedFacturas.join(",")}`);
    }
  }

  let currentSucursal = $state(
    pageData.rol === "ADMIN" ? "todos" : pageData.sucursales[0].sucursal
  );

  $effect(() => {
    const currentPage = Number(page.url.searchParams.get("page") ?? "1");
    const actualPage = pageData.pagination.page;

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
        pageData.sucursales.find(
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

    const sucursal = pageData.sucursales.find(
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
  <title>Facturas</title>
</svelte:head>

{#snippet actions()}
  <Button
    variant="outline"
    onclick={procesarMultiples}
    disabled={selectedFacturas.length === 0}
  >
    Procesar {selectedFacturas.length} Factura{selectedFacturas.length !== 1
      ? "s"
      : ""}
  </Button>
  <Button href="/facturas/facturar">Facturar</Button>
{/snippet}

<InnerLayout title={"Facturas"} {actions}>
  <Tabs.Root
    bind:value={currentSucursal}
    class="mb-5"
    onValueChange={handleTabChange}
  >
    {#if pageData.sucursales.length > 1}
      <Tabs.List class="border-b border-gray-200">
        <Tabs.Trigger value="todos">Todos</Tabs.Trigger>
        {#each pageData.sucursales as sucursal}
          <Tabs.Trigger value={`${sucursal.sucursal}`}
            >{sucursal.sucursal}</Tabs.Trigger
          >
        {/each}
      </Tabs.List>
    {/if}
    {#if pageData.rol === "ADMIN"}
      <Tabs.Content value="todos">
        <VerFacturas
          {data}
          {columns}
          selectionChange={handleSelectionChange}
          paginationData={pageData.pagination}
        />
      </Tabs.Content>
    {/if}
    {#each pageData.sucursales as sucursal}
      <Tabs.Content value={`${sucursal.sucursal}`}>
        <VerFacturas
          {data}
          {columns}
          selectionChange={handleSelectionChange}
          paginationData={pageData.pagination}
        />
      </Tabs.Content>
    {/each}
  </Tabs.Root>
</InnerLayout>
