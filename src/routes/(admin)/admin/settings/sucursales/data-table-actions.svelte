<script lang="ts">
  import Ellipsis from "lucide-svelte/icons/ellipsis";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { UserPen, Trash2, Receipt, Pen } from "lucide-svelte";
  import { invalidateAll } from "$app/navigation";
  import DeleteDialog from "$lib/components/delete-dialog.svelte";

  let { id }: { id: string } = $props();
  let deleteDialogOpen = $state(false);
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
      <a href="/admin/settings/sucursales/{id}" class="flex gap-2">
        <Pen /> Editar
      </a>
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
