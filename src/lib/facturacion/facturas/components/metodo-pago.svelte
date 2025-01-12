<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Select from "$lib/components/ui/select";
  import { Rainbow as Loader } from "svelte-loading-spinners";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";

  let { facturaIds, metodoDePago }: { 
    facturaIds: number | number[];
    metodoDePago: "transferencia" | "efectivo" | "tarjeta" | "yappy" | "nulo"
  } = $props();

  let isUpdatingPago = $state<boolean>(false);
  let selectedMetodoPago = $state<typeof metodoDePago>(metodoDePago);

  const metodoPagoOptions = [
    { value: "efectivo", label: "Efectivo" },
    { value: "tarjeta", label: "Tarjeta" },
    { value: "yappy", label: "Yappy" },
    { value: "transferencia", label: "Transferencia" },
    { value: "nulo", label: "Nulo" },
  ] as const;
</script>

<div class="flex items-center justify-between mb-4">
  <h3 class="text-lg font-medium">Método de Pago</h3>
  <form
    method="POST"
    action="?/updateMetodoPago"
    class="flex gap-4"
    use:enhance={() => {
      isUpdatingPago = true;
      return async ({ result }) => {
        if (result.type === "success") {
          await invalidateAll();
        }
        isUpdatingPago = false;
      };
    }}
  >
    <input type="hidden" name="facturaIds" value={JSON.stringify(Array.isArray(facturaIds) ? facturaIds : [facturaIds])} />
    <Select.Root
      type="single"
      name="metodoPago"
      bind:value={selectedMetodoPago}
    >
      <Select.Trigger class="w-[180px]">
        {metodoPagoOptions.find((opt) => opt.value === selectedMetodoPago)
          ?.label || "Elige un método de pago"}
      </Select.Trigger>
      <Select.Content>
        {#each metodoPagoOptions as option}
          <Select.Item value={option.value}>{option.label}</Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
    <Button type="submit" disabled={isUpdatingPago}>
      {#if isUpdatingPago}
        <Loader color="white" size="30" unit="px" />
      {:else}
        Actualizar
      {/if}
    </Button>
  </form>
</div>
