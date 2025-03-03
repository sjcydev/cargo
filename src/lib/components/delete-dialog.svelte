<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { enhance } from "$app/forms";

  // export let open = false;
  // export let title = "Eliminar";
  // export let description = "¿Estás seguro que deseas eliminar este elemento?";
  // export let action = "";
  // export let itemId: string | number;
  // export let onSuccess: () => void;

  let {
    open = $bindable(false),
    title = "Eliminar",
    description = "¿Estás seguro que deseas eliminar este elemento?",
    action = "",
    itemId,
    onSuccess,
  }: {
    open: boolean;
    title: string;
    description: string;
    action: string;
    itemId: string | number;
    onSuccess: () => void;
  } = $props();
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Description>
        {description}
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <form
        method="POST"
        {action}
        use:enhance={() => {
          return async ({ result }) => {
            if (result.type === "success") {
              open = false;
              onSuccess();
            }
          };
        }}
      >
        <input type="hidden" name="reporteId" value={itemId} />
        <div class="flex gap-2 justify-end">
          <Button
            variant="outline"
            onclick={() => (open = false)}
            type="button"
          >
            Cancelar
          </Button>
          <Button variant="destructive" type="submit">Eliminar</Button>
        </div>
      </form>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
