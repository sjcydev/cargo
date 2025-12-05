<script lang="ts">
  /**
   * Tracking List Component
   * Displays list of trackings in a table with edit/delete actions
   */
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { PlusIcon, PencilIcon, TrashIcon } from "lucide-svelte";
  import type { NewTrackings } from "$lib/server/db/schema";
  import type { Snippet } from "svelte";

  type TrackingListProps = {
    trackings: NewTrackings[];
    total: number;
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
    addButton: Snippet;
  };

  let { trackings, total, onEdit, onDelete, addButton }: TrackingListProps =
    $props();
</script>

<Card.Title>
  <div class="flex justify-between items-center">
    <p class="text-xl">Paquetes</p>
    {@render addButton()}
  </div>
</Card.Title>

{#if trackings.length > 0}
  <div class="rounded-md border">
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>Tracking</Table.Head>
          <Table.Head>Peso (lbs)</Table.Head>
          <Table.Head>Precio/lb</Table.Head>
          <Table.Head>Total</Table.Head>
          <Table.Head class="text-right">Acciones</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each trackings as tracking, index}
          <Table.Row>
            <Table.Cell class="font-medium">
              {tracking.numeroTracking}
            </Table.Cell>
            <Table.Cell>{tracking.peso}</Table.Cell>
            <Table.Cell>${tracking.base?.toFixed(2)}</Table.Cell>
            <Table.Cell>${tracking.precio?.toFixed(2)}</Table.Cell>
            <Table.Cell class="text-right">
              <Button
                size="icon"
                variant="ghost"
                onclick={() => onEdit(index)}
              >
                <PencilIcon class="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onclick={() => onDelete(index)}
              >
                <TrashIcon class="h-4 w-4" />
              </Button>
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>

  <div class="flex justify-between items-center mt-4">
    <p class="text-lg font-semibold">
      Total de Paquetes: {trackings.length}
    </p>
    <p class="text-lg font-semibold">Total: ${total.toFixed(2)}</p>
  </div>
{:else}
  <p class="text-muted-foreground text-center py-8">
    No hay trackings agregados. Haga clic en "Añadir Tracking" para comenzar.
  </p>
{/if}
