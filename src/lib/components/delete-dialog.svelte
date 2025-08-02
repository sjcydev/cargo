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
    buttonName = "Eliminar",
    onSuccess,
  }: {
    open: boolean;
    title: string;
    description: string;
    action: string;
    itemId: string | number;
    buttonName?: string;
    onSuccess: () => void | Promise<void>;
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
          console.log("form");
          return async ({ result }) => {
            if (result.type === "success") {
              open = false;
              if (onSuccess) {
                await onSuccess();
              }
            }
          };
        }}
      >
        <input type="hidden" name="id" value={itemId} />
        <div class="flex gap-2 justify-end">
          <Button
            variant="outline"
            onclick={() => (open = false)}
            type="button"
          >
            Cancelar
          </Button>
          <Button variant="destructive" type="submit">{buttonName}</Button>
        </div>
      </form>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
