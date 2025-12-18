<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { addressesSchema, type addressesType } from "../schema";
  import {
    superForm,
    type SuperValidated,
    type Infer,
  } from "sveltekit-superforms/client";
  import { zodClient } from "sveltekit-superforms/adapters";
  import * as Form from "$lib/components/ui/form";
  import type { Addresses } from "$lib/server/db/schema";
  import { Loader2 } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import { invalidateAll } from "$app/navigation";
  import CountrySelector from "../country-selector.svelte";

  let {
    data,
    address,
  }: { data: SuperValidated<Infer<addressesType>>; address: Addresses } =
    $props();

  const form = superForm(data, {
    validators: zodClient(addressesSchema),
    dataType: "json",
    onResult: ({ result }) => {
      if (result.type === "success") {
        toast.success("Cambios guardados exitosamente");
        invalidateAll();
      }
    },
  });

  const { form: formData, enhance, errors, submitting } = form;

  function handleCountryChange(callingCode: string) {
    // Update the telephone field with the country calling code
    $formData.tel = callingCode + " ";
  }
</script>

<form method="POST" use:enhance class="space-y-6">
  <input type="hidden" name="addressId" value={$formData.addressId} />
  <div class="mb-11">
    <Form.Field {form} name="name">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Nombre de la Dirección</Form.Label>
          <Input
            {...props}
            bind:value={$formData.name}
            placeholder="Oficina Principal, Almacén, etc."
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <div class="space-y-2">
      <label
        for="country"
        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >País</label
      >
      <CountrySelector
        bind:value={$formData.country}
        onCountryChange={handleCountryChange}
      />
      {#if $errors.country}
        <p class="text-destructive text-sm font-medium">{$errors.country}</p>
      {/if}
    </div>

    <Form.Field {form} name="address1">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Dirección Principal</Form.Label>
          <Input
            {...props}
            bind:value={$formData.address1}
            placeholder="Calle Principal #123"
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="address2">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Dirección Secundaria (Opcional)</Form.Label>
          <Input
            {...props}
            bind:value={$formData.address2}
            placeholder="Apartamento, Suite, etc."
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <div class="grid grid-cols-2 gap-4">
      <Form.Field {form} name="city">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Ciudad</Form.Label>
            <Input
              {...props}
              bind:value={$formData.city}
              placeholder="Panamá"
            />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>

      <Form.Field {form} name="zipcode">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Código Postal</Form.Label>
            <Input
              {...props}
              bind:value={$formData.zipcode}
              placeholder="00000"
            />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
    </div>

    <Form.Field {form} name="state">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Estado</Form.Label>
          <Input {...props} bind:value={$formData.state} placeholder="Panama" />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="tel">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Teléfono</Form.Label>
          <Input
            {...props}
            bind:value={$formData.tel}
            placeholder="+507 1234-5678"
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="suffix">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Sufijo (Opcional)</Form.Label>
          <Input
            {...props}
            bind:value={$formData.suffix}
            placeholder="ej. OCEAN"
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
  </div>

  <Button type="submit" class="w-full" disabled={$submitting}>
    {#if $submitting}
      <Loader2 class="mr-2 h-4 w-4 animate-spin" />
      <span>Guardando cambios...</span>
    {:else}
      Guardar Cambios
    {/if}
  </Button>
</form>
