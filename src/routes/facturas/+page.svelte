<script lang="ts">
  import type { PageData } from "./$types";
  import InnerLayout from "$lib/components/inner-layout.svelte";
  import VerFacturas from "$lib/facturacion/facturas/ver-facturas.svelte";
  import { Button } from "$lib/components/ui/button";
  import { columns as createColumns } from "./columns";
  import { goto, invalidate } from "$app/navigation";

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
  <VerFacturas {data} {columns} selectionChange={handleSelectionChange} />
</InnerLayout>
