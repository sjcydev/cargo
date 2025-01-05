<script>
  import InnerLayout from "$lib/components/inner-layout.svelte";

  import { Button } from "$lib/components/ui/button";
</script>

{#snippet actions()}
  <Button href="/facturas/facturar">Facturar</Button>
{/snippet}

<InnerLayout title={"Facturas"} {actions}></InnerLayout>
