<script lang="ts">
  import type { PageData } from "./$types";
  import Button from "$lib/components/ui/button/button.svelte";
  import { UserPlus } from "lucide-svelte";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import DataTable from "$lib/components/data-table.svelte";
  import { goto } from "$app/navigation";
  import { createColumns } from "./columns";
  import UsuarioForm from "./usuario-form.svelte";

  let { data }: { data: PageData } = $props();
  const columns = createColumns(String(data.user!.id), data.sucursales);
  let open = $state(false);

  function handleRowClick(row: any) {
    goto(`/admin/settings/usuarios/${row.id}`);
  }
</script>

<svelte:head>
  <title>Detalles de los Usuarios</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex justify-between">
    <div>
      <h3 class="text-xl font-medium">Detalles de los Usuarios</h3>
      <p class="text-muted-foreground text-sm">
        Aqui puedes modificar los detalles de los usuarios.
      </p>
    </div>

    <div>
      <Button onclick={() => (open = true)}>Añadir Usuario <UserPlus /></Button>
    </div>
  </div>

  <Separator />

  <DataTable
    {columns}
    data={data.users}
    headerless={true}
    onRowClick={handleRowClick}
  />

  <UsuarioForm data={data.form} sucursales={data.sucursales} bind:open />
</div>
