<script lang="ts">
  import type { PageData } from "./$types";
  import InnerLayout from "$lib/components/inner-layout.svelte";
  import VerFacturas from "$lib/facturacion/facturas/ver-facturas.svelte";
  import { Button } from "$lib/components/ui/button";
  import { columns } from "./columns";
  import { toast } from "svelte-sonner";

  let { data: pageData }: { data: PageData } = $props();
  let { facturas: data } = pageData;
  let selectedFacturas = $state<number[]>([]);

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
        throw new Error(result.error || "Error al enviar las facturas");
      }

      if (result.failed > 0) {
        const failedDetails = result.details
          .map((d: { facturaId: number; error: string }) => `Factura ${d.facturaId}: ${d.error}`)
          .join("\n");

        toast.error(
          `Se enviaron ${result.successful} de ${result.successful + result.failed} facturas.\n\nErrores:\n${failedDetails}`,
          { id: toastId }
        );
      } else {
        toast.success(
          `Se enviaron exitosamente ${result.successful} facturas`,
          { id: toastId }
        );
        // Refresh the page to update the list
        window.location.reload();
      }
    } catch (error) {
      console.error("Error sending emails:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al enviar las facturas";
      toast.error(errorMessage, {
        id: toastId,
      });
    }
  }

  function onSelectionChange(selected: number[]) {
    selectedFacturas = selected;
  }
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
    <Button href="/facturas/facturar">Facturar</Button>
  </div>
{/snippet}

<InnerLayout title={"Facturas No Enviadas"} {actions}>
  <VerFacturas {data} {columns} selectionChange={onSelectionChange} />
</InnerLayout>
