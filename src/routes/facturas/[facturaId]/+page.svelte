<script lang="ts">
  import type { PageData } from "./$types";
  import InnerLayout from "$lib/components/inner-layout.svelte";
  import * as Card from "$lib/components/ui/card";
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Select from "$lib/components/ui/select";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import Estado from "$lib/facturacion/facturas/estado.svelte";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import { Rainbow as Loader } from "svelte-loading-spinners";
  import { Download, Send } from "lucide-svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import { generateInvoice } from "$lib/facturacion/facturar/generatePDF";
  import type { Usuarios } from "$lib/server/db/schema";

  let { data }: { data: PageData } = $props();
  let selectedTrackings = $state<number[]>([]);
  let selectionMode = $state<"retirado" | "no_retirado" | null>(null);
  let selectedMetodoPago = $state<string>(data.factura.metodoDePago);
  let isUpdatingPago = $state<boolean>(false);
  let isUpdatingTrackings = $state<boolean>(false);
  let scannerInput = $state<string>("");
  let showCancelDialog = $state<boolean>(false);

  const metodoPagoOptions = [
    { value: "efectivo", label: "Efectivo" },
    { value: "tarjeta", label: "Tarjeta" },
    { value: "yappy", label: "Yappy" },
    { value: "transferencia", label: "Transferencia" },
    { value: "nulo", label: "Nulo" },
  ];

  function handleTrackingSelection(
    trackingId: number,
    checked: boolean,
    isRetirado: boolean
  ) {
    if (checked) {
      if (selectedTrackings.length === 0) {
        selectionMode = isRetirado ? "retirado" : "no_retirado";
      }
      selectedTrackings = [...selectedTrackings, trackingId];
    } else {
      selectedTrackings = selectedTrackings.filter((id) => id !== trackingId);
      if (selectedTrackings.length === 0) {
        selectionMode = null;
      }
    }
  }

  function canSelectTracking(tracking: any): boolean {
    if (selectedTrackings.length === 0) return true;
    return selectionMode === (tracking.retirado ? "retirado" : "no_retirado");
  }

  function handleScannerInput(
    event: KeyboardEvent & { currentTarget: HTMLInputElement }
  ) {
    if (event.key === "Enter") {
      const scannedTracking = event.currentTarget.value.trim();
      const tracking = data.factura.trackings.find(
        (t) => t.numeroTracking === scannedTracking
      );

      if (tracking) {
        const isSelected = selectedTrackings.includes(tracking.trackingId);
        if (!isSelected && canSelectTracking(tracking)) {
          handleTrackingSelection(
            tracking.trackingId,
            true,
            tracking.retirado!
          );
        }
      }

      // Reset input
      event.currentTarget.value = "";
      scannerInput = "";
    }
  }

  async function descargarFactura() {
    await generateInvoice(data.factura, data.factura.cliente as Usuarios, true);
  }
</script>

<svelte:head>
  <title>Detalles de Factura N° {data.factura.facturaId}</title>
</svelte:head>

{#snippet actions()}
  <Button variant="outline" class="font-semibold"
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
  <Button variant="success" class="font-semibold" onclick={descargarFactura}
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
      <Card.Header>
        <Card.Title>
          Detalles de la Factura N° {data.factura.facturaId}
          <div class="text-lg font-medium mt-1">
            Total: ${data.factura.total!.toFixed(2)}
          </div>
        </Card.Title>
      </Card.Header>
      <Card.Content class="space-y-6">
        <div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label>Factura N°</Label>
              <Input value={data.factura.facturaId} readonly />
            </div>
            <div>
              <Label>Fecha</Label>
              <Input value={data.factura.fecha} readonly />
            </div>
            <div>
              <Label>Total</Label>
              <Input value={`$${data.factura.total!.toFixed(2)}`} readonly />
            </div>

            <div>
              <Label>Estado</Label>
              <div class="flex gap-4 mt-2">
                <div class="flex items-center gap-2">
                  <span>Enviado:</span>
                  <Estado
                    variant={data.factura.enviado ? "success" : "destructive"}
                  />
                </div>
                <div class="flex items-center gap-2">
                  <span>Pagado:</span>
                  <Estado
                    variant={data.factura.pagado ? "success" : "destructive"}
                  />
                </div>
                <div class="flex items-center gap-2">
                  <span>Retirado:</span>
                  <Estado
                    variant={data.factura.retirados!
                      ? "success"
                      : "destructive"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 class="text-lg font-medium mb-4">Información del Cliente</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label>Cliente</Label>
              <Input
                value={`${data.factura.cliente!.nombre} ${data.factura.cliente!.apellido}`}
                readonly
              />
            </div>
            <div>
              <Label>Casillero</Label>
              <Input value={data.factura.cliente!.casillero} readonly />
            </div>
            <div>
              <Label>Cédula</Label>
              <Input value={data.factura.cliente!.cedula} readonly />
            </div>
            <div>
              <Label>Correo</Label>
              <Input value={data.factura.cliente!.correo} readonly />
            </div>
            <div>
              <Label>Sucursal</Label>
              <Input value={data.factura.cliente!.sucursal.sucursal} readonly />
            </div>
            <div>
              <Label>Tipo de Cliente</Label>
              <Input value={data.factura.cliente!.tipo} readonly />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium">Método de Pago</h3>
            <form
              method="POST"
              action="?/updateMetodoPago"
              class="flex gap-4"
              use:enhance={() => {
                isUpdatingPago = true;
                return async ({ result }) => {
                  if (result.type === "success") {
                    await invalidateAll();
                  }
                  isUpdatingPago = false;
                };
              }}
            >
              <input
                type="hidden"
                name="facturaId"
                value={data.factura.facturaId}
              />
              <Select.Root
                type="single"
                name="metodoPago"
                bind:value={selectedMetodoPago}
              >
                <Select.Trigger class="w-[180px]">
                  {metodoPagoOptions.find(
                    (opt) => opt.value === selectedMetodoPago
                  )?.label || "Elige un método de pago"}
                </Select.Trigger>
                <Select.Content>
                  {#each metodoPagoOptions as option}
                    <Select.Item value={option.value}
                      >{option.label}</Select.Item
                    >
                  {/each}
                </Select.Content>
              </Select.Root>
              <Button type="submit" disabled={isUpdatingPago}>
                {#if isUpdatingPago}
                  <Loader color="white" size="30" unit="px" />
                {:else}
                  Actualizar
                {/if}
              </Button>
            </form>
          </div>
        </div>

        <Separator />

        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium">Trackings</h3>
            <form
              method="POST"
              action="?/updateTrackings"
              use:enhance={() => {
                isUpdatingTrackings = true;
                return async ({ result }) => {
                  if (result.type === "success") {
                    selectedTrackings = [];
                    selectionMode = null;
                    await invalidateAll();
                  }
                  isUpdatingTrackings = false;
                };
              }}
            >
              <input
                type="hidden"
                name="facturaId"
                value={data.factura.facturaId}
              />
              <input
                type="hidden"
                name="trackingIds"
                value={JSON.stringify(selectedTrackings)}
              />
              <input
                type="hidden"
                name="setRetirado"
                value={selectionMode === "no_retirado"}
              />
              <Button
                type="submit"
                disabled={selectedTrackings.length === 0 || isUpdatingTrackings}
                variant={selectedTrackings.length === 0 ? "outline" : "default"}
              >
                {#if isUpdatingTrackings}
                  <Loader color="white" size="30" unit="px" />
                {:else}
                  {selectionMode === "retirado"
                    ? "Marcar como No Retirados"
                    : "Marcar como Retirados"}
                {/if}
              </Button>
            </form>
          </div>

          <div class="mb-4">
            <Input
              type="text"
              placeholder="Marcar Trackings"
              bind:value={scannerInput}
              onkeydown={handleScannerInput}
              class="w-full"
            />
          </div>

          <div class="space-y-4">
            {#each data.factura.trackings as tracking}
              {@const isSelectable = canSelectTracking(tracking)}
              <div
                class="flex items-center justify-between p-4 border rounded-lg transition-colors"
                class:hover:bg-muted-50={isSelectable}
                class:cursor-pointer={isSelectable}
                class:opacity-50={!isSelectable && selectedTrackings.length > 0}
                class:bg-muted={selectedTrackings.includes(tracking.trackingId)}
                onclick={() => {
                  if (isSelectable) {
                    const checked = !selectedTrackings.includes(
                      tracking.trackingId
                    );
                    handleTrackingSelection(
                      tracking.trackingId,
                      checked,
                      tracking.retirado!
                    );
                  }
                }}
                onkeydown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    if (isSelectable) {
                      const checked = !selectedTrackings.includes(
                        tracking.trackingId
                      );
                      handleTrackingSelection(
                        tracking.trackingId,
                        checked,
                        tracking.retirado!
                      );
                    }
                  }
                }}
                role="button"
                tabindex={isSelectable ? 0 : -1}
                aria-disabled={!isSelectable}
              >
                <div class="flex items-center gap-4">
                  <Checkbox
                    checked={selectedTrackings.includes(tracking.trackingId)}
                    disabled={!isSelectable}
                    onCheckedChange={(checked) =>
                      handleTrackingSelection(
                        tracking.trackingId,
                        checked,
                        tracking.retirado!
                      )}
                  />
                  <div>
                    <div class="font-medium">{tracking.numeroTracking}</div>
                    <div class="text-sm text-muted-foreground">
                      Peso: {tracking.peso} lbs - Total: ${tracking.precio!.toFixed(
                        2
                      )}
                    </div>
                  </div>
                </div>
                <Estado
                  variant={tracking.retirado ? "success" : "destructive"}
                />
              </div>
            {/each}
          </div>
        </div>
      </Card.Content>
    </Card.Root>
  </div>
</InnerLayout>
