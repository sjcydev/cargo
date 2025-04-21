<script lang="ts">
  import type { PageData } from "./$types";
  import { Separator } from "$lib/components/ui/separator";
  import UsariosFormEdit from "./usarios-form-edit.svelte";

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Detalles del Usuario | {data.user.username}</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h3 class="text-xl font-medium">
      Detalles del Usuario | {data.user.username}
    </h3>
    <p class="text-muted-foreground text-sm">
      Aquí puedes modificar los detalles del usuario seleccionado.
    </p>
  </div>
  <Separator />
  <UsariosFormEdit data={data.form} sucursales={data.sucursales} />
</div>
