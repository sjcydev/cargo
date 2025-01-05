<script lang="ts">
  import Ellipsis from "lucide-svelte/icons/ellipsis";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { UserPen, Trash2, Receipt } from "lucide-svelte";
  import { enhance } from "$app/forms";

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
    <DropdownMenu.Item>
      <a href="/facturas/facturar/?search={id}" class="flex gap-2">
        <Receipt /> Facturar
      </a>
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item
      ><a href="/clientes/{id}" class="flex gap-2"><UserPen /> Perfil</a
      ></DropdownMenu.Item
    >
    <DropdownMenu.Item
      class="text-red-500 data-[highlighted]:text-white data-[highlighted]:bg-red-500"
      ><form method="POST" action="?/delete" use:enhance>
        <input type="hidden" name="id" value={id} />
        <button class="flex gap-2"><Trash2 /> Eliminar</button>
      </form></DropdownMenu.Item
    >
  </DropdownMenu.Content>
</DropdownMenu.Root>
