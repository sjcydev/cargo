<script lang="ts">
  import type { PageData } from "./$types";
  import InnerLayout from "$lib/components/inner-layout.svelte";
  import VerFacturas from "$lib/facturacion/facturas/ver-facturas.svelte";
  import SucursalTabs from "$lib/components/shared/sucursal-tabs.svelte";
  import { Button } from "$lib/components/ui/button";
  import { columns as createColumns } from "./columns";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { ReceiptText, Package } from "lucide-svelte";

  let { data }: { data: PageData } = $props();
  let { user, sucursales } = data;
  let facturas = $state(data.facturas);
  let selectedFacturas = $state<number[]>([]);
  let loadingMore = $state(false);

  const columns = createColumns(user?.rol);

  function handleSelectionChange(selected: number[]) {
    selectedFacturas = selected;
  }

  function procesarMultiples() {
    if (selectedFacturas.length === 1) {
      goto(`/facturas/${selectedFacturas[0]}`);
    } else if (selectedFacturas.length > 1) {
      goto(`/facturas/multiples?facturas=${selectedFacturas.join(",")}`);
    }
  }

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
  <Button href="/facturas/facturar">
    <ReceiptText class="w-4 h-4" /> Facturar
  </Button>
{/snippet}

<InnerLayout title={"Facturas"} {actions}>
  <SucursalTabs sucursales={sucursales} data={facturas} userRole={user?.rol}>
    {#snippet content({ data: filteredData })}
      <VerFacturas
        data={filteredData}
        {columns}
        selectionChange={handleSelectionChange}
        loading={loadingMore}
      />
    {/snippet}
  </SucursalTabs>
</InnerLayout>
