<script lang="ts">
  import type { PageData } from "./$types";
  import InnerLayout from "$lib/components/inner-layout.svelte";
  import VerFacturas from "$lib/facturacion/facturas/ver-facturas.svelte";
  import { Button } from "$lib/components/ui/button";
  import { columns } from "./columns";
  import { goto } from "$app/navigation";

  let { data: pageData }: { data: PageData } = $props();
  let { facturas: data } = pageData;
  let selectedFacturas = $state<number[]>([]);

  function handleSelectionChange(selected: number[]) {
    selectedFacturas = selected;
  }

  function procesarMultiples() {
    if (selectedFacturas.length > 0) {
      goto(`/facturas/multiples?facturas=${selectedFacturas.join(",")}`);
    }
  }
</script>

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
