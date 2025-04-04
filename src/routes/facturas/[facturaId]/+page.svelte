<script lang="ts">
  import type { PageData } from "./$types";
  import InnerLayout from "$lib/components/inner-layout.svelte";
  import * as Card from "$lib/components/ui/card";
  import Button from "$lib/components/ui/button/button.svelte";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import { Download, Send } from "lucide-svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import ClienteInfo from "$lib/facturacion/facturas/components/cliente-info.svelte";
  import MetodoPago from "$lib/facturacion/facturas/components/metodo-pago.svelte";
  import TrackingList from "$lib/facturacion/facturas/components/tracking-list.svelte";
  import FacturaHeader from "$lib/facturacion/facturas/components/factura-header.svelte";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import { generateInvoice } from "$lib/facturacion/facturar/generatePDF";

  let { data }: { data: PageData } = $props();
  let showCancelDialog = $state<boolean>(false);

  async function enviarFactura() {
    try {
      await fetch("/api/emails/facturas", {
        method: "POST",
        body: JSON.stringify({ facturaId: data.factura.facturaId }),
      });
    } catch (error) {
      console.error("Error sending emails:", error);
    }

    toast.success("Factura enviada correctamente");
  }

  async function downloadFactura() {
    await generateInvoice({
      info: data.factura,
      cliente: data.factura.cliente!,
      company: data.company!,
      logo: data.logo!,
      descargar: true,
    });
  }
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
  <Button class="font-semibold" onclick={downloadFactura}
    >Descargar <Download /></Button
  >
{/snippet}

<Dialog.Root bind:open={showCancelDialog}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Cancelar Factura</Dialog.Title>
      <Dialog.Description>
        ¿Estás seguro que deseas cancelar la factura N° {data.factura
          .facturaId}? Esta acción no se puede deshacer.
      </Dialog.Description>
    </Dialog.Header>
    <div class="flex justify-end gap-4">
      <Button variant="outline" onclick={() => (showCancelDialog = false)}>
        Cancelar
      </Button>
      <form
        method="POST"
        action="?/cancelFactura"
        use:enhance={() => {
          return async ({ result }) => {
            if (result.type === "success") {
              showCancelDialog = false;
              await invalidateAll();
            }
          };
        }}
      >
        <input type="hidden" name="facturaId" value={data.factura.facturaId} />
        <Button variant="destructive" type="submit">Confirmar</Button>
      </form>
    </div>
  </Dialog.Content>
</Dialog.Root>

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
