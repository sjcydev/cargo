<script lang="ts">
  import type { PageData } from "./$types";
  import Button from "$lib/components/ui/button/button.svelte";
  import DataTable from "$lib/components/data-table.svelte";
  import { columns } from "./columns";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import InnerLayout from "$lib/components/inner-layout.svelte";
  import SucursalTabs from "$lib/components/shared/sucursal-tabs.svelte";
  import { UserRoundPlus } from "lucide-svelte";

  let { data }: { data: PageData } = $props();
  let clientes = $state(data.clientes);
  let loading = $state(false);

  // Load additional clientes if initial batch is at limit
  if (data.clientes.length >= 100) {
    onMount(async () => {
      loading = true;

      const newData = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          last: data.last,
          sucursalId: data.user?.rol !== "ADMIN" ? data.user?.sucursalId : null,
        }),
      }).then((res) => {
        loading = false;
        return res.json();
      });

      clientes = [...clientes, ...newData.clientes];
    });
  }

  function handleRowClick(row: any) {
    if (row.casillero) {
      goto(`/admin/clientes/${row.casillero}`);
    }
  }
</script>

<svelte:head>
  <title>Clientes</title>
</svelte:head>

{#snippet actions()}
  <Button href="/admin/clientes/registrar">
    <UserRoundPlus class="w-4 h-4" /> Crear cliente
  </Button>
{/snippet}

<InnerLayout title={"Clientes"} {actions}>
  <SucursalTabs
    sucursales={data.sucursales}
    data={clientes}
    userRole={data.user?.rol}
  >
    {#snippet content({ data: filteredData })}
      <DataTable
        {columns}
        data={filteredData}
        onRowClick={handleRowClick}
        {loading}
      />
    {/snippet}
  </SucursalTabs>
</InnerLayout>
