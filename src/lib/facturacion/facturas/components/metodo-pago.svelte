<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Select from "$lib/components/ui/select";
  import { Rainbow as Loader } from "svelte-loading-spinners";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";

  let {
    facturaIds,
    metodoDePago,
  }: {
    facturaIds: number | number[];
    metodoDePago:
      | "transferencia"
      | "efectivo"
      | "tarjeta"
      | "yappy"
      | "otros"
      | "no_pagado";
  } = $props();

  let isUpdatingPago = $state<boolean>(false);
  let selectedMetodoPago = $state<typeof metodoDePago>(metodoDePago);

  const metodoPagoOptions = [
    { value: "efectivo", label: "Efectivo" },
    { value: "tarjeta", label: "Tarjeta" },
    { value: "yappy", label: "Yappy" },
    { value: "transferencia", label: "Transferencia" },
    { value: "otros", label: "Otros" },
    { value: "no_pagado", label: "No Pagado" },
  ] as const;

  function getMetodoPagoLabel(value: typeof metodoDePago) {
    return (
      metodoPagoOptions.find((opt) => opt.value === value)?.label ||
      "No especificado"
    );
  }
</script>

<div class="grid gap-4 p-4 bg-muted rounded-lg">
  <div class="flex items-center justify-between">
    <div>
      <p class="text-sm font-medium text-muted-foreground">
        Metodo de Pago Actual
      </p>
      <p class="text-base font-semibold">{getMetodoPagoLabel(metodoDePago)}</p>
    </div>

    <form
      method="POST"
      action="?/updateMetodoPago"
      class="flex gap-2"
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
      <input
        type="hidden"
        name="facturaIds"
        value={JSON.stringify(
          Array.isArray(facturaIds) ? facturaIds : [facturaIds]
        )}
      />
      <Select.Root
        type="single"
        name="metodoPago"
        bind:value={selectedMetodoPago}
      >
        <Select.Trigger class="w-[180px]">
          {getMetodoPagoLabel(selectedMetodoPago)}
        </Select.Trigger>
        <Select.Content>
          {#each metodoPagoOptions as option}
            <Select.Item value={option.value}>{option.label}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
      <Button
        type="submit"
        variant="default"
        size="sm"
        disabled={isUpdatingPago}
      >
        {#if isUpdatingPago}
          <Loader color="white" size="20" unit="px" />
        {:else}
          Actualizar
        {/if}
      </Button>
    </form>
  </div>
</div>
