<script lang="ts">
  import Ellipsis from "lucide-svelte/icons/ellipsis";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { Pencil, Trash2, Receipt } from "lucide-svelte";

  let { id }: { id: string } = $props();
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
    <DropdownMenu.Item onclick={() => navigator.clipboard.writeText(id)}>
      <Receipt /> Facturar
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item><Pencil /> Editar</DropdownMenu.Item>
    <DropdownMenu.Item
      class="text-red-500 data-[highlighted]:text-white data-[highlighted]:bg-red-500"
      ><Trash2 />Eliminar</DropdownMenu.Item
    >
  </DropdownMenu.Content>
</DropdownMenu.Root>
