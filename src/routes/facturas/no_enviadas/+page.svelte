<script lang="ts">
  import type { PageData } from "./$types";
  import InnerLayout from "$lib/components/inner-layout.svelte";
  import VerFacturas from "$lib/facturacion/facturas/ver-facturas.svelte";
  import { Button } from "$lib/components/ui/button";
  import { columns } from "./columns";

  let { data: pageData }: { data: PageData } = $props();
  let { facturas: data } = pageData;
</script>

{#snippet actions()}
  <Button href="/facturas/facturar">Facturar</Button>
{/snippet}

<InnerLayout title={"Facturas"} {actions}>
  <VerFacturas {data} {columns} />
</InnerLayout>
