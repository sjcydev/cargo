<script lang="ts">
  import type { Reportes } from "$lib/server/db/schema";
  import Ellipsis from "lucide-svelte/icons/ellipsis";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { FileText } from "lucide-svelte";
  import { Trash2 } from "lucide-svelte";
  import { invalidateAll } from "$app/navigation";
  import DeleteDialog from "$lib/components/delete-dialog.svelte";

  let { reporte, user }: { reporte: Reportes; user: { rol: string } } = $props();
  let deleteDialogOpen = $state(false);
</script>

<DeleteDialog
  bind:open={deleteDialogOpen}
  title="Eliminar Reporte"
  description={`¿Estás seguro que deseas eliminar el reporte N° ${reporte.reporteId}? Esta acción no se puede deshacer.`}
  action="/reportes?/delete"
  itemId={reporte.reporteId}
  onSuccess={() => invalidateAll()}
/>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="ghost"
        size="icon"
        class="relative size-8 p-0"
      >
        <span class="sr-only">Open menu</span>
        <Ellipsis class="size-4" />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item>
      <a href="/reportes/{reporte.reporteId}" class="flex gap-2">
        <FileText /> Ver Detalles
      </a>
    </DropdownMenu.Item>

    {#if user.rol === "ADMIN"}
      <DropdownMenu.Item
        class="text-red-500 data-[highlighted]:text-white data-[highlighted]:bg-red-500"
      >
        <button class="flex gap-2" onclick={() => (deleteDialogOpen = true)}>
          <Trash2 />
          Eliminar
        </button>
      </DropdownMenu.Item>
    {/if}
  </DropdownMenu.Content>
</DropdownMenu.Root>
