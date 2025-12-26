<script lang="ts">
  import type { PageData } from "./$types";
  import InnerLayout from "$lib/components/inner-layout.svelte";
  import * as Card from "$lib/components/ui/card";
  import Button from "$lib/components/ui/button/button.svelte";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import {Loader2, Download, Send } from "lucide-svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import ClienteInfo from "$lib/facturacion/facturas/components/cliente-info.svelte";
  import MetodoPago from "$lib/facturacion/facturas/components/metodo-pago.svelte";
  import TrackingList from "$lib/facturacion/facturas/components/tracking-list.svelte";
  import FacturaHeader from "$lib/facturacion/facturas/components/factura-header.svelte";
  import { enhance } from "$app/forms";
  import { goto, invalidateAll } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import DeleteDialog from "$lib/components/delete-dialog.svelte";
  import DownloadDialog from "$lib/components/download-dialog.svelte";

  let { data }: { data: PageData } = $props();
  let showCancelDialog = $state<boolean>(false);

  async function enviarFactura() {
    const toastId = toast.loading("Enviando factura...");

    try {
      const response = await fetch("/api/emails/facturas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ facturaIds: [data.factura.facturaId] }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al enviar la factura");
      }

      if (result.failed > 0) {
        toast.error(`Error al enviar la factura: ${result.details[0].error}`, {
          id: toastId,
        });
      } else {
        toast.success("Factura enviada correctamente", { id: toastId });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al enviar la factura";
      toast.error(errorMessage, { id: toastId });
    }
  }

  let descargando = $state(false);

  async function downloadFactura() {
    descargando = true;

    const url = `/api/facturas/download?facturaId=${data.factura.facturaId}`;

    const a = document.createElement('a');
    a.href = url;
    a.download = ''; // Let server headers set filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      descargando = false;
    }, 1600)
  }

  let showDownloadDialog = $state(false);
</script>

<svelte:head>
  <title>Detalles de Factura N° {data.factura.facturaId}</title>
</svelte:head>

{#snippet actions()}
  <Button variant="outline" class="font-semibold" onclick={enviarFactura}
    >{data.factura.enviado ? "Reenviar" : "Enviar"} <Send /></Button
  >
  {#if data.user!.rol === "ADMIN"}
    <Button
      variant="destructive"
      class="font-semibold"
      onclick={() => (showCancelDialog = true)}
    >
      Cancelar Factura
    </Button>
  {/if}
  <Button onclick={() => showDownloadDialog = true} disabled={descargando}>
    {#if descargando}
      Descargando... <Loader2 class="my-2 h-4 w-4 animate-spin" />
    {:else}
      Descargar <Download />
    {/if}
  </Button>
{/snippet}

<DownloadDialog bind:open={showDownloadDialog} data={data} />

<DeleteDialog
  bind:open={showCancelDialog}
  title="Cancelar Factura"
  description={`¿Estás seguro que deseas cancelar la factura N° ${data.factura.facturaId}? Esta acción no se puede deshacer.`}
  action={`/facturas?/cancelFactura`}
  itemId={data.factura.facturaId}
  buttonName="Cancelar Factura"
  onSuccess={() => {
    goto("/facturas");
  }}
/>

<InnerLayout title="Detalles de Factura" back={true} {actions}>
  <div class="space-y-4">
    <Card.Root>
      <!-- <Card.Header>
        <Card.Title>
          Detalles de la Factura N° {data.factura.facturaId}
        </Card.Title>
      </Card.Header> -->
      <Card.Content class="space-y-6">
        <FacturaHeader factura={data.factura} />
        <Separator />
        <ClienteInfo cliente={data.factura.cliente!} />
        <Separator />
        <MetodoPago
          facturaIds={data.factura.facturaId}
          metodoDePago={data.factura.metodoDePago}
        />
        <Separator />
        <TrackingList
          facturaIds={data.factura.facturaId}
          trackings={data.factura.trackings}
        />
      </Card.Content>
    </Card.Root>
  </div>
</InnerLayout>
