<script lang="ts">
  import type { PageData } from "./$types";
  import InnerLayout from "$lib/components/inner-layout.svelte";
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Download, Trash2 } from "lucide-svelte";
  import DataTable from "$lib/components/data-table.svelte";
  import { columns } from "./columns";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import { generateReport } from "$lib/facturacion/facturar/generatePDF";
  import { goto } from "$app/navigation";
  import DeleteDialog from "$lib/components/delete-dialog.svelte";

  let { data }: { data: PageData } = $props();
  let deleteDialogOpen = $state(false);

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function capitalizeMethod(method: string) {
    return method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
  }

  async function downloadReport() {
    await generateReport({
      reporte: data.report,
      facturas: data.facturas,
      logo: data.logo,
      descargar: true,
    });
  }
</script>

<svelte:head>
  <title>Reporte N° {data.report.reporteId}</title>
</svelte:head>

<DeleteDialog
  bind:open={deleteDialogOpen}
  title="Eliminar Reporte"
  description={`¿Estás seguro que deseas eliminar el reporte N° ${data.report.reporteId}? Esta acción no se puede deshacer.`}
  action="/reportes?/delete"
  itemId={data.report.reporteId}
  onSuccess={() => goto("/reportes")}
/>

{#snippet actions()}
  <div class="flex gap-2">
    {#if data.user!.rol === "ADMIN"}
      <Button
        variant="destructive"
        class="font-semibold"
        onclick={() => (deleteDialogOpen = true)}
      >
        Eliminar Reporte
        <Trash2 class="size-4" />
      </Button>
    {/if}

    <Button class="font-semibold" onclick={() => downloadReport()}>
      Descargar Reporte
      <Download />
    </Button>
  </div>
{/snippet}

<InnerLayout title="Detalles del Reporte" back={true} {actions}>
  <Card.Root>
    <Card.Header>
      <Card.Title>Información General</Card.Title>
      <Card.Description>Reporte de facturación</Card.Description>
    </Card.Header>
    <Card.Content class="pt-6">
      <div class="grid gap-6">
        <!-- Date Range -->
        <div class="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <p class="text-sm font-medium text-muted-foreground">
              Fecha Inicial
            </p>
            <p class="text-xl font-semibold">
              {formatDate(data.report.fechaInicial!)}
            </p>
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground">Fecha Final</p>
            <p class="text-xl font-semibold">
              {formatDate(data.report.fechaFinal!)}
            </p>
          </div>
        </div>

        <!-- Overview Stats -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm font-medium text-muted-foreground">
              Total de Facturas
            </p>
            <p class="text-2xl font-bold">{data.report.facturas}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground">Total</p>
            <p class="text-2xl font-bold">
              {formatter.format(data.report.total!)}
            </p>
          </div>
        </div>

        <Separator />

        <!-- Payment Methods -->
        <div class="grid grid-cols-4 gap-4">
          {#each Object.entries(data.report.metodoDePago as Record<string, { count: number; total: number }>) as [method, info]}
            <div class="p-4 bg-muted rounded-lg">
              <p class="text-sm font-medium text-muted-foreground mb-1">
                {capitalizeMethod(method)}
              </p>
              <p class="text-2xl font-bold mb-1">
                {formatter.format(info.total)}
              </p>
              <p class="text-sm text-blue-500">{info.count} Facturas</p>
            </div>
          {/each}
        </div>

        <Separator />

        <!-- Facturas Table -->
        <div>
          <h3 class="text-xl font-semibold mb-4">Lista de Facturas</h3>
          <DataTable data={data.facturas} {columns} />
        </div>
      </div>
    </Card.Content>
  </Card.Root>
</InnerLayout>
