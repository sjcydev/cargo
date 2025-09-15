<script lang="ts">
  import type { PageData } from "./$types";
  import InnerLayout from "$lib/components/inner-layout.svelte";
  import VerFacturas from "$lib/facturacion/facturas/ver-facturas.svelte";
  import { Button } from "$lib/components/ui/button";
  import { columns as createColumns } from "./columns";
  import { goto } from "$app/navigation";
  import * as Tabs from "$lib/components/ui/tabs/index";
  import { onMount } from "svelte";
  import { ReceiptText, Package } from "lucide-svelte";

  let { data }: { data: PageData } = $props();
  let { user, sucursales } = data;
  let facturas = $state(data.facturas);

  let selectedFacturas = $state<number[]>([]);

  const columns = createColumns(user?.rol);

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
    user?.rol === "ADMIN" ? "todos" : sucursales[0].sucursal,
  );

  let loadingMore = $state(false);

  onMount(async () => {
    loadingMore = true;
    const newFacturas = await fetch("/api/facturas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cursor: data.last }),
    }).then((res) => {
      loadingMore = false;
      return res.json();
    });
    facturas = [...facturas, ...newFacturas.facturas];
  });
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
    <Package class="w-4 h-4" />
    Procesar {selectedFacturas.length} Factura{selectedFacturas.length !== 1
      ? "s"
      : ""}
  </Button>
  <Button href="/facturas/facturar"><ReceiptText class="w-4 h-4" /> Facturar</Button>
{/snippet}

<InnerLayout title={"Facturas"} {actions}>
  <Tabs.Root bind:value={currentSucursal} class="mb-5">
    {#if sucursales.length > 1}
      <Tabs.List class="border-b border-gray-200">
        <Tabs.Trigger value="todos">Todos</Tabs.Trigger>
        {#each sucursales as sucursal}
          <Tabs.Trigger value={`${sucursal.sucursal}`}
            >{sucursal.sucursal}</Tabs.Trigger
          >
        {/each}
      </Tabs.List>
    {/if}
    {#if user?.rol === "ADMIN"}
      <Tabs.Content value="todos">
        <VerFacturas
          data={facturas}
          {columns}
          selectionChange={handleSelectionChange}
          loading={loadingMore}
        />
      </Tabs.Content>
    {/if}
    {#each sucursales as sucursal}
      <Tabs.Content value={`${sucursal.sucursal}`}>
        <VerFacturas
          data={facturas.filter((f) => f.sucursalId === sucursal.sucursalId)}
          {columns}
          selectionChange={handleSelectionChange}
          loading={loadingMore}
        />
      </Tabs.Content>
    {/each}
  </Tabs.Root>
</InnerLayout>
