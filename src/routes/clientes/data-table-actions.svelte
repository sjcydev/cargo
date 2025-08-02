<script lang="ts">
  import Ellipsis from "lucide-svelte/icons/ellipsis";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { UserPen, Trash2, Receipt } from "lucide-svelte";
  import { invalidateAll } from "$app/navigation";
  import DeleteDialog from "$lib/components/delete-dialog.svelte";

  let { id, nombre }: { id: string; nombre: string } = $props();
  let deleteDialogOpen = $state(false);
</script>

<DeleteDialog
  bind:open={deleteDialogOpen}
  title="Eliminar Cliente"
  description={`¿Estás seguro que deseas eliminar el cliente ${nombre}? Esta acción no se puede deshacer.`}
  action="?/delete"
  itemId={id}
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
      <a href="/facturas/facturar/?search={id}" class="flex gap-2">
        <Receipt /> Facturar
      </a>
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item>
      <a href="/clientes/{id}" class="flex gap-2">
        <UserPen /> Perfil
      </a>
    </DropdownMenu.Item>
    <DropdownMenu.Item
      class="text-red-500 data-[highlighted]:text-white data-[highlighted]:bg-red-500"
    >
      <button
        class="flex gap-2"
        onclick={() => (deleteDialogOpen = true)}
        tabindex="-1"
      >
        <Trash2 /> Eliminar
      </button>
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
