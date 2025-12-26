<script lang="ts">
  import { Checkbox } from "$lib/components/ui/checkbox";
  import { Input } from "$lib/components/ui/input";
  import Button from "$lib/components/ui/button/button.svelte";
  import { Rainbow as Loader } from "svelte-loading-spinners";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import type { Trackings } from "$lib/server/db/schema";
  import Estado from "../estado.svelte";

  let {
    facturaIds,
    trackings,
  }: {
    facturaIds: number | number[];
    trackings: Partial<Trackings>[];
  } = $props();

  let selectedTrackings = $state<number[]>([]);
  let selectionMode = $state<"retirado" | "no_retirado" | null>(null);
  let isUpdatingTrackings = $state<boolean>(false);
  let scannerInput = $state<string>("");

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

  function canSelectTracking(tracking: Partial<Trackings>): boolean {
    if (selectedTrackings.length === 0) return true;
    return selectionMode === (tracking.retirado ? "retirado" : "no_retirado");
  }

  function handleScannerInput(
    event: KeyboardEvent & { currentTarget: HTMLInputElement }
  ) {
    if (event.key === "Enter") {
      const scannedTracking = event.currentTarget.value.trim();
      const tracking = trackings.find(
        (t) => t.numeroTracking === scannedTracking
      );

      if (tracking && tracking.trackingId !== undefined) {
        const isSelected = selectedTrackings.includes(tracking.trackingId);
        if (!isSelected && canSelectTracking(tracking)) {
          handleTrackingSelection(
            tracking.trackingId,
            true,
            tracking.retirado ?? false
          );
        }
      }

      // Reset input
      event.currentTarget.value = "";
      scannerInput = "";
    }
  }
</script>

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
        name="facturaIds"
        value={JSON.stringify(
          Array.isArray(facturaIds) ? facturaIds : [facturaIds]
        )}
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
    {#each trackings as tracking}
      {@const isSelectable = canSelectTracking(tracking)}
      <div
        class="flex items-center justify-between p-4 border rounded-lg transition-colors"
        class:hover:bg-muted-50={isSelectable}
        class:cursor-pointer={isSelectable}
        class:opacity-50={!isSelectable && selectedTrackings.length > 0}
        class:bg-muted={tracking.trackingId !== undefined && selectedTrackings.includes(tracking.trackingId)}
        onclick={() => {
          if (isSelectable && tracking.trackingId !== undefined) {
            const checked = !selectedTrackings.includes(tracking.trackingId);
            handleTrackingSelection(
              tracking.trackingId,
              checked,
              tracking.retirado ?? false
            );
          }
        }}
        onkeydown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            if (isSelectable && tracking.trackingId !== undefined) {
              const checked = !selectedTrackings.includes(tracking.trackingId);
              handleTrackingSelection(
                tracking.trackingId,
                checked,
                tracking.retirado ?? false
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
            checked={tracking.trackingId !== undefined && selectedTrackings.includes(tracking.trackingId)}
            disabled={!isSelectable}
            onCheckedChange={(checked) => {
              if (tracking.trackingId !== undefined) {
                handleTrackingSelection(
                  tracking.trackingId,
                  checked,
                  tracking.retirado ?? false
                );
              }
            }}
          />
          <div>
            <div class="font-medium">{tracking.numeroTracking}</div>
            <div class="flex gap-3 text-sm text-muted-foreground">
              <div>
                Peso (lbs): {tracking.peso}
              </div>
              <div>
                Precio: ${tracking.precio!.toFixed(2)}
              </div>
              {#if typeof facturaIds === "object"}
                <div>
                  Factura: {tracking.facturaId}
                </div>
              {/if}
            </div>
          </div>
        </div>
        <div class="text-sm">
          <Estado variant={tracking.retirado ? "success" : "destructive"} />
        </div>
      </div>
    {/each}
  </div>
</div>
