<script lang="ts">
  /**
   * Tracking Dialog Component
   * Handles adding and editing tracking numbers
   */
  import * as Dialog from "$lib/components/ui/dialog";
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import type { Tracking } from "$lib/facturacion/facturar/types";
  import type { NewTrackings } from "$lib/server/db/schema";

  type TrackingDialogProps = {
    open: boolean;
    editMode: boolean;
    tracking: Tracking | NewTrackings;
    currPrecio: number;
    fileContent: string[];
    uploadingFile: boolean;
    onSubmit: () => void;
    onOpenChange: (open: boolean) => void;
    onFileUpload: (event: Event) => void;
  };

  let {
    open = $bindable(),
    editMode,
    tracking = $bindable(),
    currPrecio,
    fileContent,
    uploadingFile,
    onSubmit,
    onOpenChange,
    onFileUpload,
  }: TrackingDialogProps = $props();
</script>

<Dialog.Root bind:open {onOpenChange}>
  <Dialog.Content class="sm:max-w-[425px]">
    <form
      method="POST"
      onsubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Dialog.Header>
        <Dialog.Title>{editMode ? "Editar" : "Añadir"} Tracking</Dialog.Title>
      </Dialog.Header>

      <div class="grid gap-2 mb-1">
        <Label for="numero-tracking" class="text-left">
          Número de Tracking
        </Label>
        <Input
          id="numero-tracking"
          bind:value={tracking.numeroTracking}
          placeholder="Introduzca el número de tracking"
          required
        />

        <Label for="peso" class="text-left">
          Peso (lbs)
        </Label>
        <Input
          id="peso"
          type="number"
          step="0.01"
          min="0.01"
          bind:value={tracking.peso}
          placeholder="Peso en libras"
          required
        />

        <Label for="base" class="text-left">
          Precio Base ($)
        </Label>
        <Input
          id="base"
          type="number"
          step="0.01"
          min="0.01"
          bind:value={tracking.base}
          placeholder="Precio por libra"
          required
        />

        <Label for="precio-total" class="text-left">
          Precio Total
        </Label>
        <Input
          id="precio-total"
          type="number"
          step="0.01"
          value={currPrecio}
          readonly
          class="focus-visible:ring-0"
        />

        {#if !editMode}
          <div class="mt-2">
            <Label for="file-upload" class="text-left">
              Cargar desde archivo (opcional)
            </Label>
            <Input
              id="file-upload"
              type="file"
              accept=".txt,.csv"
              onchange={onFileUpload}
              disabled={uploadingFile}
            />
            {#if uploadingFile}
              <p class="text-sm text-muted-foreground mt-1">
                Procesando archivo...
              </p>
            {/if}
            {#if fileContent.length > 0}
              <p class="text-sm text-green-600 mt-1">
                {fileContent.length} trackings cargados
              </p>
            {/if}
          </div>
        {/if}
      </div>

      <Dialog.Footer>
        <Button type="submit">
          {editMode ? "Guardar Cambios" : "Añadir"}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
