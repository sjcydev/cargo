<script lang="ts">
  /**
   * Cliente Search Component
   * Handles the search input for finding clientes by casillero or codificacion
   */
  import * as Card from "$lib/components/ui/card";
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Rainbow as Loader } from "svelte-loading-spinners";

  type ClienteSearchProps = {
    casillero: string;
    searching: boolean;
    onInput: (value: string) => void;
  };

  let {
    casillero = $bindable(),
    searching,
    onInput,
  }: ClienteSearchProps = $props();
</script>

<Card.Root>
  <Card.Content class="px-6 py-5">
    <Label for="casillero" class="flex gap-1 items-center">
      Casillero
      {#if searching}
        <Loader color="#2563eb" size="20" unit="px" />
      {/if}
    </Label>
    <div class="flex gap-3 mt-1">
      <Input
        id="casillero"
        placeholder="Introduzca el Casillero del Cliente"
        bind:value={casillero}
        oninput={(e) => onInput(e.currentTarget.value)}
      />
      <Button>
        {#if searching}
          <div class="px-1">
            <Loader color="white" size="30" unit="px" />
          </div>
        {:else}
          <span class="px-[0.08rem]">Buscar</span>
        {/if}
      </Button>
    </div>
  </Card.Content>
</Card.Root>
