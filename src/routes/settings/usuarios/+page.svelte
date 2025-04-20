<script lang="ts">
  import type { PageData } from "./$types";
  import Button from "$lib/components/ui/button/button.svelte";
  import { UserPlus } from "lucide-svelte";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import DataTable from "$lib/components/data-table.svelte";
  import { goto } from "$app/navigation";
  import { createColumns } from "./columns";

  let { data }: { data: PageData } = $props();
  const columns = createColumns(String(data.user!.id));
  let open = $state(false);

  function handleRowClick(row: any) {
    goto(`/settings/usuarios/${row.id}`);
  }
</script>

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
  <!-- <SucursalForm data={data.form} sucursal={data.sucursal!} logo={data.logo} /> -->
</div>
