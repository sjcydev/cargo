<script lang="ts">
  import Ellipsis from "lucide-svelte/icons/ellipsis";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { UserPen, Trash2, Receipt } from "lucide-svelte";
  import { enhance } from "$app/forms";
  import DeleteDialog from "$lib/components/delete-dialog.svelte";
  import { goto, invalidate, invalidateAll } from "$app/navigation";

  let { id }: { id: string } = $props();
  let showCancelDialog = $state(false);
</script>

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
      <a href="/facturas/{id}" class="flex gap-2">
        <Receipt /> Ver Factura
      </a>
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item
      class="text-red-500 data-[highlighted]:text-white data-[highlighted]:bg-red-500"
    >
      <button class="flex gap-2" onclick={() => (showCancelDialog = true)}>
        <Trash2 /> Cancelar
      </button>
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

<DeleteDialog
  bind:open={showCancelDialog}
  title="Cancelar Factura"
  description={`¿Estás seguro que deseas cancelar la factura N° ${id}? Esta acción no se puede deshacer.`}
  action="?/cancelFactura"
  itemId={id}
  buttonName="Cancelar Factura"
  onSuccess={async () => {
    window.location.reload();
  }}
/>
