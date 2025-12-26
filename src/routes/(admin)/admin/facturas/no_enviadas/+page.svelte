<script lang="ts">
  import type { PageData } from "./$types";
  import InnerLayout from "$lib/components/inner-layout.svelte";
  import VerFacturas from "$lib/facturacion/facturas/ver-facturas.svelte";
  import { Button } from "$lib/components/ui/button";
  import { columns as createColumns } from "./columns";
  import { toast } from "svelte-sonner";
  import * as Tabs from "$lib/components/ui/tabs/index";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import type { Sucursales } from "$lib/server/db/schema";

  let { data }: { data: PageData } = $props();
  let { facturas, sucursales, user } = data;
  let selectedFacturas = $state<number[]>([]);

  const columns = createColumns(user.rol);

  async function enviarFacturas() {
    if (selectedFacturas.length === 0) {
      toast.error("Selecciona al menos una factura para enviar");
      return;
    }

    const toastId = toast.loading(
      `Enviando ${selectedFacturas.length} facturas...`
    );

    try {
      const response = await fetch("/api/emails/facturas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ facturaIds: selectedFacturas }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error("Hubo un error al enviar las facturas");
      }

      toast.info(
        "Las facturas se están procesando en segundo plano para ser enviadas. Una vez que se envíen, se actualizará la lista. Puede tardar unos minutos.",
        {
          id: toastId,
        }
      );
    } catch (error) {
      console.error("Error sending emails:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error al enviar las facturas";
      toast.error(errorMessage, {
        id: toastId,
      });
    }
  }

  function onSelectionChange(selected: number[]) {
    selectedFacturas = selected;
  }

  let currentSucursal = $state(
    user.rol === "ADMIN" ? "todos" : sucursales[0].sucursal
  );
</script>

{#snippet actions()}
  <div class="flex gap-3">
    <Button
      variant="outline"
      onclick={enviarFacturas}
      disabled={selectedFacturas.length === 0}
    >
      Enviar Facturas ({selectedFacturas.length})
    </Button>
    <Button href="/admin/facturas/facturar">Facturar</Button>
  </div>
{/snippet}

<svelte:head>
  <title>Facturas No Enviadas</title>
</svelte:head>

<InnerLayout title={"Facturas No Enviadas"} {actions}>
  <Tabs.Root bind:value={currentSucursal}>
    {#if sucursales.length > 1}
      <Tabs.List class="border-b border-gray-200 mb-3">
        <Tabs.Trigger value="todos">Todos</Tabs.Trigger>
        {#each sucursales as sucursal}
          <Tabs.Trigger value={`${sucursal.sucursal}`}
          >{sucursal.sucursal}</Tabs.Trigger
          >
        {/each}
      </Tabs.List>
    {/if}
    {#if user.rol === "ADMIN"}
      <Tabs.Content value="todos">
        <VerFacturas
          data={facturas}
          {columns}
          selectionChange={onSelectionChange}
          regular={true}
          showPagination={false}
        />
      </Tabs.Content>
    {/if}
    {#each sucursales as sucursal}
      <Tabs.Content value={sucursal.sucursal}>
        <VerFacturas
          data={facturas.filter((f) => f.cliente.sucursalId === sucursal.sucursalId )}
          {columns}
          selectionChange={onSelectionChange}
          regular={true}
          showPagination={false}
        />
      </Tabs.Content>
    {/each}
  </Tabs.Root>
</InnerLayout>
