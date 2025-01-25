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
    let completedCount = 0;

    try {
      for (const facturaId of selectedFacturas) {
        try {
          await fetch("/api/emails/facturas", {
            method: "POST",
            body: JSON.stringify({ facturaId }),
          });
          completedCount++;
          toast.loading(
            `Enviando facturas... (${completedCount}/${selectedFacturas.length})`,
            {
              id: toastId,
            }
          );
        } catch (error) {
          console.error(`Error sending email for factura ${facturaId}:`, error);
          toast.error(`Error al enviar factura ${facturaId}`);
        }
      }

      if (completedCount === selectedFacturas.length) {
        toast.success("Todas las facturas fueron enviadas exitosamente", {
          id: toastId,
        });
        // Refresh the page to update the list
        window.location.reload();
      } else {
        toast.error(
          `Se enviaron ${completedCount} de ${selectedFacturas.length} facturas`,
          { id: toastId }
        );
      }
    } catch (error) {
      console.error("Error sending emails:", error);
      toast.error("Error al enviar las facturas", { id: toastId });
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
