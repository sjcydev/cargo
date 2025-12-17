<script lang="ts">
  import type { PageData } from "./$types";
  import { Separator } from "$lib/components/ui/separator";
  import AddressForm from "./address-form.svelte";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Detalles de la Dirección | {data.address.city}</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h3 class="text-xl font-medium">
      Detalles de la Dirección | {data.address.city}
    </h3>
    <p class="text-muted-foreground text-sm">
      Aquí puedes modificar los detalles de la dirección seleccionada.
    </p>
  </div>
  <Separator />
  <AddressForm data={data.form} address={data.address} />
</div>
