<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { enhance } from "$app/forms";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
  } from "$lib/components/ui/select";
  import { Loader2, Download, Send } from "lucide-svelte";
  import type { Facturas } from "$lib/server/db";
  import { generateInvoice } from "$lib/facturacion/facturar/generatePDF";

  let {
    open = $bindable(false),
    title = "Descargar",
    description = "Elige el formato que quieras usar",
    buttonName = "Descargar",
    onSuccess,
    data,
  }: {
    open: boolean;
    title: string;
    description: string;
    buttonName?: string;
    data: any;
    onSuccess?: () => void | Promise<void>;
  } = $props();

  let selectedFormat = $state("Modern");

  const formats = ["Legacy", "Modern"];

  let descargando = $state(false);

  async function downloadFacturaModern() {
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
      open = false;
    }, 1600)
  }

  async function downloadLegacy() {
    descargando = true;
    await generateInvoice({
      info: data.factura,
      cliente: data.factura.cliente!,
      company: data.company!,
      logo: data.logo!,
      descargar: true,
    }).then(() => {descargando = false; open = false});
  }

  async function download() {
    if (selectedFormat === "Legacy") {
      await downloadLegacy();
    } else {
      await downloadFacturaModern();
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Description>
        {description}
      </Dialog.Description>
    </Dialog.Header>
    <div>
      <Select type="single" bind:value={selectedFormat}>
        <SelectTrigger >
          <div class="flex items-center justify-between">
            {#if selectedFormat}
              <span>
                {formats.find(
                  (f) => f === selectedFormat
                ) ?? "Elige un formato"}
              </span>
            {:else}
              <span>Elige un formato</span>
            {/if}
          </div>
        </SelectTrigger>
        <SelectContent>
          {#each formats as format}
            <SelectItem value={format}>
              {format}
            </SelectItem>
          {/each}
        </SelectContent>
    </Select>
    </div>
    <Dialog.Footer>
      <div class="flex gap-2 justify-end">
        <Button
          variant="outline"
          onclick={() => (open = false)}
          type="button"
        >
          Cancelar
        </Button>
        <Button onclick={download} disabled={descargando}>
          {#if descargando}
            Descargando... <Loader2 class="my-2 h-4 w-4 animate-spin" />
          {:else}
            Descargar <Download />
          {/if}
        </Button>
      </div>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
