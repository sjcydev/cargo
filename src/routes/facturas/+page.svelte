<script>
  import SnippetHeader from "$lib/components/sidebar-header.svelte";

  import { Button } from "$lib/components/ui/button";
</script>

{#snippet actions()}
  <Button href="/facturar">Facturar</Button>
{/snippet}

<SnippetHeader title={"Facturas"} {actions} />
