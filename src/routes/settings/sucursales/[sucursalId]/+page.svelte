<script lang="ts">
  import type { PageData } from "./$types";
  import { Separator } from "$lib/components/ui/separator";
  import SucursalForm from "./sucursal-form.svelte";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Detalles de la Sucursal | {data.sucursal.sucursal}</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h3 class="text-xl font-medium">
      Detalles de la Sucursal | {data.sucursal.sucursal}
    </h3>
    <p class="text-muted-foreground text-sm">
      Aquí puedes modificar los detalles de la sucursal seleccionada.
    </p>
  </div>
  <Separator />
  <SucursalForm data={data.form} sucursal={data.sucursal} />
</div>
